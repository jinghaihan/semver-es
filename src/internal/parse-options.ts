import type {
  CoerceOptions,
  Options,
  ParsedOptions,
  RangeOptions,
} from '../types'

// parse out just the options we care about
const looseOption: ParsedOptions = Object.freeze({ loose: true })
const emptyOpts: ParsedOptions = Object.freeze({})

type ParseableOptions = Options | RangeOptions | CoerceOptions | boolean | undefined | null

export function parseOptions(options?: ParseableOptions): ParsedOptions {
  if (!options)
    return emptyOpts

  if (typeof options !== 'object')
    return looseOption

  return options as ParsedOptions
}
