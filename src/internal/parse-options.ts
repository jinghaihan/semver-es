import type { ParsedOptions } from '../types'

// parse out just the options we care about
const looseOption: ParsedOptions = Object.freeze({ loose: true })
const emptyOpts: ParsedOptions = Object.freeze({})

export function parseOptions(options?: unknown): ParsedOptions {
  if (!options)
    return emptyOpts

  if (typeof options !== 'object')
    return looseOption

  return options as ParsedOptions
}
