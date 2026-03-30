import type { OptionsOrLoose } from '../types'
import { parse } from './parse'

const CLEAN_REPLACE_PREFIX = /^[=v]+/

/**
 * Returns cleaned (removed leading/trailing whitespace, remove '=v' prefix) and parsed version, or null if version is invalid.
 */
export function clean(version: string, optionsOrLoose?: OptionsOrLoose): string | null {
  const s = parse(version.trim().replace(CLEAN_REPLACE_PREFIX, ''), optionsOrLoose)
  return s ? s.version : null
}
