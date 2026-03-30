import type { OptionsOrLoose, SemVerLike } from '../types'
import { compare } from './compare'

export const lte = (a: SemVerLike, b: SemVerLike, loose?: OptionsOrLoose): boolean => compare(a, b, loose) <= 0
