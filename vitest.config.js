import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/unit/**/*.test.js'],
    // Several suites spawn the real CLI (node maiass.mjs) in throwaway git
    // repos — process startup + git I/O can exceed vitest's 5s default,
    // especially when files run in parallel. Give them headroom; the per-call
    // timeout inside runCli still guards against genuine hangs.
    testTimeout: 60000,
    hookTimeout: 60000,
    coverage: {
      provider: 'v8',
      include: ['lib/**/*.js'],
      exclude: ['lib/colors.js', 'lib/symbols.js'],
      reporter: ['text', 'html'],
      reportsDirectory: 'coverage'
    }
  }
});
