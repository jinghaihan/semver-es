import type { CoerceOptions } from '../types'
import { SemVer } from '../classes/semver'
import { safeRe as re, t } from '../internal/re'
import { parse } from './parse'

/**
 * Coerces a string to SemVer if possible
 */
export function coerce(
  version: string | number | SemVer | null | undefined,
  options?: CoerceOptions,
): SemVer | null {
  if (version instanceof SemVer)
    return version

  if (typeof version === 'number')
    version = String(version)

  if (typeof version !== 'string')
    return null

  const parsedOptions: CoerceOptions = options || {}

  let match = null
  if (!parsedOptions.rtl) {
    match = version.match(parsedOptions.includePrerelease ? re[t.COERCEFULL] : re[t.COERCE])
  }

  else {
    // Find the right-most coercible string that does not share
    // a terminus with a more left-ward coercible string.
    // Eg, '1.2.3.4' wants to coerce '2.3.4', not '3.4' or '4'
    // With includePrerelease option set, '1.2.3.4-rc' wants to coerce '2.3.4-rc', not '2.3.4'
    //
    // Walk through the string checking with a /g regexp
    // Manually set the index so as to pick up overlapping matches.
    // Stop when we get a match that ends at the string end, since no
    // coercible string can be more right-ward without the same terminus.
    const coerceRtlRegex = parsedOptions.includePrerelease ? re[t.COERCERTLFULL] : re[t.COERCERTL]
    let next = coerceRtlRegex.exec(version)
    while (next && (!match || match.index + match[0].length !== version.length)) {
      if (!match
        || next.index + next[0].length !== match.index + match[0].length) {
        match = next
      }

      coerceRtlRegex.lastIndex = next.index + next[1].length + next[2].length
      next = coerceRtlRegex.exec(version)
    }
    // leave it in a clean state
    coerceRtlRegex.lastIndex = -1
  }

  if (match === null)
    return null

  const major = match[2]
  const minor = match[3] || '0'
  const patch = match[4] || '0'
  const prerelease = parsedOptions.includePrerelease && match[5] ? `-${match[5]}` : ''
  const build = parsedOptions.includePrerelease && match[6] ? `+${match[6]}` : ''

  return parse(`${major}.${minor}.${patch}${prerelease}${build}`, parsedOptions)
}
