# Compact Language Cheatsheet

Quick reference for Compact smart contract development on Midnight Network.

## Pragma

```compact
pragma compact(">=0.18");
```

## Types

| Type | Description | Example |
|------|-------------|---------|
| `Opaque<"string">` | Private string | `ledger name: Opaque<"string">;` |
| `Opaque<"number">` | Private number | `ledger count: Opaque<"number">;` |
| `Opaque<"boolean">` | Private boolean | `ledger active: Opaque<"boolean">;` |
| `Map<K, V>` | Key-value mapping | `ledger users: Map<Opaque<"string">, Opaque<"number">>;` |
| `[]` | Unit/void return | `circuit foo(): []` |

## Ledger Declarations

```compact
// Private (internal only)
ledger privateData: Opaque<"string">;

// Public (DApp accessible)
export ledger publicData: Opaque<"string">;

// Map type
export ledger balances: Map<Opaque<"string">, Opaque<"number">>;
```

## Circuit Functions

```compact
// Basic circuit
export circuit setData(value: Opaque<"string">): [] {
    data = disclose(value);
}

// With return value
export circuit getData(): Opaque<"string"> {
    return data;
}

// With conditional logic
export circuit transfer(to: Opaque<"string">, amount: Opaque<"number">): [] {
    const balance = balances[sender];
    assert balance >= amount;
    balances[sender] = disclose(balance - amount);
    balances[to] = disclose((balances[to] ?? 0) + amount);
}
```

## The disclose() Operator

**Purpose**: Selectively reveal private values to make them public on-chain.

```compact
// Without disclose - COMPILE ERROR
publicLedger = privateValue;

// With disclose - CORRECT
publicLedger = disclose(privateValue);
```

**When to use**:
- Assigning private values to public ledger
- Making computation results visible on-chain
- Creating proof witnesses

## Access Control Pattern

```compact
export ledger owner: Opaque<"string">;

export circuit onlyOwner(caller: Opaque<"string">): [] {
    assert caller == owner;
}

export circuit adminAction(caller: Opaque<"string">, value: Opaque<"number">): [] {
    assert caller == owner;
    // Admin logic here
}
```

## Map Operations

```compact
export ledger scores: Map<Opaque<"string">, Opaque<"number">>;

export circuit setScore(user: Opaque<"string">, score: Opaque<"number">): [] {
    scores[user] = disclose(score);
}

export circuit getScore(user: Opaque<"string">): Opaque<"number"> {
    return scores[user] ?? 0;  // Default to 0 if not found
}
```

## Common Patterns

### Counter

```compact
export ledger count: Opaque<"number">;

export circuit increment(): [] {
    count = disclose((count ?? 0) + 1);
}
```

### Toggle

```compact
export ledger enabled: Opaque<"boolean">;

export circuit toggle(): [] {
    enabled = disclose(!(enabled ?? false));
}
```

### Voting

```compact
export ledger votes: Map<Opaque<"string">, Opaque<"number">>;
export ledger hasVoted: Map<Opaque<"string">, Opaque<"boolean">>;

export circuit vote(voter: Opaque<"string">, option: Opaque<"string">): [] {
    assert !(hasVoted[voter] ?? false);
    hasVoted[voter] = disclose(true);
    votes[option] = disclose((votes[option] ?? 0) + 1);
}
```

## Compilation

```bash
# Compile contract
compact compile contracts/mycontract.compact contracts/managed/mycontract

# Output files:
# - contracts/managed/mycontract/contract.cjs  (TypeScript interface)
# - contracts/managed/mycontract/circuit.zkey  (ZK proving key)
```

## Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| "Cannot assign private to public" | Missing `disclose()` | Wrap with `disclose()` |
| "Type mismatch" | Wrong Opaque type | Check type annotations |
| "Undefined ledger" | Missing `export` | Add `export` keyword |
| "Version mismatch" | Wrong pragma | Use `pragma compact(">=0.18");` |

## Resources

- [Midnight Docs](https://docs.midnight.network)
- [Compact Tutorial](https://docs.midnight.network/develop/tutorial/building-your-first-midnight-dapp/compact)
- [Example Contracts](https://github.com/midnightntwrk/midnight-examples)
