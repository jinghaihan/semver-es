import { outside } from '../../src/ranges/outside'
import { versionGtr } from '../fixtures/version-gt-range'
import { versionLtr } from '../fixtures/version-lt-range'
import { versionNotGtr } from '../fixtures/version-not-gt-range'
import { versionNotLtr } from '../fixtures/version-not-lt-range'
import { test } from '../tap'

test('gtr tests', (t) => {
  // [range, version, options]
  // Version should be greater than range
  versionGtr.forEach(([range, version, options = false]) => {
    const msg = `outside(${version}, ${range}, > ${options})`
    t.ok(outside(version, range, '>', options), msg)
  })
  t.end()
})

test('ltr tests', (t) => {
  // [range, version, options]
  // Version should be less than range
  versionLtr.forEach(([range, version, options = false]) => {
    const msg = `outside(${version}, ${range}, <, ${options})`
    t.ok(outside(version, range, '<', options), msg)
  })
  t.end()
})

test('negative gtr tests', (t) => {
  // [range, version, options]
  // Version should NOT be greater than range
  versionNotGtr.forEach(([range, version, options = false]) => {
    const msg = `!outside(${version}, ${range}, > ${options})`
    t.notOk(outside(version, range, '>', options), msg)
  })
  t.end()
})

test('negative ltr tests', (t) => {
  // [range, version, options]
  // Version should NOT be less than range
  versionNotLtr.forEach(([range, version, options = false]) => {
    const msg = `!outside(${version}, ${range}, < ${options})`
    t.notOk(outside(version, range, '<', options), msg)
  })
  t.end()
})

test('outside with bad hilo throws', (t) => {
  t.throws(() => {
    outside('1.2.3', '>1.5.0', 'blerg', true)
  }, new TypeError('Must provide a hilo val of "<" or ">"'))
  t.end()
})
