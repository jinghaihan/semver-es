import { Comparator } from '../../src/classes/comparator'
import { Range } from '../../src/classes/range'
import { rangeExclude } from '../fixtures/range-exclude'
import { rangeInclude } from '../fixtures/range-include'
import { rangeIntersection } from '../fixtures/range-intersection'
import { rangeParse } from '../fixtures/range-parse'
import { test } from '../tap'

test('range tests', (t) => {
  t.plan(rangeInclude.length)
  rangeInclude.forEach(([range, ver, options]) => {
    const r = new Range(range, options)
    t.ok(r.test(ver), `${range} satisfied by ${ver}`)
  })
})

test('range parsing', (t) => {
  t.plan(rangeParse.length)
  rangeParse.forEach(([range, expect, options]) =>
    t.test(`${range} ${expect} ${JSON.stringify(options)}`, (t) => {
      if (expect === null) {
        t.throws(() => new Range(range, options), TypeError, `invalid range: ${range}`)
      }
      else {
        t.equal(new Range(range, options).range || '*', expect, `${range} => ${expect}`)
        t.equal(new Range(range, options).range, new Range(expect).range, 'parsing both yields same result')
      }
      t.end()
    }))
})

test('throw for empty comparator set, even in loose mode', (t) => {
  t.throws(() => new Range('sadf||asdf', { loose: true }), new TypeError('Invalid SemVer Range: sadf||asdf'))
  t.end()
})

test('convert comparator to range', (t) => {
  const c = new Comparator('>=1.2.3')
  const r = new Range(c)
  t.equal(r.raw, c.value, 'created range from comparator')
  t.end()
})

test('range as argument to range ctor', (t) => {
  const loose = new Range('1.2.3', { loose: true })
  t.equal(new Range(loose, { loose: true }), loose, 'loose option')
  t.equal(new Range(loose, true), loose, 'loose boolean')
  t.not(new Range(loose), loose, 'created new range if not matched')

  const incPre = new Range('1.2.3', { includePrerelease: true })
  t.equal(new Range(incPre, { includePrerelease: true }), incPre, 'include prerelease, option match returns argument')
  t.not(new Range(incPre), incPre, 'include prerelease, option mismatch does not return argument')

  t.end()
})

test('negative range tests', (t) => {
  t.plan(rangeExclude.length)
  rangeExclude.forEach(([range, ver, options]) => {
    const r = new Range(range, options)
    t.notOk(r.test(ver), `${range} not satisfied by ${ver}`)
  })
})

test('strict vs loose ranges', (t) => {
  [
    ['>=01.02.03', '>=1.2.3'],
    ['~1.02.03beta', '>=1.2.3-beta <1.3.0-0'],
  ].forEach(([loose, comps]) => {
    t.throws(() => new Range(loose))
    t.equal(new Range(loose, true).range, comps)
  })
  t.end()
})

test('tostrings', (t) => {
  t.equal(new Range('>= v1.2.3').toString(), '>=1.2.3')
  t.end()
})

test('formatted value is calculated lazily and cached', (t) => {
  const r = new Range('>= v1.2.3')
  t.equal(r.formatted, undefined)
  t.equal(r.format(), '>=1.2.3')
  t.equal(r.formatted, '>=1.2.3')
  t.equal(r.format(), '>=1.2.3')
  t.end()
})

test('ranges intersect', (t) => {
  rangeIntersection.forEach(([r0, r1, expect]) => {
    t.test(`${r0} <~> ${r1}`, (t) => {
      const range0 = new Range(r0)
      const range1 = new Range(r1)

      t.equal(range0.intersects(range1), expect, `${r0} <~> ${r1} objects`)
      t.equal(range1.intersects(range0), expect, `${r1} <~> ${r0} objects`)
      t.end()
    })
  })
  t.end()
})

test('missing range parameter in range intersect', (t) => {
  t.throws(() => {
    new Range('1.0.0').intersects()
  }, new TypeError('a Range is required'), 'throws type error')
  t.end()
})

test('cache', (t) => {
  const cached = Symbol('cached')
  const r1 = new Range('1.0.0')
  ;(r1.set[0] as unknown as Record<PropertyKey, unknown>)[cached] = true
  const r2 = new Range('1.0.0')
  t.equal((r1.set[0] as unknown as Record<PropertyKey, unknown>)[cached], true)
  t.equal((r2.set[0] as unknown as Record<PropertyKey, unknown>)[cached], true) // Will be true, showing it's cached.
  t.end()
})
