---
description: Optimize a Compact contract for gas efficiency and proof size
name: Optimize Contract
agent: Midnight Developer
tools:
  - search
  - edit/editFiles
---

# Optimize Contract

Optimize a Compact contract for better gas efficiency and smaller proof sizes.

## Input Variables

- **Contract Path**: ${input:contractPath:Path to the contract to optimize}
- **Optimization Goal**: ${input:goal:gas, proof-size, or both}

## Optimization Strategies

### 1. Type Optimization

**Use smallest sufficient types**:

```compact
// Before (wasteful)
counter: Uint<256>

// After (optimized)
counter: Uint<32>  // If max value fits
```

**Bit width guide**:

| Range        | Type     |
| ------------ | -------- |
| 0-255        | Uint<8>  |
| 0-65535      | Uint<16> |
| 0-4B         | Uint<32> |
| Large values | Uint<64> |
| Crypto       | Field    |

### 2. Circuit Simplification

**Minimize operations in circuits**:

```compact
// Before (multiple ops)
export circuit complex(a: Uint<64>, b: Uint<64>, c: Uint<64>): Uint<64> {
  const x = a + b;
  const y = x * c;
  const z = y - a;
  return z;
}

// After (combined where possible)
export circuit optimized(a: Uint<64>, b: Uint<64>, c: Uint<64>): Uint<64> {
  return (a + b) * c - a;
}
```

### 3. State Access Optimization

**Batch reads and writes**:

```compact
export ledger a: Uint<64>;
export ledger b: Uint<64>;

// Before (multiple state accesses + implicit witness flow)
export circuit multiUpdate(): [] {
  a = disclose((a + 1) as Uint<64>);
  b = disclose((a + 2) as Uint<64>);
}

// After (cache values)
export circuit optimizedUpdate(): [] {
  const aNew = (a + 1) as Uint<64>;
  a = disclose(aNew);
  b = disclose((aNew + 2) as Uint<64>);
}
```

### 4. Hash Optimization

**Use appropriate hash functions** (v0.18 stdlib):

```compact
// Derive a persistent identifier (Bytes<32>)
persistentHash<Vector<2, Bytes<32>>>([a, b])

// Transient (Field) hash for within-transaction consistency checks
transientHash<Vector<2, Field>>([x, y])
```

### 5. Assertion Optimization

**Combine related checks**:

```compact
// Before (multiple assertions)
assert(amount > 0, "Amount must be positive");
assert(amount <= balance, "Insufficient balance");

// Could keep separate for better error messages
// OR combine if messages not needed
assert(amount > 0 && amount <= balance, "Invalid amount");
```

## Metrics to Track

1. **Circuit size**: Number of constraints
2. **Proof time**: Seconds to generate proof
3. **Verification time**: On-chain verification cost
4. **State size**: Bytes stored on-chain

## Output Format

Provide:

1. Optimized contract code
2. Before/after metrics comparison
3. Explanation of each optimization
4. Trade-offs (if any)

Use #tool:search to find the contract. Use #tool:edit/editFiles to apply optimizations.
