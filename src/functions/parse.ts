import type { OptionsOrLoose, SemVerLike } from '../types'
import { SemVer } from '../classes/semver'

/**
 * Return the parsed version as a `SemVer` object.
 *
 * In case `version` is invalid, the function will
 * - throw if `throwErrors` is `true`.
 * - return `null` otherwise.
 */
export function parse(version?: SemVerLike | null): SemVer | null
export function parse(
  version: SemVerLike | null | undefined,
  optionsOrLoose: OptionsOrLoose | undefined,
  throwErrors: true,
): SemVer
export function parse(
  version: SemVerLike | null | undefined,
  optionsOrLoose?: OptionsOrLoose,
  throwErrors?: boolean,
): SemVer | null
export function parse(
  version?: SemVerLike | null,
  optionsOrLoose?: OptionsOrLoose,
  throwErrors = false,
): SemVer | null {
  if (version instanceof SemVer)
    return version

  try {
    return new SemVer(version as SemVerLike, optionsOrLoose)
  }
  catch (er) {
    if (!throwErrors)
      return null

    throw er
  }
}
