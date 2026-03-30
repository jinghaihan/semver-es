import * as classes from '../../src/classes'
import { Comparator } from '../../src/classes/comparator'
import { Range } from '../../src/classes/range'
import { SemVer } from '../../src/classes/semver'
import { tap as t } from '../tap'

t.test('export all classes at semver/classes', (t) => {
  t.equal(classes.SemVer, SemVer)
  t.equal(classes.Range, Range)
  t.equal(classes.Comparator, Comparator)
})
