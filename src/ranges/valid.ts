import type { RangeLike, RangeOptionsOrLoose } from '../types'
import { Range } from '../classes/range'

export function validRange(range: RangeLike | null | undefined, options?: RangeOptionsOrLoose): string | null {
  try {
    // Return '*' instead of '' so that truthiness works.
    // This will throw if it's invalid anyway
    return new Range(range, options).range || '*'
  }
  catch {
    return null
  }
}
