import { SemVer } from '../classes/semver'

export function parse(version?: unknown): SemVer | null
export function parse(version: unknown, options: unknown, throwErrors: true): SemVer
export function parse(version: unknown, options?: unknown, throwErrors?: boolean): SemVer | null
export function parse(version?: unknown, options?: unknown, throwErrors = false): SemVer | null {
  if (version instanceof SemVer) {
    return version
  }
  try {
    return new SemVer(version, options)
  }
  catch (er) {
    if (!throwErrors) {
      return null
    }
    throw er
  }
}
