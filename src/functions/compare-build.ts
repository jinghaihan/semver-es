import type { CompareResult, OptionsOrLoose, SemVerLike } from '../types'
import { SemVer } from '../classes/semver'

export function compareBuild(a: SemVerLike, b: SemVerLike, loose?: OptionsOrLoose): CompareResult {
  const versionA = new SemVer(a, loose)
  const versionB = new SemVer(b, loose)
  return versionA.compare(versionB) || versionA.compareBuild(versionB)
}
