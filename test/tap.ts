import { expect, it } from 'vitest'

type Awaitable<T> = T | Promise<T>

type TestCallback = (t: Tap) => Awaitable<void>

export interface Tap {
  cleanSnapshot: (value: any) => any
  end: (...args: any[]) => void
  plan: (...args: any[]) => void
  test: (name: any, fn?: TestCallback) => void
  equal: (actual: any, expected?: any, message?: any) => void
  strictEqual: (actual: any, expected?: any, message?: any) => void
  not: (actual: any, expected?: any, message?: any) => void
  ok: (value: any, ...messages: any[]) => void
  notOk: (value: any, ...messages: any[]) => void
  same: (actual: any, expected?: any, message?: any) => void
  strictSame: (actual: any, expected?: any, message?: any) => void
  match: (actual: any, expected?: any, message?: any) => void
  notMatch: (actual: any, expected?: any, message?: any) => void
  throws: (fn: () => unknown, expected?: any, message?: any) => void
  doesNotThrow: (fn: () => unknown, message?: any) => void
  resolveMatchSnapshot: (promise: Promise<any>, hint?: string) => Promise<any>
  matchSnapshot: (value: any, hint?: string) => void
}

function applyCleanSnapshot(value: any, cleaner: (value: any) => any): any {
  if (typeof value === 'string') {
    return cleaner(value)
  }

  if (Array.isArray(value)) {
    return value.map(v => applyCleanSnapshot(v, cleaner))
  }

  if (value && typeof value === 'object') {
    const out: Record<string, any> = {}
    for (const [k, v] of Object.entries(value)) {
      out[k] = applyCleanSnapshot(v, cleaner)
    }
    return out
  }

  return value
}

function matchValue(actual: any, expected: any): void {
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
    for (const [key, value] of Object.entries(expected)) {
      if (value === undefined) {
        expect(actual?.[key]).toBeUndefined()
        continue
      }
      matchValue(actual?.[key], value)
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
    expect(actual).not.toMatchObject(expected)
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
  resolveMatchSnapshot: async (promise, hint) => {
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
