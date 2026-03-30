import { ltr } from '../../src/ranges/ltr'
import { versionLtr } from '../fixtures/version-lt-range'
import { versionNotLtr } from '../fixtures/version-not-lt-range'
import { test } from '../tap'

test('ltr tests', (t) => {
  // [range, version, options]
  // Version should be less than range
  versionLtr.forEach(([range, version, options = false]) => {
    const msg = `ltr(${version}, ${range}, ${options})`
    t.ok(ltr(version, range, options), msg)
  })
  t.end()
})

test('negative ltr tests', (t) => {
  // [range, version, options]
  // Version should NOT be less than range
  versionNotLtr.forEach(([range, version, options = false]) => {
    const msg = `!ltr(${version}, ${range}, ${options})`
    t.notOk(ltr(version, range, options), msg)
  })
  t.end()
})
