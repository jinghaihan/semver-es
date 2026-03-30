import type { OptionsOrLoose, RangeOptionsOrLoose } from '../../src/types'

export type ComparisonCase = [string, string, OptionsOrLoose?]
export type EqualityCase = [string, string, boolean?]
export type ComparatorIntersectionCase = [string, string, boolean, boolean?]
export type RangeIntersectionCase = [string, string, boolean]
export type RangeParseCase = [string, string | null, RangeOptionsOrLoose?]
export type RangeIncludeCase = [string, string, unknown?]
export type RangeExcludeCase = [string, string | false, unknown?]
export type VersionRangeCase
  = | [string, string]
    | [string, string, boolean | { includePrerelease: boolean }]
export type ValidVersionCase = [string, number, number, number, Array<string | number>, string[]]
export type InvalidVersionCase = [string | RegExp | { toString: () => string }, string, OptionsOrLoose?]
