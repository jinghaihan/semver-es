import type { CompareResult } from '../types'

const numeric = /^\d+$/

/**
 * Compares two identifiers, must be numeric strings or truthy/falsy values.
 *
 * Sorts in ascending order when passed to `Array.sort()`.
 */
export function compareIdentifiers(a: string | number, b: string | number): CompareResult {
  if (typeof a === 'number' && typeof b === 'number')
    return a === b ? 0 : a < b ? -1 : 1

  const anum = numeric.test(String(a))
  const bnum = numeric.test(String(b))

  if (anum && bnum) {
    a = +a
    b = +b
  }

  return a === b
    ? 0
    : (anum && !bnum)
        ? -1
        : (bnum && !anum)
            ? 1
            : a < b
              ? -1
              : 1
}

/**
 * The reverse of compareIdentifiers.
 *
 * Sorts in descending order when passed to `Array.sort()`.
 */
export const rcompareIdentifiers = (a: string | number, b: string | number): CompareResult => compareIdentifiers(b, a)
