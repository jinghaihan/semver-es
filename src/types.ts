import type { Comparator } from './classes/comparator'
import type { Range } from './classes/range'
import type { SemVer } from './classes/semver'

export type ReleaseType
  = | 'major'
    | 'premajor'
    | 'minor'
    | 'preminor'
    | 'patch'
    | 'prepatch'
    | 'prerelease'
    | 'release'

export interface Options {
  loose?: boolean | undefined
}

export interface RangeOptions extends Options {
  includePrerelease?: boolean | undefined
}

export interface CoerceOptions extends Options {
  /**
   * If the `options.includePrerelease` flag is set, then the `coerce` result will contain
   * prerelease and build parts of a version. For example, `1.2.3.4-rc.1+rev.2`
   * will preserve prerelease `rc.1` and build `rev.2` in the result.
   *
   * @default false
   */
  includePrerelease?: boolean | undefined
  /**
   * If the `options.rtl` flag is set, then `coerce` will return the right-most
   * coercible tuple that does not share an ending index with a longer coercible
   * tuple. For example, `1.2.3.4` will return `2.3.4` in rtl mode, not
   * `4.0.0`. `1.2.3/4` will return `4.0.0`, because the `4` is not a part of
   * any other overlapping SemVer tuple.
   *
   * @default false
   */
  rtl?: boolean | undefined
}

export type Operator = '===' | '!==' | '' | '=' | '==' | '!=' | '>' | '>=' | '<' | '<='
export type ComparatorOperator = '' | '=' | '<' | '>' | '<=' | '>='
export type Hilo = '>' | '<'
export type OptionsOrLoose = boolean | Options
export type RangeOptionsOrLoose = boolean | RangeOptions
export type ParsedOptions = RangeOptions & CoerceOptions

export type SemVerLike = string | SemVer
export type ComparatorLike = string | Comparator
export type RangeLike = string | Range

export type ComparatorSet = Comparator[]
export type RangeSet = ComparatorSet[]
export type CompareResult = -1 | 0 | 1
export type IdentifierBase = '0' | '1' | false
