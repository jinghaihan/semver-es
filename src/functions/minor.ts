import type { OptionsOrLoose, SemVerLike } from '../types'
import { SemVer } from '../classes/semver'

/**
 * Return the minor version number.
 */
export function minor(version: SemVerLike, optionsOrLoose?: OptionsOrLoose): number {
  return new SemVer(version, optionsOrLoose).minor
}
