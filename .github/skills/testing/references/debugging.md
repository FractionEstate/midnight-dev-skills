# Debugging Midnight Contracts

Debug and troubleshoot Compact smart contracts.

## Common Errors

### Assertion Failures

```text
Error: Assertion failed
```

**Causes:**

- `assert` condition evaluated to false
- `require` condition not met
- Implicit constraint violated

**Debug Steps:**

1. Identify which assertion failed
2. Log inputs before the assertion
3. Verify preconditions are met

```typescript
it('debug assertion', async () => {
  console.log('Ledger state:', simulator.ledger);
  console.log('Input:', { amount: 100n, balance: 50n });

  try {
    await simulator.call('withdraw', { amount: 100n });
  } catch (error) {
    console.log('Error:', error.message);
    // Check: amount > balance -> fails
  }
});
```

### Type Mismatches

```text
Error: Type mismatch: expected Uint<64>, got Uint<32>
```

**Solution:** Ensure consistent types across contract and tests:

```typescript
// ❌ Wrong
await simulator.call('setAmount', { amount: 100 });

// ✅ Correct - use BigInt for Uint
await simulator.call('setAmount', { amount: 100n });
```

### State Not Found

```text
Error: Ledger value not initialized
```

**Solution:** Initialize all ledger values before use:

```typescript
beforeEach(() => {
  simulator = new ContractSimulator(artifact);
  // Initialize required state
  simulator.ledger.counter = 0n;
  simulator.ledger.owner = testAddress;
});
```

## Debugging Techniques

### Log State Before/After

```typescript
async function debugCall(simulator: ContractSimulator, circuit: string, inputs: unknown) {
  console.log('=== Before Call ===');
  console.log('Circuit:', circuit);
  console.log('Inputs:', JSON.stringify(inputs, replacer, 2));
  console.log('Ledger:', JSON.stringify(simulator.ledger, replacer, 2));

  try {
    const result = await simulator.call(circuit, inputs);
    console.log('=== After Call ===');
    console.log('Result:', result);
    console.log('Ledger:', JSON.stringify(simulator.ledger, replacer, 2));
    return result;
  } catch (error) {
    console.log('=== Error ===');
    console.log('Message:', error.message);
    throw error;
  }
}

// BigInt serializer
function replacer(key: string, value: unknown) {
  return typeof value === 'bigint' ? value.toString() + 'n' : value;
}
```

### Step-by-Step Execution

```typescript
it('debug workflow step by step', async () => {
  // Step 1: Initialize
  console.log('Step 1: Initialize');
  await simulator.call('initialize', { owner: alice });
  console.log('Owner set:', simulator.ledger.owner);

  // Step 2: Deposit
  console.log('Step 2: Deposit');
  await simulator.call('deposit', { amount: 100n });
  console.log('Balance:', simulator.ledger.balance);

  // Step 3: Withdraw (this fails)
  console.log('Step 3: Withdraw');
  try {
    await simulator.call('withdraw', { amount: 200n });
  } catch (e) {
    console.log('Failed as expected:', e.message);
    console.log('Balance was:', simulator.ledger.balance);
    console.log('Attempted to withdraw:', 200n);
  }
});
```

### Isolate Problem

```typescript
describe('Debugging specific issue', () => {
  it.only('isolated test', async () => {
    // Focus on just this test
    const simulator = new ContractSimulator(artifact);

    // Minimal setup
    simulator.ledger.value = 50n;

    // Just the failing operation
    const result = await simulator.call('problematicCircuit', {
      input: 100n,
    });

    console.log('Result:', result);
    console.log('Final state:', simulator.ledger);
  });
});
```

## Simulator Debugging

### Inspect Ledger

```typescript
function inspectLedger(simulator: ContractSimulator) {
  const ledger = simulator.ledger;

  console.log('=== Ledger State ===');
  for (const [key, value] of Object.entries(ledger)) {
    if (value instanceof Map) {
      console.log(`${key} (Map):`);
      value.forEach((v, k) => console.log(`  ${k}: ${v}`));
    } else if (value instanceof Set) {
      console.log(`${key} (Set):`, Array.from(value));
    } else {
      console.log(`${key}:`, value);
    }
  }
}
```

### Check Witnesses

```typescript
function debugWithWitness(simulator: ContractSimulator) {
  // Set witness with logging
  const witnessValue = 12345n;
  console.log('Setting witness "randomness" to:', witnessValue);
  simulator.setWitness('randomness', witnessValue);

  // Verify witness is set
  console.log('Witness set successfully');
}
```

### Trace Circuit Execution

```typescript
// Add custom tracing
async function tracedCall(simulator: ContractSimulator, circuit: string, inputs: unknown) {
  const startTime = Date.now();
  console.log(`[${circuit}] Starting with inputs:`, inputs);

  try {
    const result = await simulator.call(circuit, inputs);
    const duration = Date.now() - startTime;
    console.log(`[${circuit}] Completed in ${duration}ms`);
    console.log(`[${circuit}] Result:`, result);
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.log(`[${circuit}] Failed after ${duration}ms`);
    console.log(`[${circuit}] Error:`, error.message);
    throw error;
  }
}
```

## Common Issues

### Map/Set Operations

```typescript
// Check if key exists before accessing
const balance = simulator.ledger.balances.get(address);
if (balance === undefined) {
  console.log('Address not found in balances');
}

// Check set membership
const isMember = simulator.ledger.members.has(address);
console.log('Is member:', isMember);
```

### BigInt Comparison

```typescript
// ❌ Wrong - comparing different types
expect(simulator.ledger.counter).toBe(5);

// ✅ Correct - use BigInt
expect(simulator.ledger.counter).toBe(5n);

// For complex comparisons
expect(Number(simulator.ledger.counter)).toBeGreaterThan(0);
```

### Async Timing

```typescript
// Ensure previous call completes
await simulator.call('firstOperation', {});
// Small delay if needed
await new Promise((r) => setTimeout(r, 100));
await simulator.call('secondOperation', {});
```

## Debug Checklist

1. ☐ NetworkId set to `Undeployed`
2. ☐ Contract artifact loaded correctly
3. ☐ Ledger initialized with required values
4. ☐ Witnesses set for private inputs
5. ☐ Input types match contract expectations (BigInt for Uint)
6. ☐ Preconditions met before circuit call
7. ☐ Previous operations completed
8. ☐ No type mismatches in assertions
