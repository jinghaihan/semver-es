import type { Comparator } from './classes/comparator'

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
  includePrerelease?: boolean | undefined
}

export interface RangeOptions extends Options {
  includePrerelease?: boolean | undefined
}

export interface CoerceOptions extends Options {
  includePrerelease?: boolean | undefined
  rtl?: boolean | undefined
}

export type OptionsOrLoose = unknown
export type RangeOptionsOrLoose = unknown
export type ParsedOptions = (RangeOptions & CoerceOptions) & Record<string, unknown>

export type SemVerLike = unknown
export type ComparatorLike = unknown
export type RangeLike = unknown

export type SemVerInput = unknown
export type ComparatorInput = unknown
export type RangeInput = unknown

export type ComparatorSet = Comparator[]
export type RangeSet = ComparatorSet[]
export type CompareResult = -1 | 0 | 1
export type IdentifierBase = '0' | '1' | false

export type Operator = '===' | '!==' | '' | '=' | '==' | '!=' | '>' | '>=' | '<' | '<='
