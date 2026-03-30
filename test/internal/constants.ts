import * as constants from '../../src/internal/constants'
import { tap as t } from '../tap'

t.test('constants have expected data types', (t) => {
  t.match(constants, {
    MAX_LENGTH: Number,
    MAX_SAFE_COMPONENT_LENGTH: Number,
    MAX_SAFE_INTEGER: Number,
    RELEASE_TYPES: Array,
    SEMVER_SPEC_VERSION: String,
  }, 'got appropriate data types exported')
})
