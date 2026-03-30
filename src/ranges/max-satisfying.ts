import type { RangeLike, RangeOptionsOrLoose, SemVerLike } from '../types'
import { Range } from '../classes/range'
import { SemVer } from '../classes/semver'

/**
 * Return the highest version in the list that satisfies the range, or null if none of them do.
 */
export function maxSatisfying<T extends SemVerLike>(
  versions: readonly T[],
  range: RangeLike,
  optionsOrLoose?: RangeOptionsOrLoose,
): T | null {
  let max: T | null = null
  let maxSV: SemVer | null = null
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
      if (!max || !maxSV || maxSV.compare(v) === -1) {
        // compare(max, v, true)
        max = v
        maxSV = new SemVer(max, optionsOrLoose)
      }
    }
  })
  return max
}
