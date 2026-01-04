---
name: testing
description: >-
  Test Midnight smart contracts using simulators and unit tests. Use when setting up test
  environments, writing contract tests, or debugging circuit behavior. Triggers on testing,
  simulator, unit test, or test framework questions.
---

# Testing Midnight Contracts

Test Compact smart contracts using simulators and test frameworks.

## Quick Start

```typescript
import { ContractSimulator } from '@midnight-ntwrk/compact-simulator';

// Create simulator
const simulator = new ContractSimulator(compiledContract);

// Call circuit
const result = await simulator.call('increment', {});

// Check state
expect(simulator.ledger.counter).toBe(1n);
```

## Reference Files

| Topic | Resource |
| ----- | -------- |
| **Simulator Setup** | [references/simulator-setup.md](references/simulator-setup.md) |
| **Test Patterns** | [references/test-patterns.md](references/test-patterns.md) |
| **Debugging** | [references/debugging.md](references/debugging.md) |

## Test Environment

```text
┌──────────────────────────────────────────────┐
│              Test Environment                │
├──────────────────────────────────────────────┤
│  ┌────────────────┐  ┌────────────────┐     │
│  │   Contract     │  │    Contract    │     │
│  │   Simulator    │  │    Artifacts   │     │
│  └────────────────┘  └────────────────┘     │
│           │                  │               │
│           └────────┬─────────┘               │
│                    ▼                         │
│           ┌────────────────┐                 │
│           │   Test Suite   │                 │
│           │   (Jest/Vitest)│                 │
│           └────────────────┘                 │
└──────────────────────────────────────────────┘
```

## Installation

```bash
npm install -D @midnight-ntwrk/compact-simulator vitest
```

## Basic Test Structure

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { ContractSimulator } from '@midnight-ntwrk/compact-simulator';
import { setNetworkId, NetworkId } from '@midnight-ntwrk/midnight-js-network-id';

describe('MyContract', () => {
  let simulator: ContractSimulator;

  beforeEach(() => {
    setNetworkId(NetworkId.Undeployed);
    simulator = new ContractSimulator(compiledContract);
  });

  it('should initialize with zero', async () => {
    expect(simulator.ledger.counter).toBe(0n);
  });

  it('should increment counter', async () => {
    await simulator.call('increment', {});
    expect(simulator.ledger.counter).toBe(1n);
  });
});
```

## Testing Patterns

### State Verification

```typescript
it('should update ledger state', async () => {
  // Initial state
  expect(simulator.ledger.message).toBe('');

  // Call circuit
  await simulator.call('setMessage', { input: 'Hello' });

  // Verify state
  expect(simulator.ledger.message).toBe('Hello');
});
```

### Error Testing

```typescript
it('should reject invalid input', async () => {
  await expect(
    simulator.call('withdraw', { amount: 1000n })
  ).rejects.toThrow('Assertion failed');
});
```

### Privacy Testing

```typescript
it('should not reveal private inputs', async () => {
  const result = await simulator.call('checkBalance', {
    balance: 1000n,
    required: 500n
  });

  // Result is boolean, not actual balance
  expect(result).toBe(true);
  // Ledger should not contain balance
  expect(simulator.ledger.balance).toBeUndefined();
});
```

## Best Practices

- ✅ Test each circuit function independently
- ✅ Verify state changes after each call
- ✅ Test error conditions and edge cases
- ✅ Mock witnesses for privacy testing
- ✅ Use `NetworkId.Undeployed` for testing
- ❌ Don't test proof generation (use simulator)
- ❌ Don't rely on network in unit tests

## Test Categories

| Category | Tests |
| -------- | ----- |
| **Unit** | Individual circuit functions |
| **Integration** | Multi-circuit workflows |
| **State** | Ledger state transitions |
| **Error** | Assertion failures |
| **Privacy** | Data not leaked |

## Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- counter.test.ts

# Watch mode
npm test -- --watch
```
