import { satisfies } from '../../src/functions/satisfies'
import { rangeExclude } from '../fixtures/range-exclude'
import { rangeInclude } from '../fixtures/range-include'
import { test } from '../tap'

test('range tests', (t) => {
  t.plan(rangeInclude.length)
  rangeInclude.forEach(([range, ver, options]) =>
    t.ok(
      // @ts-expect-error rangeInclude intentionally exercises legacy option shapes.
      satisfies(ver, range, options),
      `${range} satisfied by ${ver}`,
    ))
})

test('negative range tests', (t) => {
  t.plan(rangeExclude.length)
  rangeExclude.forEach(([range, ver, options]) =>
    t.notOk(
      // @ts-expect-error rangeExclude intentionally includes invalid versions and legacy option shapes.
      satisfies(ver, range, options),
      `${range} not satisfied by ${ver}`,
    ))
})

test('invalid ranges never satisfied (but do not throw)', (t) => {
  const cases: Array<[string, string | undefined, boolean?]> = [
    ['blerg', '1.2.3'],
    ['git+https://user:password0123@github.com/foo', '123.0.0', true],
    ['^1.2.3', '2.0.0-pre'],
    ['0.x', undefined],
    ['*', undefined],
  ]
  t.plan(cases.length)
  cases.forEach(([range, ver]) =>
    t.notOk(
      // @ts-expect-error these cases intentionally include invalid range/version inputs.
      satisfies(ver, range),
      `${range} not satisfied because invalid`,
    ))
})
