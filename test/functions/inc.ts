import { inc } from '../../src/functions/inc'
import { parse } from '../../src/functions/parse'
import { increments } from '../fixtures/increments'
import { test } from '../tap'

test('increment versions test', (t) => {
  increments.forEach(([pre, what, wanted, options, id, base]) => {
    // @ts-expect-error increments fixture intentionally mixes invalid versions/releases/legacy overloads.
    const found = inc(pre, what, options, id, base)
    const cmd = `inc(${pre}, ${what}, ${id}, ${base})`
    t.equal(found, wanted, `${cmd} === ${wanted}`)

    // @ts-expect-error increments fixture intentionally mixes invalid parse inputs/options.
    const parsed = parse(pre, options)
    // @ts-expect-error increments fixture intentionally mixes invalid parse inputs/options.
    const parsedAsInput = parse(pre, options)
    if (wanted) {
      if (!parsed || !parsedAsInput) {
        t.equal(parsed, null, `${cmd} parse should not be null`)
        return
      }
      // @ts-expect-error increments fixture intentionally mixes invalid release/identifier combinations.
      parsed.inc(what, id, base)
      t.equal(parsed.version, wanted, `${cmd} object version updated`)
      if (parsed.build.length) {
        t.equal(
          parsed.raw,
          `${wanted}+${parsed.build.join('.')}`,
          `${cmd} object raw field updated with build`,
        )
      }
      else {
        t.equal(parsed.raw, wanted, `${cmd} object raw field updated`)
      }

      const preIncObject = JSON.stringify(parsedAsInput)
      // @ts-expect-error increments fixture intentionally mixes invalid release/identifier combinations.
      inc(parsedAsInput, what, options, id, base)
      const postIncObject = JSON.stringify(parsedAsInput)
      t.equal(
        postIncObject,
        preIncObject,
        `${cmd} didn't modify its input`,
      )
    }
    else if (parsed) {
      t.throws(() => {
        // @ts-expect-error increments fixture intentionally mixes invalid release/identifier combinations.
        parsed.inc(what, id, base)
      })
    }
    else {
      t.equal(parsed, null)
    }
  })

  t.end()
})
