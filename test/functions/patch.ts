import { patch } from '../../src/functions/patch'
import { test } from '../tap'

test('patch tests', (t) => {
  // [range, version]
  // Version should be detectable despite extra characters
  const cases: Array<[string, number, boolean?]> = [
    ['1.2.1', 1],
    [' 1.2.1 ', 1],
    [' 1.2.2-4 ', 2],
    [' 1.2.3-pre ', 3],
    ['v1.2.5', 5],
    [' v1.2.8 ', 8],
    ['\t1.2.13', 13],
    ['=1.2.21', 21, true],
    ['v=1.2.34', 34, true],
  ]
  cases.forEach((tuple) => {
    const range = tuple[0]
    const version = tuple[1]
    const loose = tuple[2] || false
    const msg = `patch(${range}) = ${version}`
    t.equal(patch(range, loose), version, msg)
  })
  t.end()
})
