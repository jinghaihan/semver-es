import type { OptionsOrLoose, SemVerLike } from '../types'
import { compare } from './compare'

/**
 * v1 == v2 This is true if they're logically equivalent, even if they're not the exact same string. You already know how to compare strings.
 */
export function eq(v1: SemVerLike, v2: SemVerLike, optionsOrLoose?: OptionsOrLoose): boolean {
  return compare(v1, v2, optionsOrLoose) === 0
}
