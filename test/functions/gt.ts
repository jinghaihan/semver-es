import { gt } from '../../src/functions/gt'
import { comparisons } from '../fixtures/comparisons'
import { equality } from '../fixtures/equality'
import { test } from '../tap'

test('comparison tests', (t) => {
  t.plan(comparisons.length)
  comparisons.forEach(([v0, v1, loose]) => t.test(`${v0} ${v1} ${loose}`, (t) => {
    t.plan(4)
    t.ok(gt(v0, v1, loose), `gt('${v0}', '${v1}')`)
    t.ok(!gt(v1, v0, loose), `!gt('${v1}', '${v0}')`)
    t.ok(!gt(v1, v1, loose), `!gt('${v1}', '${v1}')`)
    t.ok(!gt(v0, v0, loose), `!gt('${v0}', '${v0}')`)
  }))
})

test('equality tests', (t) => {
  t.plan(equality.length)
  equality.forEach(([v0, v1, loose]) => t.test(`${v0} ${v1} ${loose}`, (t) => {
    t.plan(2)
    t.ok(!gt(v0, v1, loose), `!gt(${v0}, ${v1})`)
    t.ok(!gt(v1, v0, loose), `!gt(${v1}, ${v0})`)
  }))
})
