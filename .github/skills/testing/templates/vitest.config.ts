// Vitest Configuration for Midnight Projects
// Location: vitest.config.ts

import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    // Test environment
    environment: 'node',

    // Global test setup
    globals: true,

    // Setup files run before each test file
    setupFiles: ['./test/setup.ts'],

    // Test file patterns
    include: [
      'test/**/*.test.ts',
      'test/**/*.spec.ts',
      'src/**/*.test.ts',
    ],

    // Exclude patterns
    exclude: [
      'node_modules',
      'dist',
      'e2e',
    ],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.test.ts',
        'src/types/**',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
        statements: 80,
      },
    },

    // Timeout for long-running tests (proof generation)
    testTimeout: 60000,
    hookTimeout: 30000,

    // Retry failed tests
    retry: process.env.CI ? 2 : 0,

    // Reporter configuration
    reporters: process.env.CI
      ? ['default', 'junit']
      : ['default'],
    outputFile: {
      junit: './test-results/junit.xml',
    },

    // Type checking
    typecheck: {
      enabled: true,
      include: ['test/**/*.ts'],
    },

    // Pool configuration for parallel tests
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        minThreads: 1,
        maxThreads: 4,
      },
    },

    // Sequence configuration
    sequence: {
      shuffle: true,
      seed: Date.now(),
    },
  },

  // Path resolution
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@contracts': path.resolve(__dirname, './contracts'),
      '@test': path.resolve(__dirname, './test'),
    },
  },

  // ESBuild options for TypeScript
  esbuild: {
    target: 'node20',
  },
});
