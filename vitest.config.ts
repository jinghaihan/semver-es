import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: [
      'test/**/*.ts',
    ],
    exclude: [
      'test/fixtures/**',
      'test/tap.ts',
    ],
    testTimeout: 20_000,
  },
})
