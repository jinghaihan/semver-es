import type { RangeLike, RangeOptionsOrLoose, SemVerLike } from '../types'
import { outside } from './outside'

/**
 * Return true if version is less than all the versions possible in the range.
 */
export function ltr(
  version: SemVerLike,
  range: RangeLike,
  optionsOrLoose?: RangeOptionsOrLoose,
): boolean {
  return outside(version, range, '<', optionsOrLoose)
}
