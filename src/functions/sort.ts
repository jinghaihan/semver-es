import type { OptionsOrLoose, SemVerLike } from '../types'
import { compareBuild } from './compare-build'

/**
 * Sorts an array of semver entries in ascending order using `compareBuild()`.
 */
export function sort<T extends SemVerLike>(list: T[], optionsOrLoose?: OptionsOrLoose): T[] {
  return list.sort((v1, v2) => compareBuild(v1, v2, optionsOrLoose))
}
