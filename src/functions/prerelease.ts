import type { OptionsOrLoose, SemVerLike } from '../types'
import { parse } from './parse'

/**
 * Returns an array of prerelease components, or null if none exist.
 */
export function prerelease(
  version: SemVerLike,
  optionsOrLoose?: OptionsOrLoose,
): ReadonlyArray<string | number> | null {
  const parsed = parse(version, optionsOrLoose)
  return (parsed && parsed.prerelease.length) ? parsed.prerelease : null
}
