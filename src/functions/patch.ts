import type { OptionsOrLoose, SemVerLike } from '../types'
import { SemVer } from '../classes/semver'

export const patch = (a: SemVerLike, loose?: OptionsOrLoose): number => new SemVer(a, loose).patch
