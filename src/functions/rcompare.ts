import type { CompareResult, OptionsOrLoose, SemVerLike } from '../types'
import { compare } from './compare'

/**
 * The reverse of compare.
 *
 * Sorts in descending order when passed to `Array.sort()`.
 */
export function rcompare(v1: SemVerLike, v2: SemVerLike, optionsOrLoose?: OptionsOrLoose): CompareResult {
  return compare(v2, v1, optionsOrLoose)
}
