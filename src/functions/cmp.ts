import type { Operator, OptionsOrLoose, SemVerLike } from '../types'
import { SemVer } from '../classes/semver'
import { eq } from './eq'
import { gt } from './gt'
import { gte } from './gte'
import { lt } from './lt'
import { lte } from './lte'
import { neq } from './neq'

/**
 * Pass in a comparison string, and it'll call the corresponding semver comparison function.
 * "===" and "!==" do simple string comparison, but are included for completeness.
 * Throws if an invalid comparison string is provided.
 */
export function cmp(
  v1: SemVerLike,
  operator: Operator,
  v2: SemVerLike,
  optionsOrLoose?: OptionsOrLoose,
): boolean {
  const asComparable = (value: SemVerLike): string => value instanceof SemVer ? value.version : value

  switch (operator) {
    case '===':
      v1 = asComparable(v1)
      v2 = asComparable(v2)
      return v1 === v2

    case '!==':
      v1 = asComparable(v1)
      v2 = asComparable(v2)
      return v1 !== v2

    case '':
    case '=':
    case '==':
      return eq(v1, v2, optionsOrLoose)

    case '!=':
      return neq(v1, v2, optionsOrLoose)

    case '>':
      return gt(v1, v2, optionsOrLoose)

    case '>=':
      return gte(v1, v2, optionsOrLoose)

    case '<':
      return lt(v1, v2, optionsOrLoose)

    case '<=':
      return lte(v1, v2, optionsOrLoose)

    default:
      throw new TypeError(`Invalid operator: ${operator}`)
  }
}
