# semver-es Agent Guide

## Goal

This repository is an **ESM-only** TypeScript migration of `node-semver`.

Primary runtime target:

- Support named ESM imports from the package root, for example:
  - `import { gt } from 'semver-es'`
  - `import { satisfies, Range, SemVer } from 'semver-es'`

Non-goals for now:

- CommonJS compatibility (`require(...)`)
- Subpath import compatibility (`semver-es/functions/*`, `semver-es/ranges/*`)
- CLI/bin implementation and bin-related tests
- README updates during this migration phase

## Source of Truth

- Upstream implementation: `/Users/jinghaihan/code/forks/node-semver`
- Current migration workspace: `/Users/jinghaihan/code/repos/semver-es`

Behavioral parity should match upstream root API as closely as possible.

## Required Structure

Keep the project layout aligned with upstream modules, while staying ESM + TS.

```text
semver-es/
  src/
    index.ts
    classes/
      comparator.ts
      index.ts
      range.ts
      semver.ts
    functions/
      clean.ts
      cmp.ts
      coerce.ts
      compare-build.ts
      compare-loose.ts
      compare.ts
      diff.ts
      eq.ts
      gt.ts
      gte.ts
      inc.ts
      lt.ts
      lte.ts
      major.ts
      minor.ts
      neq.ts
      parse.ts
      patch.ts
      prerelease.ts
      rcompare.ts
      rsort.ts
      satisfies.ts
      sort.ts
      valid.ts
    internal/
      constants.ts
      debug.ts
      identifiers.ts
      lrucache.ts
      parse-options.ts
      re.ts
    ranges/
      gtr.ts
      intersects.ts
      ltr.ts
      max-satisfying.ts
      min-satisfying.ts
      min-version.ts
      outside.ts
      simplify.ts
      subset.ts
      to-comparators.ts
      valid.ts
    types.ts
  test/
    (migrated upstream tests + fixtures, adapted to Vitest, excluding bin tests)
```

## Type Location Rule

All shared/public types must live in `src/types.ts`.

Use `src/types.ts` as the canonical place for:

- `ReleaseType`
- `Operator`
- `Options`
- `RangeOptions`
- `CoerceOptions`
- any migration helper types needed by runtime modules

## Migration Rules

1. Preserve algorithm behavior and edge cases from upstream.
2. Convert `require/module.exports` to ESM `import/export`.
3. Keep file naming close to upstream for traceability.
4. Migrate upstream tests to Vitest (fixtures and behavior assertions).
5. Final quality gate for this phase:
   - `pnpm lint --fix`
   - `pnpm typecheck`

## Notes for Contributors

- Prefer small, traceable commits by module group (`internal`, `classes`, `functions`, `ranges`, `test`).
- Do not silently change semantics while "cleaning up" style.
- If behavior differs from upstream, add a regression test before changing logic.
