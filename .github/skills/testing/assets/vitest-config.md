# Vitest Configuration Template

Configuration for testing Midnight contracts and TypeScript code.

## Location

`vitest.config.ts`

## Template

```typescript
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
```

## Setup File

```typescript
// test/setup.ts
import { beforeAll, afterAll } from 'vitest';
import { setNetworkId, NetworkId } from '@midnight-ntwrk/midnight-js-types';

beforeAll(() => {
  // Set network for all tests
  setNetworkId(NetworkId.Undeployed);
});

afterAll(() => {
  // Cleanup
});
```

## Running Tests

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test:coverage

# Run in watch mode
pnpm test:watch

# Run specific file
pnpm test test/contracts/counter.test.ts
```

## Key Options

| Option | Description |
|--------|-------------|
| `globals: true` | Use `describe`, `it` without imports |
| `environment` | `node` for contracts, `jsdom` for components |
| `setupFiles` | Run before tests |
| `coverage` | Code coverage reporting |
| `thresholds` | Minimum coverage requirements |
