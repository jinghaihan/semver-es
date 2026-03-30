import type { OptionsOrLoose } from '../types'
import { parse } from './parse'

const CLEAN_REPLACE_PREFIX = /^[=v]+/

export function clean(version: unknown, options?: OptionsOrLoose): string | null {
  if (typeof version !== 'string') {
    return null
  }
  const s = parse(version.trim().replace(CLEAN_REPLACE_PREFIX, ''), options)
  return s ? s.version : null
}
