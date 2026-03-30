import type { OptionsOrLoose, SemVerLike } from '../types'
import { SemVer } from '../classes/semver'

/**
 * Return the major version number.
 */
export function major(version: SemVerLike, optionsOrLoose?: OptionsOrLoose): number {
  return new SemVer(version, optionsOrLoose).major
}
