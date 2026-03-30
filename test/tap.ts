import { expect, it } from 'vitest'

type Awaitable<T> = T | Promise<T>

type TestCallback = (t: Tap) => Awaitable<void>

export interface Tap {
  cleanSnapshot: (value: unknown) => unknown
  end: (...args: unknown[]) => void
  plan: (...args: unknown[]) => void
  test: (name: unknown, fn?: TestCallback) => void
  equal: (actual: unknown, expected?: unknown, message?: unknown) => void
  strictEqual: (actual: unknown, expected?: unknown, message?: unknown) => void
  not: (actual: unknown, expected?: unknown, message?: unknown) => void
  ok: (value: unknown, ...messages: unknown[]) => void
  notOk: (value: unknown, ...messages: unknown[]) => void
  same: (actual: unknown, expected?: unknown, message?: unknown) => void
  strictSame: (actual: unknown, expected?: unknown, message?: unknown) => void
  match: (actual: unknown, expected?: unknown, message?: unknown) => void
  notMatch: (actual: unknown, expected?: unknown, message?: unknown) => void
  throws: (fn: () => unknown, expected?: unknown, message?: unknown) => void
  doesNotThrow: (fn: () => unknown, message?: unknown) => void
  resolveMatchSnapshot: <T>(promise: Promise<T>, hint?: string) => Promise<T>
  matchSnapshot: (value: unknown, hint?: string) => void
}

function applyCleanSnapshot(value: unknown, cleaner: (value: unknown) => unknown): unknown {
  if (typeof value === 'string') {
    return cleaner(value)
  }

  if (Array.isArray(value)) {
    return value.map(v => applyCleanSnapshot(v, cleaner))
  }

  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = applyCleanSnapshot(v, cleaner)
    }
    return out
  }

  return value
}

function matchValue(actual: unknown, expected: unknown): void {
  if (expected === Number) {
    expect(typeof actual).toBe('number')
    return
  }

  if (expected === String) {
    expect(typeof actual).toBe('string')
    return
  }

  if (expected === Boolean) {
    expect(typeof actual).toBe('boolean')
    return
  }

  if (expected === Array) {
    expect(Array.isArray(actual)).toBe(true)
    return
  }

  if (expected === Object) {
    expect(actual && typeof actual === 'object' && !Array.isArray(actual)).toBe(true)
    return
  }

  if (expected === RegExp) {
    expect(actual).toBeInstanceOf(RegExp)
    return
  }

  if (expected instanceof RegExp) {
    expect(actual).toMatch(expected)
    return
  }

  if (typeof expected === 'object' && expected !== null) {
    const actualRecord
      = actual && typeof actual === 'object'
        ? actual as Record<string, unknown>
        : undefined
    for (const [key, value] of Object.entries(expected as Record<string, unknown>)) {
      if (value === undefined) {
        expect(actualRecord?.[key]).toBeUndefined()
        continue
      }
      matchValue(actualRecord?.[key], value)
    }
    return
  }

  expect(actual).toBe(expected)
}

let testDepth = 0

export const tap: Tap = {
  cleanSnapshot: value => value,
  end: () => {},
  plan: () => {},
  test: (name, fn) => {
    if (testDepth > 0) {
      if (!fn) {
        return
      }
      void fn(tap)
      return
    }

    it(String(name), async () => {
      if (!fn) {
        return
      }

      testDepth++
      try {
        await fn(tap)
      }
      finally {
        testDepth--
      }
    })
  },
  equal: (actual, expected) => expect(actual).toBe(expected),
  strictEqual: (actual, expected) => expect(actual).toBe(expected),
  not: (actual, expected) => expect(actual).not.toBe(expected),
  ok: value => expect(value).toBeTruthy(),
  notOk: value => expect(value).toBeFalsy(),
  same: (actual, expected) => expect(actual).toEqual(expected),
  strictSame: (actual, expected) => expect(actual).toEqual(expected),
  match: (actual, expected) => matchValue(actual, expected),
  notMatch: (actual, expected) => {
    if (expected instanceof RegExp) {
      expect(actual).not.toMatch(expected)
      return
    }
    expect(actual).not.toMatchObject(expected as Record<string, unknown>)
  },
  throws: (fn, expected) => {
    if (expected && typeof expected === 'object' && !(expected instanceof RegExp) && !(expected instanceof Error)) {
      let err: unknown
      try {
        fn()
      }
      catch (error) {
        err = error
      }
      expect(err).toBeTruthy()
      expect(err).toMatchObject(expected)
      return
    }

    if (expected instanceof Error) {
      expect(fn).toThrow(expected.message)
      return
    }

    if (expected !== undefined) {
      if (typeof expected === 'string') {
        expect(fn).toThrow()
        return
      }
      expect(fn).toThrow(expected)
      return
    }

    expect(fn).toThrow()
  },
  doesNotThrow: fn => expect(fn).not.toThrow(),
  resolveMatchSnapshot: async <T>(promise: Promise<T>, hint?: string): Promise<T> => {
    const value = await promise
    const cleaned = applyCleanSnapshot(value, tap.cleanSnapshot)
    expect(cleaned).toMatchSnapshot(hint)
    return value
  },
  matchSnapshot: (value, hint) => {
    const cleaned = applyCleanSnapshot(value, tap.cleanSnapshot)
    expect(cleaned).toMatchSnapshot(hint)
  },
}

export const test: Tap['test'] = tap.test
