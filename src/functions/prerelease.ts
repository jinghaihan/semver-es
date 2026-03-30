import type { OptionsOrLoose, SemVerLike } from '../types'
import { parse } from './parse'

export function prerelease(version: SemVerLike, options?: OptionsOrLoose): ReadonlyArray<string | number> | null {
  const parsed = parse(version, options)
  return (parsed && parsed.prerelease.length) ? parsed.prerelease : null
}
