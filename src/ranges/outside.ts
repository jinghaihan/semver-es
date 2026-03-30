import type {
  Hilo,
  OptionsOrLoose,
  RangeLike,
  RangeOptionsOrLoose,
  SemVerLike,
} from '../types'
import { Comparator } from '../classes/comparator'
import { Range } from '../classes/range'
import { SemVer } from '../classes/semver'
import { gt } from '../functions/gt'
import { gte } from '../functions/gte'
import { lt } from '../functions/lt'
import { lte } from '../functions/lte'
import { satisfies } from '../functions/satisfies'

const { ANY } = Comparator

type CompareFn = (a: SemVerLike, b: SemVerLike, options?: OptionsOrLoose) => boolean

/**
 * Return true if the version is outside the bounds of the range in either the high or low direction.
 * The hilo argument must be either the string '>' or '<'. (This is the function called by gtr and ltr.)
 */
export function outside(
  version: SemVerLike,
  range: RangeLike,
  hilo: Hilo,
  optionsOrLoose?: RangeOptionsOrLoose,
): boolean {
  const versionObj = new SemVer(version, optionsOrLoose)
  const rangeObj = new Range(range, optionsOrLoose)

  let gtfn: CompareFn
  let ltefn: CompareFn
  let ltfn: CompareFn
  let comp: '>' | '<'
  let ecomp: '>=' | '<='
  switch (hilo) {
    case '>':
      gtfn = gt
      ltefn = lte
      ltfn = lt
      comp = '>'
      ecomp = '>='
      break
    case '<':
      gtfn = lt
      ltefn = gte
      ltfn = gt
      comp = '<'
      ecomp = '<='
      break
    default:
      throw new TypeError('Must provide a hilo val of "<" or ">"')
  }

  // If it satisfies the range it is not outside
  if (satisfies(versionObj, rangeObj, optionsOrLoose))
    return false

  // From now on, variable terms are as if we're in "gtr" mode.
  // but note that everything is flipped for the "ltr" function.

  for (let i = 0; i < rangeObj.set.length; ++i) {
    const comparators = rangeObj.set[i] as Comparator[]

    let high: Comparator | null = null
    let low: Comparator | null = null

    for (const comparator of comparators) {
      let current = comparator
      if (current.semver === ANY)
        current = new Comparator('>=0.0.0')

      high = high || current
      low = low || current
      if (gtfn(current.semver as SemVerLike, high.semver as SemVerLike, optionsOrLoose))
        high = current

      else if (ltfn(current.semver as SemVerLike, low.semver as SemVerLike, optionsOrLoose))
        low = current
    }

    if (!high || !low)
      continue

    // If the edge version comparator has a operator then our version
    // isn't outside it
    if (high.operator === comp || high.operator === ecomp)
      return false

    // If the lowest version comparator has an operator and our version
    // is less than it then it isn't higher than the range
    if ((!low.operator || low.operator === comp)
      && ltefn(versionObj, low.semver as SemVerLike)) {
      return false
    }

    else if (low.operator === ecomp && ltfn(versionObj, low.semver as SemVerLike)) {
      return false
    }
  }
  return true
}
