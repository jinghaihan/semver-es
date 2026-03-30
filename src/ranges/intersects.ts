import type { RangeLike, RangeOptionsOrLoose } from '../types'
import { Range } from '../classes/range'

export function intersects(r1: RangeLike, r2: RangeLike, options?: RangeOptionsOrLoose): boolean {
  const range1 = new Range(r1, options)
  const range2 = new Range(r2, options)
  return range1.intersects(range2, options)
}
