import type { OptionsOrLoose, SemVerLike } from '../types'
import { SemVer } from '../classes/semver'

/**
 * Return the patch version number.
 */
export function patch(version: SemVerLike, optionsOrLoose?: OptionsOrLoose): number {
  return new SemVer(version, optionsOrLoose).patch
}
