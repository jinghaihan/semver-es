import type { OptionsOrLoose, RangeLike } from '../types'
import { compare } from '../functions/compare'
import { satisfies } from '../functions/satisfies'

// given a set of versions and a range, create a "simplified" range
// that includes the same versions that the original range does
// If the original range is shorter than the simplified one, return that.
export function simplifyRange(versions: string[], range: RangeLike, options?: OptionsOrLoose): string | RangeLike {
  const set: Array<[string, string | null]> = []
  let first: string | null = null
  let prev: string | null = null
  const v = versions.sort((a, b) => compare(a, b, options))
  for (const version of v) {
    const included = satisfies(version, range, options)
    if (included) {
      prev = version
      if (!first) {
        first = version
      }
    }
    else {
      if (prev && first) {
        set.push([first, prev])
      }
      prev = null
      first = null
    }
  }
  if (first) {
    set.push([first, null])
  }

  const ranges: string[] = []
  for (const [min, max] of set) {
    if (min === max) {
      ranges.push(min)
    }
    else if (!max && min === v[0]) {
      ranges.push('*')
    }
    else if (!max) {
      ranges.push(`>=${min}`)
    }
    else if (min === v[0]) {
      ranges.push(`<=${max}`)
    }
    else {
      ranges.push(`${min} - ${max}`)
    }
  }
  const simplified = ranges.join(' || ')
  const original
    = typeof range === 'object' && range !== null && 'raw' in range && typeof range.raw === 'string'
      ? range.raw
      : String(range)
  return simplified.length < original.length ? simplified : range
}
