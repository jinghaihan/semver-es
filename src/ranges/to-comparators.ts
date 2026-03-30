import type { OptionsOrLoose, RangeLike } from '../types'
import { Range } from '../classes/range'

/**
 * Mostly just for testing and legacy API reasons
 */
export function toComparators(range: RangeLike, optionsOrLoose?: OptionsOrLoose): string[][] {
  return new Range(range, optionsOrLoose).set.map(comp => comp.map(c => c.value).join(' ').trim().split(' '))
}
