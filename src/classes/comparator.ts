import type {
  ComparatorLike,
  ComparatorOperator,
  ParsedOptions,
  RangeOptionsOrLoose,
  SemVerLike,
} from '../types'
import { cmp } from '../functions/cmp'
import { debug } from '../internal/debug'
import { parseOptions } from '../internal/parse-options'
import { safeRe as re, t } from '../internal/re'
import { Range } from './range'
import { SemVer } from './semver'

const ANY = Symbol('SemVer ANY')
const SPACE_CHARACTERS = /\s+/
// hoisted class for cyclic dependency
export class Comparator {
  public options: ParsedOptions = {}
  public loose: boolean = false
  public operator: ComparatorOperator = ''
  public semver: SemVer | typeof ANY = ANY
  public value: string = ''

  static get ANY(): typeof ANY {
    return ANY
  }

  constructor(comp: ComparatorLike, options?: RangeOptionsOrLoose) {
    const parsedOptions = parseOptions(options)

    if (comp instanceof Comparator) {
      if (comp.loose === !!parsedOptions.loose)
        return comp
      else
        comp = comp.value
    }

    const normalizedComp = String(comp).trim().split(SPACE_CHARACTERS).join(' ')
    debug('comparator', normalizedComp, parsedOptions)
    this.options = parsedOptions
    this.loose = !!parsedOptions.loose
    this.parse(normalizedComp)

    if (this.semver === ANY)
      this.value = ''

    else
      this.value = this.operator + this.semver.version

    debug('comp', this)
  }

  parse(comp: string): void {
    const r = this.options.loose ? re[t.COMPARATORLOOSE] : re[t.COMPARATOR]
    const m = comp.match(r)

    if (!m)
      throw new TypeError(`Invalid comparator: ${comp}`)

    this.operator = (m[1] !== undefined ? m[1] : '') as ComparatorOperator
    if (this.operator === '=')
      this.operator = ''

    // if it literally is just '>' or '' then allow anything.
    if (!m[2])
      this.semver = ANY

    else
      this.semver = new SemVer(m[2], this.options.loose)
  }

  toString(): string {
    return this.value
  }

  test(version: SemVerLike | typeof ANY): boolean {
    debug('Comparator.test', version, this.options.loose)

    if (this.semver === ANY || version === ANY)
      return true

    if (typeof version === 'string') {
      try {
        version = new SemVer(version, this.options)
      }
      catch {
        return false
      }
    }

    return cmp(version, this.operator, this.semver, this.options)
  }

  intersects(comp: Comparator, optionsOrLoose?: RangeOptionsOrLoose): boolean
  intersects(comp?: Comparator, optionsOrLoose?: RangeOptionsOrLoose): boolean {
    if (!(comp instanceof Comparator))
      throw new TypeError('a Comparator is required')

    if (this.operator === '') {
      if (this.value === '')
        return true

      return new Range(comp.value, optionsOrLoose).test(this.value)
    }
    else if (comp.operator === '') {
      if (comp.value === '')
        return true

      return new Range(this.value, optionsOrLoose).test(comp.semver as SemVerLike)
    }

    const parsedOptions = parseOptions(optionsOrLoose)

    // Special cases where nothing can possibly be lower
    if (parsedOptions.includePrerelease
      && (this.value === '<0.0.0-0' || comp.value === '<0.0.0-0')) {
      return false
    }

    if (!parsedOptions.includePrerelease
      && (this.value.startsWith('<0.0.0') || comp.value.startsWith('<0.0.0'))) {
      return false
    }

    // Same direction increasing (> or >=)
    if (this.operator.startsWith('>') && comp.operator.startsWith('>'))
      return true

    // Same direction decreasing (< or <=)
    if (this.operator.startsWith('<') && comp.operator.startsWith('<'))
      return true

    // same SemVer and both sides are inclusive (<= or >=)
    if (
      this.semver !== ANY && comp.semver !== ANY
      && (this.semver.version === comp.semver.version)
      && this.operator.includes('=') && comp.operator.includes('=')
    ) {
      return true
    }

    // opposite directions less than
    if (cmp(this.semver as SemVerLike, '<', comp.semver as SemVerLike, parsedOptions)
      && this.operator.startsWith('>') && comp.operator.startsWith('<')) {
      return true
    }

    // opposite directions greater than
    if (cmp(this.semver as SemVerLike, '>', comp.semver as SemVerLike, parsedOptions)
      && this.operator.startsWith('<') && comp.operator.startsWith('>')) {
      return true
    }

    return false
  }
}
