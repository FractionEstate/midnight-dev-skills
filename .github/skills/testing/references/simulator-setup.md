# Simulator Setup

Configure the Compact contract simulator for testing.

## Installation

```bash
npm install -D @midnight-ntwrk/compact-simulator @midnight-ntwrk/midnight-js-network-id vitest
```

## Basic Setup

```typescript
import { ContractSimulator } from '@midnight-ntwrk/compact-simulator';
import { setNetworkId, NetworkId } from '@midnight-ntwrk/midnight-js-network-id';

// Always set network ID for testing
setNetworkId(NetworkId.Undeployed);

// Load compiled contract
import contractArtifact from './contracts/managed/my-contract/contract/contract.json';

// Create simulator
const simulator = new ContractSimulator(contractArtifact);
```

## Project Structure

```text
project/
├── contracts/
│   ├── my-contract.compact
│   └── managed/
│       └── my-contract/
│           └── contract/
│               └── contract.json
├── test/
│   ├── setup.ts
│   ├── my-contract.test.ts
│   └── helpers.ts
├── vitest.config.ts
└── package.json
```

## Vitest Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./test/setup.ts'],
    testTimeout: 30000,  // Proof generation can be slow
    coverage: {
      reporter: ['text', 'json', 'html']
    }
  }
});
```

## Test Setup File

```typescript
// test/setup.ts
import { setNetworkId, NetworkId } from '@midnight-ntwrk/midnight-js-network-id';

// Set network before any tests run
beforeAll(() => {
  setNetworkId(NetworkId.Undeployed);
});
```

## Creating Simulator Instances

### Basic Simulator

```typescript
import { ContractSimulator } from '@midnight-ntwrk/compact-simulator';

function createSimulator() {
  return new ContractSimulator(contractArtifact);
}
```

### With Initial State

```typescript
function createSimulatorWithState(initialState: Partial<LedgerState>) {
  const simulator = new ContractSimulator(contractArtifact);

  // Set initial ledger values
  if (initialState.counter !== undefined) {
    simulator.ledger.counter = initialState.counter;
  }
  if (initialState.owner !== undefined) {
    simulator.ledger.owner = initialState.owner;
  }

  return simulator;
}
```

### With Witnesses

```typescript
function createSimulatorWithWitnesses(witnesses: Record<string, unknown>) {
  const simulator = new ContractSimulator(contractArtifact);

  // Set witness values
  for (const [name, value] of Object.entries(witnesses)) {
    simulator.setWitness(name, value);
  }

  return simulator;
}
```

## Helper Functions

```typescript
// test/helpers.ts

// Generate random bytes
export function randomBytes(length: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(length));
}

// Generate sample address
export function sampleAddress(): Uint8Array {
  return randomBytes(32);
}

// Convert bigint to contract-compatible format
export function toBigInt(value: number): bigint {
  return BigInt(value);
}

// Wait for async state updates
export async function waitFor(condition: () => boolean, timeout = 5000): Promise<void> {
  const start = Date.now();
  while (!condition()) {
    if (Date.now() - start > timeout) {
      throw new Error('Condition not met within timeout');
    }
    await new Promise(r => setTimeout(r, 100));
  }
}
```

## Multiple Contract Testing

```typescript
// test/integration.test.ts
import { ContractSimulator } from '@midnight-ntwrk/compact-simulator';

describe('Multi-contract integration', () => {
  let tokenSimulator: ContractSimulator;
  let auctionSimulator: ContractSimulator;

  beforeEach(() => {
    tokenSimulator = new ContractSimulator(tokenArtifact);
    auctionSimulator = new ContractSimulator(auctionArtifact);
  });

  it('should transfer tokens for auction', async () => {
    // Mint tokens
    await tokenSimulator.call('mint', {
      recipient: buyer,
      amount: 1000n
    });

    // Transfer to auction
    await tokenSimulator.call('transfer', {
      from: buyer,
      to: auctionAddress,
      amount: 500n
    });

    expect(tokenSimulator.ledger.balances.get(buyer)).toBe(500n);
  });
});
```

## Mock Services

```typescript
// Mock proof provider (no actual proof generation)
const mockProofProvider = {
  async generateProof(circuit: string, inputs: unknown) {
    return {
      proof: new Uint8Array(288),
      publicInputs: inputs
    };
  }
};

// Mock wallet provider
const mockWalletProvider = {
  coinPublicKey: 'mock-public-key',
  async balanceAndProveOwnership() {
    return 1000000n;
  },
  async submitTransaction(tx: unknown) {
    return { txId: 'mock-tx-id' };
  }
};
```

## Environment Variables

```bash
# .env.test
NETWORK_ID=undeployed
MOCK_PROOFS=true
TEST_TIMEOUT=30000
```

```typescript
// Load in tests
import 'dotenv/config';

const timeout = parseInt(process.env.TEST_TIMEOUT || '30000');
```

## Best Practices

1. **Always set NetworkId** to `Undeployed` in test setup
2. **Fresh simulator per test** - Create new instance in `beforeEach`
3. **Helper functions** - Centralize common operations
4. **Typed artifacts** - Generate types from contract artifacts
5. **Mock external services** - Don't depend on network in unit tests
6. **Reasonable timeouts** - Account for ZK computation time
