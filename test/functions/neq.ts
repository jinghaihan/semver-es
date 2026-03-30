import { neq } from '../../src/functions/neq'
import { comparisons } from '../fixtures/comparisons'
import { equality } from '../fixtures/equality'
import { test } from '../tap'

test('comparison tests', (t) => {
  t.plan(comparisons.length)
  comparisons.forEach(([v0, v1, loose]) => t.test(`${v0} ${v1} ${loose}`, (t) => {
    t.plan(4)
    t.ok(neq(v0, v1, loose), `neq(${v0}, ${v1})`)
    t.ok(neq(v1, v0, loose), `neq(${v1}, ${v0})`)
    t.notOk(neq(v1, v1, loose), `!neq('${v1}', '${v1}')`)
    t.notOk(neq(v0, v0, loose), `!neq('${v0}', '${v0}')`)
  }))
})

test('equality tests', (t) => {
  t.plan(equality.length)
  equality.forEach(([v0, v1, loose]) => t.test(`${v0} ${v1} ${loose}`, (t) => {
    t.plan(4)
    t.notOk(neq(v0, v1, loose), `!neq(${v0}, ${v1})`)
    t.notOk(neq(v1, v0, loose), `!neq(${v1}, ${v0})`)
    t.notOk(neq(v0, v0, loose), `!neq(${v0}, ${v0})`)
    t.notOk(neq(v1, v1, loose), `!neq(${v1}, ${v1})`)
  }))
})
