import type { RangeLike, RangeOptionsOrLoose, SemVerLike } from '../types'
import { outside } from './outside'

// Determine if version is greater than all the versions possible in the range.
export function gtr(version: SemVerLike, range: RangeLike, options?: RangeOptionsOrLoose): boolean {
  return outside(version, range, '>', options)
}
