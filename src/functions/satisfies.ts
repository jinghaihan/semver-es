import type { RangeLike, RangeOptionsOrLoose, SemVerLike } from '../types'
import { Range } from '../classes/range'

export function satisfies(version: SemVerLike, range: RangeLike, options?: RangeOptionsOrLoose): boolean {
  try {
    const rangeObj = new Range(range, options)
    return rangeObj.test(version)
  }
  catch {
    return false
  }
}
