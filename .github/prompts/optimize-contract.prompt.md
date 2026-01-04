---
description: "Optimize a Compact contract for gas efficiency and circuit complexity"

---

# Optimize Compact Contract

Analyze and optimize a Compact contract for better performance.

## Contract to Optimize

${input:contract_path:Path to the contract file}

## Optimization Goals

${input:optimization_focus:Focus area - "circuit_complexity", "state_size", "gas", or "all"}

## Optimization Analysis

### 1. Circuit Complexity
- [ ] Minimize number of constraints in circuits
- [ ] Reduce hash operations (each adds ~thousands of constraints)
- [ ] Simplify conditional logic
- [ ] Use appropriate bit widths (Uint<8> vs Uint<256>)

### 2. Ledger State
- [ ] Use Counter instead of Cell<Uint> for incrementing
- [ ] Batch updates where possible
- [ ] Consider Map vs Set for membership checks
- [ ] Minimize MerkleTree depth

### 3. Type Optimization
| Before | After | Savings |
|--------|-------|---------|
| `Uint<256>` | `Uint<64>` | ~3x constraints |
| Multiple hashes | Single hash2 | ~50% constraints |
| Deep nesting | Flat structs | Complexity |

### 4. Pattern Improvements
```compact
// ❌ Inefficient: Multiple ledger reads
const a = ledger.values[key1];
const b = ledger.values[key2];

// ✅ Better: Batch operations when possible
// Structure data to minimize reads
```

## Deliverables

1. **Analysis Report**
   - Current complexity metrics
   - Identified bottlenecks
   - Recommended changes

2. **Optimized Contract**
   - Refactored code
   - Comments explaining optimizations

3. **Comparison**
   - Before/after metrics
   - Trade-offs made
