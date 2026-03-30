import type { OptionsOrLoose, SemVerLike } from '../types'
import { compareBuild } from './compare-build'

export function sort<T extends SemVerLike>(list: T[], loose?: OptionsOrLoose): T[] {
  return list.sort((a, b) => compareBuild(a, b, loose))
}
