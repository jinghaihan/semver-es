import type { CompareResult, OptionsOrLoose, SemVerLike } from '../types'
import { SemVer } from '../classes/semver'

/**
 * Compares two versions including build identifiers (the bit after `+` in the semantic version string).
 *
 * Sorts in ascending order when passed to `Array.sort()`.
 *
 * @return
 * - `0` if `v1` == `v2`
 * - `1` if `v1` is greater
 * - `-1` if `v2` is greater.
 *
 * @since 6.1.0
 */
export function compareBuild(
  v1: SemVerLike,
  v2: SemVerLike,
  optionsOrLoose?: OptionsOrLoose,
): CompareResult {
  const versionA = new SemVer(v1, optionsOrLoose)
  const versionB = new SemVer(v2, optionsOrLoose)
  return versionA.compare(versionB) || versionA.compareBuild(versionB)
}
