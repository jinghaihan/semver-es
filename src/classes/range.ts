import type {
  ComparatorSet,
  ParsedOptions,
  RangeInput,
  RangeOptionsOrLoose,
  RangeSet,
} from '../types'
import { FLAG_INCLUDE_PRERELEASE, FLAG_LOOSE } from '../internal/constants'
import { debug } from '../internal/debug'
import { LRUCache as LRU } from '../internal/lrucache'
import { parseOptions } from '../internal/parse-options'
import {
  caretTrimReplace,
  comparatorTrimReplace,
  safeRe as re,
  t,
  tildeTrimReplace,
} from '../internal/re'
import { Comparator } from './comparator'
import { SemVer } from './semver'

const SPACE_CHARACTERS = /\s+/g
const SPACE_SPLIT_CHARACTERS = /\s+/
const cache = new LRU<string, ComparatorSet>()
const isNullSet = (c: Comparator): boolean => c.value === '<0.0.0-0'
const isAny = (c: Comparator): boolean => c.value === ''
const hasSemVer = (value: Comparator['semver']): value is SemVer => value !== Comparator.ANY

// hoisted class for cyclic dependency
export class Range {
  raw = ''
  loose = false
  options: ParsedOptions = {}
  includePrerelease = false
  set: RangeSet = []
  formatted: string | undefined

  constructor(range?: RangeInput, options?: RangeOptionsOrLoose) {
    const parsedOptions = parseOptions(options)

    if (range instanceof Range) {
      if (
        range.loose === !!parsedOptions.loose
        && range.includePrerelease === !!parsedOptions.includePrerelease
      ) {
        return range
      }
      else {
        return new Range(range.raw, parsedOptions)
      }
    }

    if (range instanceof Comparator) {
      // just put it in the set and return
      this.raw = range.value
      this.set = [[range]]
      this.formatted = undefined
      return this
    }

    this.options = parsedOptions
    this.loose = !!parsedOptions.loose
    this.includePrerelease = !!parsedOptions.includePrerelease
    const rangeString = typeof range === 'string' ? range : String(range)

    // First reduce all whitespace as much as possible so we do not have to rely
    // on potentially slow regexes like \s*. This is then stored and used for
    // future error messages as well.
    this.raw = rangeString.trim().replace(SPACE_CHARACTERS, ' ')

    // First, split on ||
    this.set = this.raw
      .split('||')
      // map the range to a 2d array of comparators
      .map(r => this.parseRange(r.trim()))
      // throw out any comparator lists that are empty
      // this generally means that it was not a valid range, which is allowed
      // in loose mode, but will still throw if the WHOLE range is invalid.
      .filter(c => c.length > 0)

    if (!this.set.length) {
      throw new TypeError(`Invalid SemVer Range: ${this.raw}`)
    }

    // if we have any that are not the null set, throw out null sets.
    if (this.set.length > 1) {
      // keep the first one, in case they're all null sets
      const first = this.set[0]
      this.set = this.set.filter(c => !isNullSet(c[0]))
      if (this.set.length === 0) {
        this.set = [first]
      }
      else if (this.set.length > 1) {
        // if we have any that are *, then the range is just *
        for (const c of this.set) {
          if (c.length === 1 && isAny(c[0])) {
            this.set = [c]
            break
          }
        }
      }
    }

    this.formatted = undefined
  }

  get range(): string {
    if (this.formatted === undefined) {
      this.formatted = ''
      for (let i = 0; i < this.set.length; i++) {
        if (i > 0) {
          this.formatted += '||'
        }
        const comps = this.set[i]
        for (let k = 0; k < comps.length; k++) {
          if (k > 0) {
            this.formatted += ' '
          }
          this.formatted += comps[k].toString().trim()
        }
      }
    }
    return this.formatted
  }

  format(): string {
    return this.range
  }

  toString(): string {
    return this.range
  }

