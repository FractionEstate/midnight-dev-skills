// @ts-nocheck
// Vitest Configuration Template
// Location: vitest.config.ts
// Configuration for testing Midnight contracts and TypeScript code

import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    // Test environment
    environment: 'node',
    globals: true,

    // Test file patterns
    include: ['test/**/*.test.ts', 'test/**/*.spec.ts'],
    exclude: ['node_modules', 'dist', '.next'],

    // Setup files
    setupFiles: ['./test/setup.ts'],

    // Timeouts
    testTimeout: 30000,
    hookTimeout: 30000,

    // Coverage
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.ts', 'lib/**/*.ts'],
      exclude: ['**/*.d.ts', '**/*.test.ts', '**/types.ts'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },

    // Reporter
    reporters: ['verbose'],
  },

  // Path aliases
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@/contracts': path.resolve(__dirname, './contracts'),
      '@/lib': path.resolve(__dirname, './lib'),
    },
  },
});
