import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/unit/**/*.test.js'],
    coverage: {
      provider: 'v8',
      include: ['lib/**/*.js'],
      exclude: ['lib/colors.js', 'lib/symbols.js'],
      reporter: ['text', 'html'],
      reportsDirectory: 'coverage'
    }
  }
});
