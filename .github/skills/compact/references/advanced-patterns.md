# Advanced Compact Patterns

Production-grade patterns for sophisticated Midnight smart contracts.

## Access Control

### Role-Based Permissions

```compact
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

### Multi-Signature

```compact
export ledger signers: Map<Opaque<"address">, Boolean>;
export ledger requiredSigs: Opaque<"number">;
export ledger proposalSigs: Map<Opaque<"number">, Map<Opaque<"address">, Boolean>>;
export ledger proposalCount: Map<Opaque<"number">, Opaque<"number">>;

export circuit proposeAndSign(proposalId: Opaque<"number">, signer: Opaque<"address">): [] {
  require(signers[disclose(signer)]);  // Must be authorized signer
  require(!proposalSigs[disclose(proposalId)][disclose(signer)]);  // Not already signed

  proposalSigs[disclose(proposalId)][disclose(signer)] = true;
  proposalCount[disclose(proposalId)] = disclose(proposalCount[disclose(proposalId)] + 1);
}

export circuit execute(proposalId: Opaque<"number">): [] {
  require(proposalCount[disclose(proposalId)] >= requiredSigs);
  // Execute action
}
```

## State Machines

```compact
export enum State { CREATED, ACTIVE, ENDED, CANCELLED }
export ledger state: State;
export ledger endTime: Opaque<"number">;

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

export circuit cancelAuction(caller: Opaque<"address">): [] {
  require(state == State::CREATED || state == State::ACTIVE);
  require(disclose(caller) == owner);
  state = State::CANCELLED;
}
```

## Privacy Patterns

### Private Voting

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

### Age Verification (Range Proof)

```compact
export ledger verified: Map<Opaque<"address">, Boolean>;

export circuit verifyAge(user: Opaque<"address">, age: Opaque<"number">, minAge: Opaque<"number">): [] {
  require(age >= minAge);  // Proven in ZK, actual age never revealed
  verified[disclose(user)] = true;
}
```

### Commitment-Reveal

```compact
ledger commitments: Map<Bytes<32>, Field>;
ledger reveals: Map<Bytes<32>, Uint<64>>;
witness randomness: Field;

circuit commit(user: Bytes<32>, value: Uint<64>): [] {
  const commitment = persistentCommit(value, randomness);
  commitments[user] = commitment;
}

circuit reveal(user: Bytes<32>, value: Uint<64>): [] {
  const stored = commitments[user];
  assert persistentCommit(value, randomness) == stored;
  reveals[user] = value;
  disclose(value);
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

### Minimize Disclosures

```compact
// ❌ Reveals more than needed
disclose(actualBalance);

// ✅ Reveals minimum
disclose(actualBalance >= requiredAmount);
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

export circuit unpause(caller: Opaque<"address">): [] {
  require(disclose(caller) == admin);
  paused = false;
}

export circuit upgrade(caller: Opaque<"address">, newVersion: Opaque<"number">): [] {
  require(disclose(caller) == admin);
  require(paused);
  require(disclose(newVersion) > version);
  version = disclose(newVersion);
}

export circuit guardedAction(): [] {
  require(!paused);
  // Action logic
}
```

## Escrow Pattern

```compact
enum EscrowState { AWAITING_PAYMENT, AWAITING_DELIVERY, COMPLETE, REFUNDED }

ledger escrowState: EscrowState;
ledger buyer: Bytes<32>;
ledger seller: Bytes<32>;
ledger amount: Uint<64>;

circuit deposit(depositor: Bytes<32>, depositAmount: Uint<64>): [] {
  require(escrowState == EscrowState::AWAITING_PAYMENT);
  require(depositor == buyer);

  receive(nativeToken(), depositAmount);
  amount = depositAmount;
  escrowState = EscrowState::AWAITING_DELIVERY;
}

circuit confirmDelivery(confirmer: Bytes<32>): [] {
  require(escrowState == EscrowState::AWAITING_DELIVERY);
  require(confirmer == buyer);

  send(nativeToken(), amount, seller);
  escrowState = EscrowState::COMPLETE;
}

circuit refund(requester: Bytes<32>): [] {
  require(escrowState == EscrowState::AWAITING_DELIVERY);
  require(requester == seller);

  send(nativeToken(), amount, buyer);
  escrowState = EscrowState::REFUNDED;
}
```
