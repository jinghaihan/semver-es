import type { OptionsOrLoose, SemVerLike } from '../types'
import { compare } from './compare'

/**
 * v1 <= v2
 */
export function lte(v1: SemVerLike, v2: SemVerLike, optionsOrLoose?: OptionsOrLoose): boolean {
  return compare(v1, v2, optionsOrLoose) <= 0
}
