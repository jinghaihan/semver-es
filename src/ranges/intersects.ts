import type { Comparator } from '../classes/comparator'
import type { RangeLike, RangeOptionsOrLoose } from '../types'
import { Range } from '../classes/range'

/**
 * Return true if any of the ranges comparators intersect
 */
export function intersects(
  range1: RangeLike | Comparator,
  range2: RangeLike | Comparator,
  optionsOrLoose?: RangeOptionsOrLoose,
): boolean
export function intersects(
  range1: RangeLike | Comparator,
  range2: RangeLike | Comparator,
  optionsOrLoose?: RangeOptionsOrLoose,
): boolean {
  const firstRange = new Range(range1, optionsOrLoose)
  const secondRange = new Range(range2, optionsOrLoose)
  return firstRange.intersects(secondRange, optionsOrLoose)
}
