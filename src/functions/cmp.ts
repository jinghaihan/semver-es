import type { OptionsOrLoose, SemVerLike } from '../types'
import { eq } from './eq'
import { gt } from './gt'
import { gte } from './gte'
import { lt } from './lt'
import { lte } from './lte'
import { neq } from './neq'

export function cmp(a: SemVerLike, op: string, b: SemVerLike, loose?: OptionsOrLoose): boolean {
  const asComparable = (value: unknown): unknown =>
    typeof value === 'object' && value !== null && 'version' in value
      ? (value as { version: unknown }).version
      : value

  switch (op) {
    case '===':
      a = asComparable(a)
      b = asComparable(b)
      return a === b

    case '!==':
      a = asComparable(a)
      b = asComparable(b)
      return a !== b

    case '':
    case '=':
    case '==':
      return eq(a, b, loose)

    case '!=':
      return neq(a, b, loose)

    case '>':
      return gt(a, b, loose)

    case '>=':
      return gte(a, b, loose)

    case '<':
      return lt(a, b, loose)

    case '<=':
      return lte(a, b, loose)

    default:
      throw new TypeError(`Invalid operator: ${op}`)
  }
}