  parseRange(range: string): ComparatorSet {
    // memoize range parsing for performance.
    // this is a very hot path, and fully deterministic.
    const memoOpts
      = (this.options.includePrerelease ? FLAG_INCLUDE_PRERELEASE : 0)
        | (this.options.loose ? FLAG_LOOSE : 0)
    const memoKey = `${memoOpts}:${range}`
    const cached = cache.get(memoKey)
    if (cached) {
      return cached
    }

    const loose = this.options.loose
    // `1.2.3 - 1.2.4` => `>=1.2.3 <=1.2.4`
    const hr = loose ? re[t.HYPHENRANGELOOSE] : re[t.HYPHENRANGE]
    range = range.replace(hr, hyphenReplace(!!this.options.includePrerelease))
    debug('hyphen replace', range)

    // `> 1.2.3 < 1.2.5` => `>1.2.3 <1.2.5`
    range = range.replace(re[t.COMPARATORTRIM], comparatorTrimReplace)
    debug('comparator trim', range)

    // `~ 1.2.3` => `~1.2.3`
    range = range.replace(re[t.TILDETRIM], tildeTrimReplace)
    debug('tilde trim', range)

    // `^ 1.2.3` => `^1.2.3`
    range = range.replace(re[t.CARETTRIM], caretTrimReplace)
    debug('caret trim', range)

    // At this point, the range is completely trimmed and
    // ready to be split into comparators.

    let rangeList = range
      .split(' ')
      .map(comp => parseComparator(comp, this.options))
      .join(' ')
      .split(SPACE_SPLIT_CHARACTERS)
      // >=0.0.0 is equivalent to *
      .map(comp => replaceGTE0(comp, this.options))

    if (loose) {
      // in loose mode, throw out any that are not valid comparators
      rangeList = rangeList.filter((comp) => {
        debug('loose invalid filter', comp, this.options)
        return !!comp.match(re[t.COMPARATORLOOSE])
      })
    }
    debug('range list', rangeList)

    // if any comparators are the null set, then replace with JUST null set
    // if more than one comparator, remove any * comparators
    // also, don't include the same comparator more than once
    const rangeMap = new Map<string, Comparator>()
    const comparators = rangeList.map(comp => new Comparator(comp, this.options))
    for (const comp of comparators) {
      if (isNullSet(comp)) {
        return [comp]
      }
      rangeMap.set(comp.value, comp)
    }
    if (rangeMap.size > 1 && rangeMap.has('')) {
      rangeMap.delete('')
    }

    const result = [...rangeMap.values()]
    cache.set(memoKey, result)
    return result
  }

  intersects(range?: RangeInput, options?: RangeOptionsOrLoose): boolean {
    if (!(range instanceof Range)) {
      throw new TypeError('a Range is required')
    }

    return this.set.some((thisComparators) => {
      return (
        isSatisfiable(thisComparators, options)
        && range.set.some((rangeComparators) => {
          return (
            isSatisfiable(rangeComparators, options)
            && thisComparators.every((thisComparator) => {
              return rangeComparators.every((rangeComparator) => {
                return thisComparator.intersects(rangeComparator, options)
              })
            })
          )
        })
      )
    })
  }

  // if ANY of the sets match ALL of its comparators, then pass
  test(version: unknown): boolean {
    if (!version) {
      return false
    }

    let semverVersion: SemVer
    if (typeof version === 'string') {
      try {
        semverVersion = new SemVer(version, this.options)
      }
      catch {
        return false
      }
    }
    else if (version instanceof SemVer) {
      semverVersion = version
    }
    else {
      return false
    }

    for (let i = 0; i < this.set.length; i++) {
      if (testSet(this.set[i], semverVersion, this.options)) {
        return true
      }
    }
    return false
  }
}

// take a set of comparators and determine whether there
// exists a version which can satisfy it
function isSatisfiable(comparators: ComparatorSet, options?: RangeOptionsOrLoose): boolean {
  let result = true
  const remainingComparators = comparators.slice()
  let testComparator = remainingComparators.pop()

  while (result && remainingComparators.length) {
    const currentComparator = testComparator
    if (!currentComparator) {
      break
    }
    result = remainingComparators.every((otherComparator) => {
      return currentComparator.intersects(otherComparator, options)
    })

    testComparator = remainingComparators.pop()
  }

  return result
}

