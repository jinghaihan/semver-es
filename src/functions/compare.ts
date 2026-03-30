import type { CompareResult, OptionsOrLoose, SemVerLike } from '../types'
import { SemVer } from '../classes/semver'

export function compare(a: SemVerLike, b: SemVerLike, loose?: OptionsOrLoose): CompareResult {
  return new SemVer(a, loose).compare(new SemVer(b, loose))
}
