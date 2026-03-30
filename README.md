# semver-es

[![npm version][npm-version-src]][npm-version-href]
[![bundle][bundle-src]][bundle-href]
[![JSDocs][jsdocs-src]][jsdocs-href]
[![License][license-src]][license-href]

`semver-es` is an ESM-first TypeScript refactor of [`node-semver`](https://github.com/npm/node-semver). It is designed to keep the upstream root API shape as consistent as possible, so existing semver usage can move to ESM imports with minimal changes.

```sh
pnpm add semver-es
```

## Usage

```ts
import {
  clean,
  coerce,
  Comparator,
  gt,
  lt,
  minVersion,
  Range,
  satisfies,
  SemVer,
  valid,
} from 'semver-es'

valid('1.2.3') // '1.2.3'
valid('a.b.c') // null
clean('  =v1.2.3   ') // '1.2.3'
satisfies('1.2.3', '1.x || >=2.5.0 || 5.0.0 - 7.2.3') // true
gt('2.0.0', '1.9.9') // true
lt('1.2.3', '9.8.7') // true
minVersion('>=1.0.0')?.version // '1.0.0'
valid(coerce('v2')) // '2.0.0'
valid(coerce('42.6.7.9.3-alpha')) // '42.6.7'

new SemVer('1.2.3').version // '1.2.3'
new Range('^1.2.0').range // '>=1.2.0 <2.0.0-0'
new Comparator('>=1.2.3').value // '>=1.2.3'
```

## Avoid Duplicate Bundles

If a dependency still imports `semver`, your bundle may include both `semver` and `semver-es`. Alias those imports to `semver-es` so everything resolves to a single implementation.

For example, with `tsdown`:

```ts
import { defineConfig } from 'tsdown'

export default defineConfig({
  alias: {
    'semver': 'semver-es',
    'semver/functions/valid': 'semver-es/functions/valid',
    'semver/functions/satisfies': 'semver-es/functions/satisfies',
    'semver/ranges/valid': 'semver-es/ranges/valid',
  },
})
```

## License

[MIT](./LICENSE) License © [jinghaihan](https://github.com/jinghaihan)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/semver-es?style=flat&colorA=080f12&colorB=1fa669
[npm-version-href]: https://npmjs.com/package/semver-es
[npm-downloads-src]: https://img.shields.io/npm/dm/semver-es?style=flat&colorA=080f12&colorB=1fa669
[npm-downloads-href]: https://npmjs.com/package/semver-es
[bundle-src]: https://img.shields.io/bundlephobia/minzip/semver-es?style=flat&colorA=080f12&colorB=1fa669&label=minzip
[bundle-href]: https://bundlephobia.com/result?p=semver-es
[license-src]: https://img.shields.io/badge/license-MIT-blue.svg?style=flat&colorA=080f12&colorB=1fa669
[license-href]: https://github.com/jinghaihan/semver-es/LICENSE
[jsdocs-src]: https://img.shields.io/badge/jsdocs-reference-080f12?style=flat&colorA=080f12&colorB=1fa669
[jsdocs-href]: https://www.jsdocs.io/package/semver-es