// comprised of xranges, tildes, stars, and gtlt's at this point.
// already replaced the hyphen ranges
// turn into a set of JUST comparators.
function parseComparator(comp: string, options: ParsedOptions): string {
  comp = comp.replace(re[t.BUILD], '')
  debug('comp', comp, options)
  comp = replaceCarets(comp, options)
  debug('caret', comp)
  comp = replaceTildes(comp, options)
  debug('tildes', comp)
  comp = replaceXRanges(comp, options)
  debug('xrange', comp)
  comp = replaceStars(comp, options)
  debug('stars', comp)
  return comp
}

function isX(id: unknown): boolean {
  return !id || (typeof id === 'string' && (id.toLowerCase() === 'x' || id === '*'))
}

// ~, ~> --> * (any, kinda silly)
// ~2, ~2.x, ~2.x.x, ~>2, ~>2.x ~>2.x.x --> >=2.0.0 <3.0.0-0
// ~2.0, ~2.0.x, ~>2.0, ~>2.0.x --> >=2.0.0 <2.1.0-0
// ~1.2, ~1.2.x, ~>1.2, ~>1.2.x --> >=1.2.0 <1.3.0-0
// ~1.2.3, ~>1.2.3 --> >=1.2.3 <1.3.0-0
// ~1.2.0, ~>1.2.0 --> >=1.2.0 <1.3.0-0
// ~0.0.1 --> >=0.0.1 <0.1.0-0
function replaceTildes(comp: string, options: ParsedOptions): string {
  return comp
    .trim()
    .split(SPACE_SPLIT_CHARACTERS)
    .map(c => replaceTilde(c, options))
    .join(' ')
}

function replaceTilde(comp: string, options: ParsedOptions): string {
  const r = options.loose ? re[t.TILDELOOSE] : re[t.TILDE]
  return comp.replace(
    r,
    (_match: string, M: string | undefined, m: string | undefined, p: string | undefined, pr: string | undefined): string => {
      debug('tilde', comp, _match, M, m, p, pr)
      let ret: string
      const major = String(M)
      const minor = String(m)
      const patch = String(p)

      if (isX(M)) {
        ret = ''
      }
      else if (isX(m)) {
        ret = `>=${major}.0.0 <${Number(major) + 1}.0.0-0`
      }
      else if (isX(p)) {
        // ~1.2 == >=1.2.0 <1.3.0-0
        ret = `>=${major}.${minor}.0 <${major}.${Number(minor) + 1}.0-0`
      }
      else if (pr) {
        debug('replaceTilde pr', pr)
        ret = `>=${major}.${minor}.${patch}-${pr
        } <${major}.${Number(minor) + 1}.0-0`
      }
      else {
        // ~1.2.3 == >=1.2.3 <1.3.0-0
        ret = `>=${major}.${minor}.${patch
        } <${major}.${Number(minor) + 1}.0-0`
      }

      debug('tilde return', ret)
      return ret
    },
  )
}

// ^ --> * (any, kinda silly)
// ^2, ^2.x, ^2.x.x --> >=2.0.0 <3.0.0-0
// ^2.0, ^2.0.x --> >=2.0.0 <3.0.0-0
// ^1.2, ^1.2.x --> >=1.2.0 <2.0.0-0
// ^1.2.3 --> >=1.2.3 <2.0.0-0
// ^1.2.0 --> >=1.2.0 <2.0.0-0
// ^0.0.1 --> >=0.0.1 <0.0.2-0
// ^0.1.0 --> >=0.1.0 <0.2.0-0
function replaceCarets(comp: string, options: ParsedOptions): string {
  return comp
    .trim()
    .split(SPACE_SPLIT_CHARACTERS)
    .map(c => replaceCaret(c, options))
    .join(' ')
}

