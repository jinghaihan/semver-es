import type { RangeLike, RangeOptionsOrLoose, SemVerLike } from '../types'
import { Range } from '../classes/range'
import { SemVer } from '../classes/semver'

/**
 * Return the lowest version in the list that satisfies the range, or null if none of them do.
 */
export function minSatisfying<T extends SemVerLike>(
  versions: readonly T[],
  range: RangeLike,
  optionsOrLoose?: RangeOptionsOrLoose,
): T | null {
  let min: T | null = null
  let minSV: SemVer | null = null
  let rangeObj: Range
  try {
    rangeObj = new Range(range, optionsOrLoose)
  }
  catch {
    return null
  }
  versions.forEach((v) => {
    if (rangeObj.test(v)) {
      // satisfies(v, range, options)
      if (!min || !minSV || minSV.compare(v) === 1) {
        // compare(min, v, true)
        min = v
        minSV = new SemVer(min, optionsOrLoose)
      }
    }
  })
  return min
}
