import type { IdentifierBase, OptionsOrLoose, ReleaseType, SemVerLike } from '../types'
import { SemVer } from '../classes/semver'

/**
 * Return the version incremented by the release type (major, premajor, minor, preminor, patch, prepatch, or prerelease), or null if it's not valid.
 */
export function inc(
  version: SemVerLike,
  release: ReleaseType,
  optionsOrLoose?: OptionsOrLoose,
  identifier?: string,
  identifierBase?: IdentifierBase,
): string | null
export function inc(
  version: SemVerLike,
  release: ReleaseType,
  identifier: string,
  identifierBase?: IdentifierBase,
): string | null
export function inc(
  version: SemVerLike,
  release: ReleaseType,
  optionsOrLoose?: OptionsOrLoose | string,
  identifier?: string | IdentifierBase,
  identifierBase?: IdentifierBase,
): string | null {
  let options: OptionsOrLoose | undefined
  let nextIdentifier: string | undefined
  let nextIdentifierBase = identifierBase

  if (typeof optionsOrLoose === 'string') {
    nextIdentifier = optionsOrLoose
    nextIdentifierBase = identifier as IdentifierBase | undefined
    options = undefined
  }
  else if (typeof identifier === 'string') {
    options = optionsOrLoose
    nextIdentifier = identifier
  }
  else {
    options = optionsOrLoose
  }

  try {
    return new SemVer(
      version instanceof SemVer ? version.version : version,
      options,
    ).inc(release, nextIdentifier, nextIdentifierBase).version
  }
  catch {
    return null
  }
}
