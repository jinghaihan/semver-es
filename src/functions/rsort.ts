import type { OptionsOrLoose, SemVerLike } from '../types'
import { compareBuild } from './compare-build'

/**
 * Sorts an array of semver entries in descending order using `compareBuild()`.
 */
export function rsort<T extends SemVerLike>(list: T[], optionsOrLoose?: OptionsOrLoose): T[] {
  return list.sort((v1, v2) => compareBuild(v2, v1, optionsOrLoose))
}
