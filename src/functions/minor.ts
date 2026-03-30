import type { OptionsOrLoose, SemVerLike } from '../types'
import { SemVer } from '../classes/semver'

export const minor = (a: SemVerLike, loose?: OptionsOrLoose): number => new SemVer(a, loose).minor