function replaceCaret(comp: string, options: ParsedOptions): string {
  debug('caret', comp, options)
  const r = options.loose ? re[t.CARETLOOSE] : re[t.CARET]
  const z = options.includePrerelease ? '-0' : ''
  return comp.replace(
    r,
    (_match: string, M: string | undefined, m: string | undefined, p: string | undefined, pr: string | undefined): string => {
      debug('caret', comp, _match, M, m, p, pr)
      let ret: string
      const major = String(M)
      const minor = String(m)
      const patch = String(p)

      if (isX(M)) {
        ret = ''
      }
      else if (isX(m)) {
        ret = `>=${major}.0.0${z} <${Number(major) + 1}.0.0-0`
      }
      else if (isX(p)) {
        if (major === '0') {
          ret = `>=${major}.${minor}.0${z} <${major}.${Number(minor) + 1}.0-0`
        }
        else {
          ret = `>=${major}.${minor}.0${z} <${Number(major) + 1}.0.0-0`
        }
      }
      else if (pr) {
        debug('replaceCaret pr', pr)
        if (major === '0') {
          if (minor === '0') {
            ret = `>=${major}.${minor}.${patch}-${pr
            } <${major}.${minor}.${Number(patch) + 1}-0`
          }
          else {
            ret = `>=${major}.${minor}.${patch}-${pr
            } <${major}.${Number(minor) + 1}.0-0`
          }
        }
        else {
          ret = `>=${major}.${minor}.${patch}-${pr
          } <${Number(major) + 1}.0.0-0`
        }
      }
      else {
        debug('no pr')
        if (major === '0') {
          if (minor === '0') {
            ret = `>=${major}.${minor}.${patch
            }${z} <${major}.${minor}.${Number(patch) + 1}-0`
          }
          else {
            ret = `>=${major}.${minor}.${patch
            }${z} <${major}.${Number(minor) + 1}.0-0`
          }
        }
        else {
          ret = `>=${major}.${minor}.${patch
          } <${Number(major) + 1}.0.0-0`
        }
      }

      debug('caret return', ret)
      return ret
    },
  )
}

function replaceXRanges(comp: string, options: ParsedOptions): string {
  debug('replaceXRanges', comp, options)
  return comp
    .split(SPACE_SPLIT_CHARACTERS)
    .map(c => replaceXRange(c, options))
    .join(' ')
}

function replaceXRange(comp: string, options: ParsedOptions): string {
  comp = comp.trim()
  const r = options.loose ? re[t.XRANGELOOSE] : re[t.XRANGE]
  return comp.replace(
    r,
    (ret: string, gtlt: string, M: string | undefined, m: string | undefined, p: string | undefined, pr: string | undefined): string => {
      debug('xRange', comp, ret, gtlt, M, m, p, pr)
      const xM = isX(M)
      const xm = xM || isX(m)
      const xp = xm || isX(p)
      const anyX = xp

      let operator = gtlt
      let major: string | number = String(M)
      let minor: string | number = String(m)
      let patch: string | number = String(p)
      let prerelease = pr ?? ''

      if (operator === '=' && anyX) {
        operator = ''
      }

      // if we're including prereleases in the match, then we need
      // to fix this to -0, the lowest possible prerelease value
      prerelease = options.includePrerelease ? '-0' : ''

      if (xM) {
        if (operator === '>' || operator === '<') {
          // nothing is allowed
          ret = '<0.0.0-0'
        }
        else {
          // nothing is forbidden
          ret = '*'
        }
      }
      else if (operator && anyX) {
        // we know patch is an x, because we have any x at all.
        // replace X with 0
        if (xm) {
          minor = 0
        }
        patch = 0

        if (operator === '>') {
          // >1 => >=2.0.0
          // >1.2 => >=1.3.0
          operator = '>='
          if (xm) {
            major = Number(major) + 1
            minor = 0
            patch = 0
          }
          else {
            minor = Number(minor) + 1
            patch = 0
          }
        }
        else if (operator === '<=') {
          // <=0.7.x is actually <0.8.0, since any 0.7.x should
          // pass.  Similarly, <=7.x is actually <8.0.0, etc.
          operator = '<'
          if (xm) {
            major = Number(major) + 1
          }
          else {
            minor = Number(minor) + 1
          }
        }

        if (operator === '<') {
          prerelease = '-0'
        }

        ret = `${operator + major}.${minor}.${patch}${prerelease}`
      }
      else if (xm) {
        ret = `>=${major}.0.0${prerelease} <${Number(major) + 1}.0.0-0`
      }
      else if (xp) {
        ret = `>=${major}.${minor}.0${prerelease
        } <${major}.${Number(minor) + 1}.0-0`
      }

      debug('xRange return', ret)

      return ret
    },
  )
}

