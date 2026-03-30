import type { OptionsOrLoose, SemVerLike } from '../types'
import { compare } from './compare'

/**
 * v1 != v2 The opposite of eq.
 */
export function neq(v1: SemVerLike, v2: SemVerLike, optionsOrLoose?: OptionsOrLoose): boolean {
  return compare(v1, v2, optionsOrLoose) !== 0
}
