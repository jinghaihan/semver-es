import type { SemVer } from '../classes/semver'
import type {
  CompareResult,
  ParsedOptions,
  RangeLike,
  RangeOptions,
} from '../types'
import { Comparator } from '../classes/comparator'
import { Range } from '../classes/range'
import { compare } from '../functions/compare'
import { satisfies } from '../functions/satisfies'
import { parseOptions } from '../internal/parse-options'

const { ANY } = Comparator
type ComparatorList = readonly Comparator[]
const hasSemVer = (value: Comparator['semver']): value is SemVer => value !== ANY

// Complex range `r1 || r2 || ...` is a subset of `R1 || R2 || ...` iff:
// - Every simple range `r1, r2, ...` is a null set, OR
// - Every simple range `r1, r2, ...` which is not a null set is a subset of
//   some `R1, R2, ...`
//
// Simple range `c1 c2 ...` is a subset of simple range `C1 C2 ...` iff:
// - If c is only the ANY comparator
//   - If C is only the ANY comparator, return true
//   - Else if in prerelease mode, return false
//   - else replace c with `[>=0.0.0]`
// - If C is only the ANY comparator
//   - if in prerelease mode, return true
//   - else replace C with `[>=0.0.0]`
// - Let EQ be the set of = comparators in c
// - If EQ is more than one, return true (null set)
// - Let GT be the highest > or >= comparator in c
// - Let LT be the lowest < or <= comparator in c
// - If GT and LT, and GT.semver > LT.semver, return true (null set)
// - If any C is a = range, and GT or LT are set, return false
// - If EQ
//   - If GT, and EQ does not satisfy GT, return true (null set)
//   - If LT, and EQ does not satisfy LT, return true (null set)
//   - If EQ satisfies every C, return true
//   - Else return false
// - If GT
//   - If GT.semver is lower than any > or >= comp in C, return false
//   - If GT is >=, and GT.semver does not satisfy every C, return false
//   - If GT.semver has a prerelease, and not in prerelease mode
//     - If no C has a prerelease and the GT.semver tuple, return false
// - If LT
//   - If LT.semver is greater than any < or <= comp in C, return false
//   - If LT is <=, and LT.semver does not satisfy every C, return false
//   - If LT.semver has a prerelease, and not in prerelease mode
//     - If no C has a prerelease and the LT.semver tuple, return false
// - Else return true

/**
 * Return true if the subRange range is entirely contained by the superRange range.
 */
export function subset(sub: RangeLike, dom: RangeLike, options?: RangeOptions): boolean {
  if (sub === dom)
    return true

  const parsedOptions = parseOptions(options)
  const subRange = new Range(sub, options)
  const domRange = new Range(dom, options)
  let sawNonNull = false

  for (const simpleSub of subRange.set) {
    let isSimpleSubset = false
    for (const simpleDom of domRange.set) {
      const isSub = simpleSubset(simpleSub, simpleDom, options, parsedOptions)
      sawNonNull = sawNonNull || isSub !== null
      if (isSub) {
        isSimpleSubset = true
        break
      }
    }
    if (isSimpleSubset)
      continue

    // the null set is a subset of everything, but null simple ranges in
    // a complex range should be ignored.  so if we saw a non-null range,
    // then we know this isn't a subset, but if EVERY simple range was null,
    // then it is a subset.
    if (sawNonNull)
      return false
  }
  return true
}

const minimumVersionWithPreRelease = [new Comparator('>=0.0.0-0')]
const minimumVersion = [new Comparator('>=0.0.0')]

