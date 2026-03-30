import { major } from '../../src/functions/major'
import { test } from '../tap'

test('major tests', (t) => {
  // [range, version]
  // Version should be detectable despite extra characters
  const cases: Array<[string, number, boolean?]> = [
    ['1.2.3', 1],
    [' 1.2.3 ', 1],
    [' 2.2.3-4 ', 2],
    [' 3.2.3-pre ', 3],
    ['v5.2.3', 5],
    [' v8.2.3 ', 8],
    ['\t13.2.3', 13],
    ['=21.2.3', 21, true],
    ['v=34.2.3', 34, true],
  ]
  cases.forEach((tuple) => {
    const range = tuple[0]
    const version = tuple[1]
    const loose = tuple[2] || false
    const msg = `major(${range}) = ${version}`
    t.equal(major(range, loose), version, msg)
  })
  t.end()
})
