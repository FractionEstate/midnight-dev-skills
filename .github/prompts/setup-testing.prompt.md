---
description: Set up a testing environment for Midnight contracts
name: Setup Testing
agent: Midnight Developer
tools:
  - edit/editFiles
  - execute/runInTerminal
---

# Setup Testing

Set up a complete testing environment for Midnight Network contracts.

## Input Variables

- **Project Path**: ${input:projectPath:Root path of the project}
- **Test Framework**: ${input:framework:vitest or jest}
- **Test Type**: ${input:testType:unit, integration, or both}

## Setup Steps

### 1. Install Dependencies

```bash
npm install -D vitest @vitest/ui typescript ts-node
npm install -D @midnight-ntwrk/compact-runtime
npm install -D @midnight-ntwrk/midnight-js-network-id
```

### 2. Vitest Configuration

Create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['test/**/*.test.ts', 'contracts/**/*.test.ts'],
    testTimeout: 60000,
    hookTimeout: 30000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['**/node_modules/**', '**/managed/**'],
    },
  },
});
```

### 3. Test Setup File

Create `test/setup.ts`:

```typescript
import { beforeAll } from 'vitest';
import { setNetworkId, NetworkId } from '@midnight-ntwrk/midnight-js-network-id';

beforeAll(() => {
  // Required for contract simulation
  setNetworkId(NetworkId.Undeployed);
});
```

### 4. Contract Simulator Helper

Create `test/helpers/simulator.ts`:

```typescript
import {
  constructorContext,
  QueryContext,
  sampleContractAddress,
} from '@midnight-ntwrk/compact-runtime';

export function createSimulator<T, P>(ContractClass: any, witnesses: any, initialPrivateState: P) {
  const contract = new ContractClass(witnesses);

  const { currentPrivateState, currentContractState, currentZswapLocalState } =
    contract.initialState(constructorContext(initialPrivateState, '0'.repeat(64)));

  return {
    contract,
    context: {
      currentPrivateState,
      currentZswapLocalState,
      originalState: currentContractState,
      transactionContext: new QueryContext(currentContractState.data, sampleContractAddress()),
    },
  };
}
```

### 5. Example Test File

Create `test/contract.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { createSimulator } from './helpers/simulator';
import { Contract, ledger, Witnesses } from '../managed/contract/contract/index.cjs';

describe('Contract', () => {
  let sim: ReturnType<typeof createSimulator>;

  beforeEach(() => {
    sim = createSimulator(Contract, Witnesses, { privateValue: 0n });
  });

  it('initializes correctly', () => {
    const state = ledger(sim.context.transactionContext.state);
    expect(state.counter).toBe(0n);
  });
});
```

### 6. Package.json Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage"
  }
}
```

## Output Format

Provide:

1. All configuration files
2. Helper utilities
3. Example test files
4. NPM scripts
5. Instructions to run tests

Use #tool:execute/runInTerminal to install dependencies. Use #tool:edit/editFiles to create configuration files.
