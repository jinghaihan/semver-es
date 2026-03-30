import type { CompareResult, SemVerLike } from '../types'
import { compare } from './compare'

export const compareLoose = (a: SemVerLike, b: SemVerLike): CompareResult => compare(a, b, true)
