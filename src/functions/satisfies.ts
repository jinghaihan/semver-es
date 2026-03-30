import type { RangeLike, RangeOptionsOrLoose, SemVerLike } from '../types'
import { Range } from '../classes/range'

/**
 * Return true if the version satisfies the range.
 */
export function satisfies(
  version: SemVerLike,
  range: RangeLike,
  optionsOrLoose?: RangeOptionsOrLoose,
): boolean {
  try {
    const rangeObj = new Range(range, optionsOrLoose)
    return rangeObj.test(version)
  }
  catch {
    return false
  }
}
