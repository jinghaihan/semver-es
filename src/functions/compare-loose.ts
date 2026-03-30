import type { CompareResult, SemVerLike } from '../types'
import { compare } from './compare'

/**
 * Short for compare(v1, v2, { loose: true })
 */
export const compareLoose = (v1: SemVerLike, v2: SemVerLike): CompareResult => compare(v1, v2, true)
