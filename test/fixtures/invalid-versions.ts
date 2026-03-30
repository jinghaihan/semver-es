import { MAX_LENGTH, MAX_SAFE_INTEGER } from '../../src/internal/constants'

const OVER_MAX_LENGTH_VERSION = `${'1'.repeat(MAX_LENGTH - 1)}.0.0`

// none of these are semvers
// [value, reason, opt]
export const invalidVersions = [
  [OVER_MAX_LENGTH_VERSION, 'too long'],
  [`${MAX_SAFE_INTEGER}0.0.0`, 'too big'],
  [`0.${MAX_SAFE_INTEGER}0.0`, 'too big'],
  [`0.0.${MAX_SAFE_INTEGER}0`, 'too big'],
  ['hello, world', 'not a version'],
  ['hello, world', 'even loose, its still junk', true],
  ['xyz', 'even loose as an opt, same', { loose: true }],
  [/a regexp/, 'regexp is not a string'],
  [/1.2.3/, 'semver-ish regexp is not a string'],
  [{ toString: () => '1.2.3' }, 'obj with a tostring is not a string'],
]
