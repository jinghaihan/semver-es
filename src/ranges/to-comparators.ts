import type { RangeLike, RangeOptionsOrLoose } from '../types'
import { Range } from '../classes/range'

// Mostly just for testing and legacy API reasons
export function toComparators(range: RangeLike, options?: RangeOptionsOrLoose): string[][] {
  return new Range(range, options).set.map((comp: { value: string }[]) => comp.map(c => c.value).join(' ').trim().split(' '))
}
