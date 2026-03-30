import type { CompareResult, OptionsOrLoose, SemVerLike } from '../types'
import { compare } from './compare'

export const rcompare = (a: SemVerLike, b: SemVerLike, loose?: OptionsOrLoose): CompareResult => compare(b, a, loose)
