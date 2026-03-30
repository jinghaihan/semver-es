import type { RangeLike, RangeOptionsOrLoose } from '../types'
import { Range } from '../classes/range'

/**
 * Return the valid range or null if it's not valid
 */
export function validRange(
  range: RangeLike | null | undefined,
  optionsOrLoose?: RangeOptionsOrLoose,
): string | null {
  try {
    // Return '*' instead of '' so that truthiness works.
    // This will throw if it's invalid anyway
    return new Range(range as RangeLike, optionsOrLoose).range || '*'
  }
  catch {
    return null
  }
}
