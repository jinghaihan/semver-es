import { SEMVER_SPEC_VERSION } from '../src/index'
import { tap as t } from './tap'

t.test('SEMVER_SPEC_VERSION export', (t) => {
  t.equal(SEMVER_SPEC_VERSION, '2.0.0', 'exports semver spec version')
})
