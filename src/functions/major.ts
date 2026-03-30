import type { OptionsOrLoose, SemVerLike } from '../types'
import { SemVer } from '../classes/semver'

export const major = (a: SemVerLike, loose?: OptionsOrLoose): number => new SemVer(a, loose).major
