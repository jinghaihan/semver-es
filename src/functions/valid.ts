import type { OptionsOrLoose, SemVerLike } from '../types'
import { parse } from './parse'

/**
 * Return the parsed version as a string, or null if it's not valid.
 */
export function valid(
  version: SemVerLike | null | undefined,
  optionsOrLoose?: OptionsOrLoose,
): string | null {
  const v = parse(version, optionsOrLoose)
  return v ? v.version : null
}
