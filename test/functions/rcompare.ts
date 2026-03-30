import { rcompare } from '../../src/functions/rcompare'
import { test } from '../tap'

test('rcompare', (t) => {
  t.equal(rcompare('1.0.0', '1.0.1'), 1)
  t.equal(rcompare('1.0.0', '1.0.0'), 0)
  t.equal(rcompare('1.0.0+0', '1.0.0'), 0)
  t.equal(rcompare('1.0.1', '1.0.0'), -1)

  t.end()
})
