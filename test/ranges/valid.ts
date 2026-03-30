import { validRange } from '../../src/ranges/valid'
import { rangeParse } from '../fixtures/range-parse'
import { test } from '../tap'

test('valid range test', (t) => {
  // validRange(range) -> result
  // translate ranges into their canonical form
  t.plan(rangeParse.length)
  rangeParse.forEach(([pre, wanted, options]) =>
    t.equal(validRange(pre, options), wanted, `validRange(${pre}) === ${wanted} ${JSON.stringify(options)}`))
})
