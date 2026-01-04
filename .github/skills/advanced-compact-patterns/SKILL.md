---
name: advanced-compact-patterns
description: Advanced patterns for sophisticated Midnight Compact smart contracts. Use when users need access control, state machines, privacy patterns, optimization techniques, or production-ready contract architectures. Triggers on complex contract requirements, multi-signature, voting systems, auctions, upgrade patterns, or ZK optimization.
---

# Advanced Compact Patterns

Master sophisticated patterns for production-grade Midnight smart contracts.

## When to Use This Skill

- Implementing role-based access control
- Building state machines (auctions, workflows)
- Creating privacy-preserving voting/verification
- Optimizing ZK circuit performance
- Designing upgradeable contracts

## Pattern Categories

| Pattern | Use Case |
|---------|----------|
| Access Control | Role-based permissions, multi-sig |
| State Machines | Workflows, auctions, escrows |
| Privacy | Private voting, range proofs, selective disclosure |
| Data Structures | Efficient storage, batch operations |
| Upgrades | Pausable, versioned contracts |
| Optimization | Reduced constraints, cached reads |

## Access Control Pattern

```compact
pragma compact(">=0.25");

export enum Role { ADMIN, MODERATOR, USER }
export ledger owner: Opaque<"address">;
export ledger roles: Map<Opaque<"address">, Role>;

export circuit addRole(caller: Opaque<"address">, user: Opaque<"address">, role: Role): [] {
  require(roles[disclose(caller)] == Role::ADMIN);
  roles[disclose(user)] = role;
}

export circuit protectedAction(caller: Opaque<"address">): [] {
  require(roles[disclose(caller)] == Role::ADMIN ||
          roles[disclose(caller)] == Role::MODERATOR);
  // Protected logic
}
```

## State Machine Pattern

```compact
export enum State { CREATED, ACTIVE, ENDED, CANCELLED }
export ledger state: State;

export circuit startAuction(caller: Opaque<"address">): [] {
  require(state == State::CREATED);
  require(disclose(caller) == owner);
  state = State::ACTIVE;
}

export circuit endAuction(currentTime: Opaque<"number">): [] {
  require(state == State::ACTIVE);
  require(disclose(currentTime) >= endTime);
  state = State::ENDED;
}
```

## Private Voting Pattern

```compact
export ledger totalVotes: Opaque<"number">;
export ledger yesVotes: Opaque<"number">;
export ledger hasVoted: Map<Opaque<"address">, Boolean>;

export circuit vote(voter: Opaque<"address">, voteYes: Boolean): [] {
  require(!hasVoted[disclose(voter)]);
  hasVoted[disclose(voter)] = true;
  totalVotes = disclose(totalVotes + 1);

  if (voteYes) {
    yesVotes = disclose(yesVotes + 1);
  }
  // Individual vote remains private, only totals public
}
```

## Age Verification (Range Proof)

```compact
export ledger verified: Map<Opaque<"address">, Boolean>;

export circuit verifyAge(user: Opaque<"address">, age: Opaque<"number">, minAge: Opaque<"number">): [] {
  require(age >= minAge);  // Proven in ZK
  verified[disclose(user)] = true;
  // Actual age never stored or revealed
}
```

## Optimization Patterns

### Combine Constraints
```compact
// ❌ Inefficient: 6 constraints
require(a > 0); require(a < 100);
require(b > 0); require(b < 100);

// ✅ Efficient: 1 constraint
let valid = (a > 0) && (a < 100) && (b > 0) && (b < 100);
require(valid);
```

### Cache Storage Reads
```compact
// ❌ Inefficient: Multiple reads
require(balance >= amount);
let remaining = balance - amount;

// ✅ Efficient: Single read
let currentBalance = balance;
require(currentBalance >= disclose(amount));
balance = disclose(currentBalance - amount);
```

## Upgrade Pattern

```compact
export ledger admin: Opaque<"address">;
export ledger paused: Boolean;
export ledger version: Opaque<"number">;

export circuit pause(caller: Opaque<"address">): [] {
  require(disclose(caller) == admin);
  paused = true;
}

export circuit upgrade(caller: Opaque<"address">, newVersion: Opaque<"number">): [] {
  require(disclose(caller) == admin);
  require(paused);
  require(disclose(newVersion) > version);
  version = disclose(newVersion);
}
```

## Multi-Signature Pattern

```compact
export ledger signers: Map<Opaque<"address">, Boolean>;
export ledger requiredSigs: Opaque<"number">;
export ledger proposalSigs: Map<Opaque<"number">, Map<Opaque<"address">, Boolean>>;

export circuit createProposal(caller: Opaque<"address">): Opaque<"number"> {
  require(signers[disclose(caller)]);
  let id = disclose(proposalCount);
  proposalSigs[id][disclose(caller)] = true;
  proposalCount = disclose(proposalCount + 1);
  return id;
}

export circuit signProposal(caller: Opaque<"address">, id: Opaque<"number">): [] {
  require(signers[disclose(caller)]);
  proposalSigs[disclose(id)][disclose(caller)] = true;
}
```

## Production Checklist

```
✓ All inputs validated with require()
✓ Access control on sensitive functions
✓ State transitions properly guarded
✓ Integer overflow/underflow prevented
✓ Privacy levels clearly defined
✓ Unit tests for all circuits
✓ Edge cases tested
✓ Gas optimization applied
```

## Detailed Reference

See `references/patterns.md` for complete implementations of:
- Full auction contract
- Token with allowances
- DAO governance
- Cross-contract communication
- Testing patterns

## Resources

- Compact Reference: https://docs.midnight.network/develop/reference/compact/
- Security Best Practices: https://docs.midnight.network/develop/guides/
