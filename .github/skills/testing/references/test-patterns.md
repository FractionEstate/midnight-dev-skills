# Test Patterns

Common patterns for testing Midnight smart contracts.

## Basic Circuit Testing

### Test Circuit Return Values

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { ContractSimulator } from '@midnight-ntwrk/compact-simulator';

describe('Calculator Contract', () => {
  let simulator: ContractSimulator;

  beforeEach(() => {
    simulator = new ContractSimulator(contractArtifact);
  });

  it('should add two numbers', async () => {
    const result = await simulator.call('add', { a: 5n, b: 3n });
    expect(result).toBe(8n);
  });

  it('should multiply two numbers', async () => {
    const result = await simulator.call('multiply', { a: 4n, b: 7n });
    expect(result).toBe(28n);
  });
});
```

### Test Ledger State Changes

```typescript
describe('Counter Contract', () => {
  let simulator: ContractSimulator;

  beforeEach(() => {
    simulator = new ContractSimulator(contractArtifact);
  });

  it('should start at zero', () => {
    expect(simulator.ledger.counter).toBe(0n);
  });

  it('should increment counter', async () => {
    await simulator.call('increment', {});
    expect(simulator.ledger.counter).toBe(1n);
  });

  it('should increment multiple times', async () => {
    await simulator.call('increment', {});
    await simulator.call('increment', {});
    await simulator.call('increment', {});
    expect(simulator.ledger.counter).toBe(3n);
  });

  it('should decrement counter', async () => {
    await simulator.call('increment', {});
    await simulator.call('increment', {});
    await simulator.call('decrement', {});
    expect(simulator.ledger.counter).toBe(1n);
  });
});
```

## Error Testing

### Test Assertion Failures

```typescript
describe('Error Handling', () => {
  it('should reject negative decrement', async () => {
    // Counter starts at 0
    await expect(
      simulator.call('decrement', {})
    ).rejects.toThrow();
  });

  it('should reject unauthorized access', async () => {
    const nonOwner = randomBytes(32);

    await expect(
      simulator.call('adminAction', { caller: nonOwner })
    ).rejects.toThrow('Assertion failed');
  });

  it('should reject invalid amount', async () => {
    await expect(
      simulator.call('transfer', {
        from: alice,
        to: bob,
        amount: 1000000n  // More than balance
      })
    ).rejects.toThrow();
  });
});
```

### Test Edge Cases

```typescript
describe('Edge Cases', () => {
  it('should handle zero amount', async () => {
    await expect(
      simulator.call('transfer', { amount: 0n })
    ).rejects.toThrow();
  });

  it('should handle maximum value', async () => {
    const maxUint64 = 2n ** 64n - 1n;
    await simulator.call('setAmount', { amount: maxUint64 });
    expect(simulator.ledger.amount).toBe(maxUint64);
  });

  it('should handle empty string', async () => {
    await simulator.call('setMessage', { message: '' });
    expect(simulator.ledger.message).toBe('');
  });
});
```

## State Machine Testing

```typescript
describe('Auction State Machine', () => {
  let simulator: ContractSimulator;

  beforeEach(() => {
    simulator = new ContractSimulator(auctionArtifact);
  });

  it('should start in CREATED state', () => {
    expect(simulator.ledger.state).toBe('CREATED');
  });

  it('should transition CREATED -> ACTIVE', async () => {
    await simulator.call('startAuction', { caller: owner });
    expect(simulator.ledger.state).toBe('ACTIVE');
  });

  it('should reject start when already active', async () => {
    await simulator.call('startAuction', { caller: owner });

    await expect(
      simulator.call('startAuction', { caller: owner })
    ).rejects.toThrow();
  });

  it('should follow complete lifecycle', async () => {
    // CREATED -> ACTIVE
    await simulator.call('startAuction', { caller: owner });
    expect(simulator.ledger.state).toBe('ACTIVE');

    // Place bids
    await simulator.call('placeBid', { bidder: alice, amount: 100n });
    await simulator.call('placeBid', { bidder: bob, amount: 150n });

    // ACTIVE -> ENDED
    await simulator.call('endAuction', {});
    expect(simulator.ledger.state).toBe('ENDED');
    expect(simulator.ledger.winner).toEqual(bob);
  });
});
```

## Token Contract Testing

```typescript
describe('Token Contract', () => {
  let simulator: ContractSimulator;
  const owner = randomBytes(32);
  const alice = randomBytes(32);
  const bob = randomBytes(32);

  beforeEach(() => {
    simulator = new ContractSimulator(tokenArtifact);
    simulator.ledger.owner = owner;
  });

  describe('Minting', () => {
    it('should mint tokens to recipient', async () => {
      await simulator.call('mint', {
        caller: owner,
        recipient: alice,
        amount: 1000n
      });

      expect(simulator.ledger.balances.get(alice)).toBe(1000n);
      expect(simulator.ledger.totalSupply).toBe(1000n);
    });

    it('should reject minting by non-owner', async () => {
      await expect(
        simulator.call('mint', {
          caller: alice,  // Not owner
          recipient: bob,
          amount: 1000n
        })
      ).rejects.toThrow();
    });
  });

  describe('Transfers', () => {
    beforeEach(async () => {
      // Setup: mint tokens to alice
      await simulator.call('mint', {
        caller: owner,
        recipient: alice,
        amount: 1000n
      });
    });

    it('should transfer tokens', async () => {
      await simulator.call('transfer', {
        from: alice,
        to: bob,
        amount: 300n
      });

      expect(simulator.ledger.balances.get(alice)).toBe(700n);
      expect(simulator.ledger.balances.get(bob)).toBe(300n);
    });

    it('should reject transfer exceeding balance', async () => {
      await expect(
        simulator.call('transfer', {
          from: alice,
          to: bob,
          amount: 2000n  // More than alice has
        })
      ).rejects.toThrow();
    });
  });
});
```

## Privacy Testing

```typescript
describe('Privacy Guarantees', () => {
  it('should not reveal private vote', async () => {
    await simulator.call('vote', {
      voter: alice,
      choice: true  // This should stay private
    });

    // Only totals should be visible
    expect(simulator.ledger.yesVotes).toBe(1n);
    expect(simulator.ledger.noVotes).toBe(0n);

    // Individual choice should NOT be in ledger
    expect(simulator.ledger.votes).toBeUndefined();
    expect(simulator.ledger.aliceVote).toBeUndefined();
  });

  it('should return boolean not actual value', async () => {
    const result = await simulator.call('checkBalance', {
      balance: 5000n,
      required: 1000n
    });

    // Only get boolean, not actual balance
    expect(result).toBe(true);
    expect(typeof result).toBe('boolean');
  });
});
```

## Witness Testing

```typescript
describe('Witness Functionality', () => {
  it('should use witness for commitment', async () => {
    // Set witness value
    simulator.setWitness('randomness', 12345n);

    // Create commitment
    const commitment = await simulator.call('commit', {
      value: 100n
    });

    expect(commitment).toBeDefined();
    expect(simulator.ledger.commitments.has(commitment)).toBe(true);
  });

  it('should verify commitment with correct witness', async () => {
    simulator.setWitness('randomness', 12345n);

    const commitment = await simulator.call('commit', { value: 100n });

    // Reveal should succeed with same witness
    await expect(
      simulator.call('reveal', { value: 100n, commitment })
    ).resolves.not.toThrow();
  });

  it('should reject reveal with wrong witness', async () => {
    simulator.setWitness('randomness', 12345n);
    const commitment = await simulator.call('commit', { value: 100n });

    // Change witness
    simulator.setWitness('randomness', 99999n);

    // Reveal should fail
    await expect(
      simulator.call('reveal', { value: 100n, commitment })
    ).rejects.toThrow();
  });
});
```

## Test Organization

```typescript
describe('MyContract', () => {
  // Group by functionality
  describe('Initialization', () => {
    // Tests for initial state
  });

  describe('Core Operations', () => {
    // Tests for main circuit functions
  });

  describe('Error Handling', () => {
    // Tests for error conditions
  });

  describe('Access Control', () => {
    // Tests for permissions
  });

  describe('Privacy', () => {
    // Tests for privacy guarantees
  });

  describe('Integration', () => {
    // Tests for multi-circuit workflows
  });
});
```
