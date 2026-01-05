# Advanced Compact Patterns (v0.18)

These examples focus on **valid, up-to-date syntax** (Compact language $0.18$, compiler $0.26$) and the
current ledger ADT + stdlib APIs.

Authoritative references:

- <https://docs.midnight.network/compact/ledger-adt>
- <https://docs.midnight.network/compact/compact-std-library/exports>

## Caller identity (recommended pattern)

Compact doesn’t give you a magical `caller()` primitive for arbitrary contracts. A common approach is to:

1. Ask the DApp for a witness secret.
2. Derive a public identifier via `persistentHash`.
3. `disclose(...)` that derived identifier when it flows to public state.

```compact
witness secretKey(): Bytes<32>;

circuit callerAddress(): Bytes<32> {
  return disclose(persistentHash<Vector<2, Bytes<32>>>([
    pad(32, "midnight:example:addr"),
    secretKey(),
  ]));
}
```

## Access control

### Role-based permissions

```compact
export enum Role { ADMIN, MODERATOR, USER }
export ledger roles: Map<Bytes<32>, Role>;

circuit roleOf(addr: Bytes<32>): Role {
  assert(roles.member(addr), "No role assigned");
  return roles.lookup(addr);
}

export circuit setRole(user: Bytes<32>, role: Role): [] {
  const caller = callerAddress();
  assert(roleOf(caller) == Role::ADMIN, "Admin only");
  roles.insert(disclose(user), disclose(role));
}

export circuit protectedAction(): [] {
  const caller = callerAddress();
  const r = roleOf(caller);
  assert(r == Role::ADMIN || r == Role::MODERATOR, "Forbidden");
  // Protected logic
}
```

### Multi-signature approvals (hash-of-pair)

Avoid nested maps in examples; a simple pattern is to store approvals as a set of hashed pairs.

```compact
export ledger isSigner: Set<Bytes<32>>;
export ledger requiredSigs: Uint<16>;
export ledger approvals: Set<Bytes<32>>;
export ledger approvalCount: Map<Bytes<32>, Uint<16>>;

circuit approvalTag(proposalId: Bytes<32>, signer: Bytes<32>): Bytes<32> {
  return persistentHash<Vector<2, Bytes<32>>>([proposalId, signer]);
}

export circuit approve(proposalId: Bytes<32>): [] {
  const signer = callerAddress();
  assert(isSigner.member(signer), "Not a signer");

  const pid = disclose(proposalId);
  const tag = approvalTag(pid, signer);
  assert(!approvals.member(tag), "Already approved");
  approvals.insert(tag);

  const count = approvalCount.member(pid) ? approvalCount.lookup(pid) : 0;
  approvalCount.insert(pid, (count + 1) as Uint<16>);
}

export circuit canExecute(proposalId: Bytes<32>): Boolean {
  const pid = disclose(proposalId);
  const count = approvalCount.member(pid) ? approvalCount.lookup(pid) : 0;
  return count >= requiredSigs;
}
```

## State machines

Use explicit enums and **block time helpers** (`blockTimeLt`, `blockTimeGte`) instead of relying on a
`blockTime()` getter.

```compact
export enum State { CREATED, ACTIVE, ENDED, CANCELLED }
export ledger state: State;
export ledger owner: Bytes<32>;
export ledger endTime: Uint<64>;

export circuit start(endTimestamp: Uint<64>): [] {
  assert(state == State::CREATED, "Bad state");
  assert(callerAddress() == owner, "Owner only");
  endTime = disclose(endTimestamp);
  state = State::ACTIVE;
}

export circuit end(): [] {
  assert(state == State::ACTIVE, "Bad state");
  assert(blockTimeGte(endTime), "Too early");
  state = State::ENDED;
}
```

## Privacy patterns

### Nullifier set (double-action prevention)

```compact
export ledger nullifiers: Set<Bytes<32>>;

export circuit useNullifier(actionId: Bytes<32>): [] {
  const nul = disclose(persistentHash<Vector<3, Bytes<32>>>([
    pad(32, "midnight:example:nullifier"),
    secretKey(),
    actionId,
  ]));

  assert(!nullifiers.member(nul), "Already used");
  nullifiers.insert(nul);
}
```

### Commitment / reveal

`persistentCommit<T>(value: T, rand: Bytes<32>): Bytes<32>` is safe to store publicly.

```compact
export ledger commitments: Map<Bytes<32>, Bytes<32>>;

export circuit commit(value: Uint<64>, nonce: Bytes<32>): Bytes<32> {
  const who = callerAddress();
  const comm = persistentCommit(value, nonce);
  commitments.insert(who, disclose(comm));
  return disclose(comm);
}
```

## Optimization patterns

### Combine constraints (when error specificity isn’t needed)

```compact
const valid = (a > 0) && (a < 100) && (b > 0) && (b < 100);
assert(valid, "Invalid inputs");
```

### Cache reads

```compact
const bal = balances.member(addr) ? balances.lookup(addr) : 0;
assert(bal >= amount, "Insufficient balance");
balances.insert(addr, bal - amount);
```
