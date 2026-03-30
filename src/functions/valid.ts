import type { OptionsOrLoose, SemVerLike } from '../types'
import { parse } from './parse'

export function valid(version: SemVerLike | null | undefined, options?: OptionsOrLoose): string | null {
  const v = parse(version, options)
  return v ? v.version : null
}