// Because * is AND-ed with everything else in the comparator,
// and '' means "any version", just remove the *s entirely.
function replaceStars(comp: string, options: ParsedOptions): string {
  debug('replaceStars', comp, options)
  // Looseness is ignored here.  star is always as loose as it gets!
  return comp
    .trim()
    .replace(re[t.STAR], '')
}

function replaceGTE0(comp: string, options: ParsedOptions): string {
  debug('replaceGTE0', comp, options)
  return comp
    .trim()
    .replace(re[options.includePrerelease ? t.GTE0PRE : t.GTE0], '')
}

// This function is passed to string.replace(re[t.HYPHENRANGE])
// M, m, patch, prerelease, build
// 1.2 - 3.4.5 => >=1.2.0 <=3.4.5
// 1.2.3 - 3.4 => >=1.2.0 <3.5.0-0 Any 3.4.x will do
// 1.2 - 3.4 => >=1.2.0 <3.5.0-0
// TODO build?
function hyphenReplace(incPr: boolean) {
  return (
    _match: string,
    from: string | undefined,
    fM: string | undefined,
    fm: string | undefined,
    fp: string | undefined,
    fpr: string | undefined,
    _fb: string | undefined,
    to: string | undefined,
    tM: string | undefined,
    tm: string | undefined,
    tp: string | undefined,
    tpr: string | undefined,
  ): string => {
    let fromValue = from ?? ''
    let toValue = to ?? ''

    if (isX(fM)) {
      fromValue = ''
    }
    else if (isX(fm)) {
      fromValue = `>=${String(fM)}.0.0${incPr ? '-0' : ''}`
    }
    else if (isX(fp)) {
      fromValue = `>=${String(fM)}.${String(fm)}.0${incPr ? '-0' : ''}`
    }
    else if (fpr) {
      fromValue = `>=${fromValue}`
    }
    else {
      fromValue = `>=${fromValue}${incPr ? '-0' : ''}`
    }

    if (isX(tM)) {
      toValue = ''
    }
    else if (isX(tm)) {
      toValue = `<${Number(tM) + 1}.0.0-0`
    }
    else if (isX(tp)) {
      toValue = `<${String(tM)}.${Number(tm) + 1}.0-0`
    }
    else if (tpr) {
      toValue = `<=${String(tM)}.${String(tm)}.${String(tp)}-${tpr}`
    }
    else if (incPr) {
      toValue = `<${String(tM)}.${String(tm)}.${Number(tp) + 1}-0`
    }
    else {
      toValue = `<=${toValue}`
    }

    return `${fromValue} ${toValue}`.trim()
  }
}

function testSet(set: ComparatorSet, version: SemVer, options: ParsedOptions): boolean {
  for (let i = 0; i < set.length; i++) {
    if (!set[i].test(version)) {
      return false
    }
  }

  if (version.prerelease.length && !options.includePrerelease) {
    // Find the set of versions that are allowed to have prereleases
    // For example, ^1.2.3-pr.1 desugars to >=1.2.3-pr.1 <2.0.0
    // That should allow `1.2.3-pr.2` to pass.
    // However, `1.2.4-alpha.notready` should NOT be allowed,
    // even though it's within the range set by the comparators.
    for (let i = 0; i < set.length; i++) {
      const comparator = set[i]
      debug(comparator.semver)
      if (!hasSemVer(comparator.semver)) {
        continue
      }

      const allowed = comparator.semver
      if (allowed.prerelease.length > 0) {
        if (allowed.major === version.major
          && allowed.minor === version.minor
          && allowed.patch === version.patch) {
          return true
        }
      }
    }

    // Version has a -pre, but it's not one of the ones we like.
    return false
  }

  return true
}
