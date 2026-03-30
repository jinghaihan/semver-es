import type { Options, RangeLike } from '../types'
import { compare } from '../functions/compare'
import { satisfies } from '../functions/satisfies'

/**
 * Return a "simplified" range that matches the same items in `versions` list as the range specified.
 * Note that it does *not* guarantee that it would match the same versions in all cases,
 * only for the set of versions provided.
 * This is useful when generating ranges by joining together multiple versions with `||` programmatically,
 * to provide the user with something a bit more ergonomic.
 * If the provided range is shorter in string-length than the generated range, then that is returned.
 */
export function simplifyRange(versions: string[], range: RangeLike, options?: Options): RangeLike {
  const set: Array<[string, string | null]> = []
  let first: string | null = null
  let prev: string | null = null
  const v = versions.sort((a, b) => compare(a, b, options))
  for (const version of v) {
    const included = satisfies(version, range, options)
    if (included) {
      prev = version
      if (!first)
        first = version
    }
    else {
      if (prev && first)
        set.push([first, prev])

      prev = null
      first = null
    }
  }
  if (first)
    set.push([first, null])

  const ranges: string[] = []
  for (const [min, max] of set) {
    if (min === max)
      ranges.push(min)

    else if (!max && min === v[0])
      ranges.push('*')

    else if (!max)
      ranges.push(`>=${min}`)

    else if (min === v[0])
      ranges.push(`<=${max}`)

    else
      ranges.push(`${min} - ${max}`)
  }
  const simplified = ranges.join(' || ')
  const original
    = typeof range === 'object' && range !== null && 'raw' in range && typeof range.raw === 'string'
      ? range.raw
      : String(range)
  return simplified.length < original.length ? simplified : range
}
