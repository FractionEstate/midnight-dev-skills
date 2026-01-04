---
description: Testing guidelines for Midnight Network contracts and dApps
name: Testing Guidelines
applyTo: "**/test/**,**/*.test.ts,**/*.spec.ts"
---

# Midnight Contract Testing Guidelines

You are an expert in testing Midnight Network smart contracts and dApps.

## Testing Framework Setup

### Vitest Configuration
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['test/**/*.test.ts', 'contracts/**/*.test.ts'],
    testTimeout: 60000, // Proof generation can be slow
    hookTimeout: 30000
  }
});
```

### Test Setup File
```typescript
// test/setup.ts
import { beforeAll, afterAll } from 'vitest';
import { startProofServer, stopProofServer } from './helpers/proof-server';

let proofServerProcess: any;

beforeAll(async () => {
  proofServerProcess = await startProofServer();
});

afterAll(async () => {
  await stopProofServer(proofServerProcess);
});
```

## Contract Testing with Simulator

### Simulator Pattern
```typescript
import { constructorContext, QueryContext, sampleContractAddress } from "@midnight-ntwrk/compact-runtime";
import { Contract, ledger } from "../managed/mycontract/contract/index.cjs";

export class MyContractSimulator {
  readonly contract: Contract<PrivateState>;
  circuitContext: CircuitContext<PrivateState>;

  constructor(initialPrivateState: PrivateState) {
    this.contract = new Contract<PrivateState>(witnesses);
    const { currentPrivateState, currentContractState, currentZswapLocalState } =
      this.contract.initialState(constructorContext(initialPrivateState, "0".repeat(64)));

    this.circuitContext = {
      currentPrivateState,
      currentZswapLocalState,
      originalState: currentContractState,
      transactionContext: new QueryContext(currentContractState.data, sampleContractAddress())
    };
  }

  public getLedger() {
    return ledger(this.circuitContext.transactionContext.state);
  }

  public myCircuit(arg: Arg): Result {
    this.circuitContext = this.contract.impureCircuits.myCircuit(this.circuitContext, arg).context;
    return ledger(this.circuitContext.transactionContext.state);
  }
}
```

### Unit Test Example
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { MyContractSimulator } from './simulator';
import { setNetworkId, NetworkId } from "@midnight-ntwrk/midnight-js-network-id";

setNetworkId(NetworkId.Undeployed);

describe('MyContract', () => {
  let sim: MyContractSimulator;

  beforeEach(() => {
    sim = new MyContractSimulator({ privateCounter: 0 });
  });

  it('initializes with zero counter', () => {
    expect(sim.getLedger().counter).toEqual(0n);
  });

  it('increments counter correctly', () => {
    sim.increment(5n);
    expect(sim.getLedger().counter).toEqual(5n);
  });

  it('rejects negative increment', () => {
    expect(() => sim.increment(-1n)).toThrow('Invalid amount');
  });
});
```

## Testing Privacy Patterns

### Test Commitment Schemes
```typescript
describe('Commitment', () => {
  it('verifies valid commitment', () => {
    const secret = randomField();
    const commitment = sim.commit(secret);
    expect(() => sim.reveal(secret, commitment)).not.toThrow();
  });

  it('rejects invalid preimage', () => {
    const secret = randomField();
    const wrongSecret = randomField();
    const commitment = sim.commit(secret);
    expect(() => sim.reveal(wrongSecret, commitment)).toThrow('Invalid commitment');
  });
});
```

### Test Nullifiers
```typescript
describe('Nullifier', () => {
  it('allows first claim', () => {
    const secret = randomField();
    expect(() => sim.claim(secret)).not.toThrow();
  });

  it('prevents double claim', () => {
    const secret = randomField();
    sim.claim(secret);
    expect(() => sim.claim(secret)).toThrow('Already claimed');
  });
});
```

## Integration Testing

### With Deployed Contract
```typescript
describe('Integration', () => {
  let contract: DeployedContract;

  beforeAll(async () => {
    contract = await deployContract(providers, {
      contract: MyContractFactory,
      initialPrivateState: {}
    });
  });

  it('executes circuit on chain', async () => {
    const result = await contract.call.increment({ amount: 10n });
    const receipt = await result.wait();

    expect(receipt.status).toBe('success');
    expect(await contract.query.counter()).toBe(10n);
  });
});
```

## Best Practices

1. **Use simulators for unit tests**: Faster, no network required
2. **Test edge cases**: Empty values, max values, boundaries
3. **Test privacy invariants**: Ensure secrets stay hidden
4. **Test error messages**: Verify descriptive assertions
5. **Use integration tests sparingly**: Only for full flow verification
6. **Set appropriate timeouts**: ZK proofs can take time
