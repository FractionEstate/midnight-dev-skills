# Midnight Contract Test Template

Unit tests for Compact contracts using the simulator.

## Location

`test/contracts/[contract].test.ts`

## Template

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { NetworkId, setNetworkId } from '@midnight-ntwrk/midnight-js-types';
import { Contract, Ledger } from '@/contracts/my-contract';

// Simulator wrapper class
class ContractSimulator {
  private state: Ledger;
  private context: any;

  constructor() {
    // Initialize with constructor context
    this.context = Contract.constructorContext();
    this.state = this.getLedger();
  }

  private getLedger(): Ledger {
    return this.context.transactionContext.state;
  }

  // Expose ledger state
  get ledger(): Ledger {
    return this.state;
  }

  // Circuit wrappers
  increment(amount: bigint): void {
    this.context = Contract.increment(this.context, amount);
    this.state = this.getLedger();
  }

  decrement(amount: bigint): void {
    this.context = Contract.decrement(this.context, amount);
    this.state = this.getLedger();
  }
}

describe('MyContract', () => {
  let simulator: ContractSimulator;

  beforeEach(() => {
    // Set network for testing
    setNetworkId(NetworkId.Undeployed);

    // Create fresh simulator
    simulator = new ContractSimulator();
  });

  describe('constructor', () => {
    it('should initialize with default values', () => {
      expect(simulator.ledger.counter).toBe(0n);
    });
  });

  describe('increment', () => {
    it('should increase counter', () => {
      simulator.increment(5n);
      expect(simulator.ledger.counter).toBe(5n);
    });

    it('should accumulate multiple increments', () => {
      simulator.increment(3n);
      simulator.increment(7n);
      expect(simulator.ledger.counter).toBe(10n);
    });
  });

  describe('decrement', () => {
    it('should decrease counter', () => {
      simulator.increment(10n);
      simulator.decrement(3n);
      expect(simulator.ledger.counter).toBe(7n);
    });

    it('should fail when decrementing below zero', () => {
      expect(() => simulator.decrement(1n)).toThrow(
        'Counter cannot go below zero'
      );
    });
  });
});
```

## Testing Patterns

### Testing Assertions

```typescript
it('should reject invalid input', () => {
  expect(() => simulator.setOwner(invalidAddress)).toThrow(
    'Only owner can transfer'
  );
});
```

### Testing State Changes

```typescript
it('should update multiple fields atomically', () => {
  simulator.transfer(recipient, amount);

  expect(simulator.ledger.balances.get(sender)).toBe(initialBalance - amount);
  expect(simulator.ledger.balances.get(recipient)).toBe(amount);
});
```

### Testing Witnesses

```typescript
it('should verify commitment with witness', () => {
  const secret = 12345n;
  const commitment = hash(secret);

  // Store commitment
  simulator.commit(commitment);

  // Reveal should succeed with correct witness
  expect(() => simulator.reveal(secret)).not.toThrow();

  // Reveal should fail with wrong witness
  expect(() => simulator.reveal(99999n)).toThrow('Invalid commitment');
});
```

## Vitest Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['test/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
  },
});
```

## Key Patterns

| Pattern | Description |
|---------|-------------|
| `setNetworkId(Undeployed)` | Required for simulator |
| Simulator class | Wraps contract for testing |
| `constructorContext()` | Initialize contract state |
| Circuit methods | Update context and state |
| `expect().toThrow()` | Test assertion failures |
