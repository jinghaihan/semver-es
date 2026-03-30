import type { IdentifierBase, OptionsOrLoose, SemVerLike } from '../types'
import { SemVer } from '../classes/semver'

export function inc(
  version: SemVerLike,
  release: unknown,
  options?: OptionsOrLoose | string,
  identifier?: unknown,
  identifierBase?: unknown,
): string | null {
  if (typeof (options) === 'string') {
    identifierBase = identifier
    identifier = options
    options = undefined
  }

  try {
    const identifierString = typeof identifier === 'string' ? identifier : undefined
    const identifierBaseValue = identifierBase as IdentifierBase | undefined
    return new SemVer(
      version instanceof SemVer ? version.version : version,
      options,
    ).inc(String(release), identifierString, identifierBaseValue).version
  }
  catch {
    return null
  }
}
