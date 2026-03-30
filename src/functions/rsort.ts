import type { OptionsOrLoose, SemVerLike } from '../types'
import { compareBuild } from './compare-build'

export function rsort<T extends SemVerLike>(list: T[], loose?: OptionsOrLoose): T[] {
  return list.sort((a, b) => compareBuild(b, a, loose))
}