function simpleSubset(
  sub: ComparatorList,
  dom: ComparatorList,
  options: RangeOptions | undefined,
  parsedOptions: ParsedOptions,
): boolean | null {
  if (sub === dom)
    return true

  let subSet = sub
  let domSet = dom

  if (subSet.length === 1 && subSet[0].semver === ANY) {
    if (domSet.length === 1 && domSet[0].semver === ANY) {
      return true
    }
    else if (parsedOptions.includePrerelease) {
      subSet = minimumVersionWithPreRelease
    }
    else {
      subSet = minimumVersion
    }
  }
  if (domSet.length === 1 && domSet[0].semver === ANY) {
    if (parsedOptions.includePrerelease)
      return true
    else
      domSet = minimumVersion
  }
  const eqSet = new Set<SemVer>()
  let gt: Comparator | undefined
  let lt: Comparator | undefined
  for (const c of subSet) {
    if (c.operator === '>' || c.operator === '>=')
      gt = higherGT(gt, c, options)

    else if (c.operator === '<' || c.operator === '<=')
      lt = lowerLT(lt, c, options)

    else if (hasSemVer(c.semver))
      eqSet.add(c.semver)
  }

  if (eqSet.size > 1)
    return null

  let gtltComp: CompareResult | undefined
  if (gt && lt) {
    if (!hasSemVer(gt.semver) || !hasSemVer(lt.semver))
      return null

    gtltComp = compare(gt.semver, lt.semver, options)
    if (gtltComp > 0)
      return null

    else if (gtltComp === 0 && (gt.operator !== '>=' || lt.operator !== '<='))
      return null
  }

  const eq = eqSet.values().next().value
  if (eq) {
    if (gt && !satisfies(eq, String(gt), options))
      return null

    if (lt && !satisfies(eq, String(lt), options))
      return null

    for (const c of domSet) {
      if (!satisfies(eq, String(c), options))
        return false
    }

    return true
  }

  let higher: Comparator | undefined
  let lower: Comparator | undefined
  let hasDomLT = false
  let hasDomGT = false
  // if the subset has a prerelease, we need a comparator in the superset
  // with the same tuple and a prerelease, or it's not a subset
  const ltSemVer = lt && hasSemVer(lt.semver) ? lt.semver : null
  const gtSemVer = gt && hasSemVer(gt.semver) ? gt.semver : null
  let needDomLTPre: SemVer | false = ltSemVer
    && !parsedOptions.includePrerelease
    && ltSemVer.prerelease.length
    ? ltSemVer
    : false
  let needDomGTPre: SemVer | false = gtSemVer
    && !parsedOptions.includePrerelease
    && gtSemVer.prerelease.length
    ? gtSemVer
    : false
  // exception: <1.2.3-0 is the same as <1.2.3
  if (
    needDomLTPre
    && lt
    && needDomLTPre.prerelease.length === 1
    && lt.operator === '<'
    && needDomLTPre.prerelease[0] === 0
  ) {
    needDomLTPre = false
  }

  for (const c of domSet) {
    hasDomGT = hasDomGT || c.operator === '>' || c.operator === '>='
    hasDomLT = hasDomLT || c.operator === '<' || c.operator === '<='
    if (gt) {
      if (needDomGTPre && hasSemVer(c.semver)) {
        if (c.semver.prerelease.length
          && c.semver.major === needDomGTPre.major
          && c.semver.minor === needDomGTPre.minor
          && c.semver.patch === needDomGTPre.patch) {
          needDomGTPre = false
        }
      }
      if (c.operator === '>' || c.operator === '>=') {
        higher = higherGT(gt, c, options)
        if (higher === c && higher !== gt)
          return false
      }
      else if (gt.operator === '>=' && hasSemVer(gt.semver) && !satisfies(gt.semver, String(c), options)) {
        return false
      }
    }
    if (lt) {
      if (needDomLTPre && hasSemVer(c.semver)) {
        if (c.semver.prerelease.length
          && c.semver.major === needDomLTPre.major
          && c.semver.minor === needDomLTPre.minor
          && c.semver.patch === needDomLTPre.patch) {
          needDomLTPre = false
        }
      }
      if (c.operator === '<' || c.operator === '<=') {
        lower = lowerLT(lt, c, options)
        if (lower === c && lower !== lt)
          return false
      }
      else if (lt.operator === '<=' && hasSemVer(lt.semver) && !satisfies(lt.semver, String(c), options)) {
        return false
      }
    }
    if (!c.operator && (lt || gt) && gtltComp !== 0)
      return false
  }

  // if there was a < or >, and nothing in the dom, then must be false
  // UNLESS it was limited by another range in the other direction.
  // Eg, >1.0.0 <1.0.1 is still a subset of <2.0.0
  if (gt && hasDomLT && !lt && gtltComp !== 0)
    return false

  if (lt && hasDomGT && !gt && gtltComp !== 0)
    return false

  // we needed a prerelease range in a specific tuple, but didn't get one
  // then this isn't a subset.  eg >=1.2.3-pre is not a subset of >=1.0.0,
  // because it includes prereleases in the 1.2.3 tuple
  if (needDomGTPre || needDomLTPre)
    return false

  return true
}

// >=1.2.3 is lower than >1.2.3
function higherGT(a: Comparator | undefined, b: Comparator, options: RangeOptions | undefined): Comparator {
  if (!a)
    return b

  if (!hasSemVer(a.semver))
    return b

  if (!hasSemVer(b.semver))
    return a

  const comp = compare(a.semver, b.semver, options)
  return comp > 0
    ? a
    : comp < 0
      ? b
      : b.operator === '>' && a.operator === '>='
        ? b
        : a
}

// <=1.2.3 is higher than <1.2.3
function lowerLT(a: Comparator | undefined, b: Comparator, options: RangeOptions | undefined): Comparator {
  if (!a)
    return b

  if (!hasSemVer(a.semver))
    return b

  if (!hasSemVer(b.semver))
    return a

  const comp = compare(a.semver, b.semver, options)
  return comp < 0
    ? a
    : comp > 0
      ? b
      : b.operator === '<' && a.operator === '<='
        ? b
        : a
}
