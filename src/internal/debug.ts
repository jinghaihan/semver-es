import process from 'node:process'

export const debug = (
  typeof process === 'object'
  && process.env
  && process.env.NODE_DEBUG
  && /\bsemver\b/i.test(process.env.NODE_DEBUG)
)
  ? (...args: unknown[]) => console.error('SEMVER', ...args)
  : () => {}
