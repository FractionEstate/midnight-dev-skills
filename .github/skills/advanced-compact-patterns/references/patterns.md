# Advanced Compact Patterns

## Overview
Master advanced patterns and techniques for writing sophisticated Midnight smart contracts. This guide covers complex state management, access control, multi-contract patterns, and optimization strategies for production-grade Compact contracts.

## Prerequisites
- Strong understanding of [Compact Smart Contracts](./compact-smart-contracts.md)
- Familiarity with [Zero-Knowledge Proofs](./zero-knowledge-proofs.md)
- Completed basic [Testing Compact Contracts](./testing-compact-contracts.md)

## Skills

---

### Skill 1: Access Control Patterns

Implement role-based access control in Compact:

```compact
pragma compact(">=0.25");

// Role definitions using enum
export enum Role { ADMIN, MODERATOR, USER }

// Access control contract
export ledger owner: Opaque<"address">;
export ledger roles: Map<Opaque<"address">, Role>;

// Initialize with deployer as admin
constructor(deployer: Opaque<"address">) {
  owner = disclose(deployer);
  roles[disclose(deployer)] = Role::ADMIN;
}

// Only admin can add roles
export circuit addRole(
  caller: Opaque<"address">,
  user: Opaque<"address">,
  role: Role
): [] {
  require(roles[disclose(caller)] == Role::ADMIN);
  roles[disclose(user)] = role;
}

// Check if caller has required role
witness hasRole(addr: Opaque<"address">, requiredRole: Role): Boolean {
  return roles[addr] == requiredRole;
}

// Role-protected function
export circuit protectedAction(caller: Opaque<"address">): [] {
  require(hasRole(disclose(caller), Role::MODERATOR) ||
          hasRole(disclose(caller), Role::ADMIN));
  // Perform protected action
}
```

**Multi-signature pattern**:
```compact
pragma compact(">=0.25");

export ledger signers: Map<Opaque<"address">, Boolean>;
export ledger requiredSignatures: Opaque<"number">;
export ledger proposalSignatures: Map<Opaque<"number">, Map<Opaque<"address">, Boolean>>;
export ledger proposalCount: Opaque<"number">;

// Create a proposal requiring multiple signatures
export circuit createProposal(caller: Opaque<"address">): Opaque<"number"> {
  require(signers[disclose(caller)] == true);

  let id = disclose(proposalCount);
  proposalCount = disclose(proposalCount + 1);
  proposalSignatures[id][disclose(caller)] = true;

  return id;
}

// Sign a proposal
export circuit signProposal(
  caller: Opaque<"address">,
  proposalId: Opaque<"number">
): [] {
  require(signers[disclose(caller)] == true);
  proposalSignatures[disclose(proposalId)][disclose(caller)] = true;
}

// Check if proposal has enough signatures
witness isApproved(proposalId: Opaque<"number">): Boolean {
  let count = 0;
  // Note: In practice, iterate through known signers
  // This is simplified for illustration
  return count >= requiredSignatures;
}
```

---

### Skill 2: State Machine Patterns

Implement finite state machines for complex workflows:

```compact
pragma compact(">=0.25");

// Auction states
export enum AuctionState {
  CREATED,
  ACTIVE,
  ENDED,
  CANCELLED
}

// Auction data
export ledger state: AuctionState;
export ledger seller: Opaque<"address">;
export ledger highestBid: Opaque<"number">;
export ledger highestBidder: Opaque<"address">;
export ledger endTime: Opaque<"number">;

constructor(
  sellerAddr: Opaque<"address">,
  duration: Opaque<"number">,
  currentTime: Opaque<"number">
) {
  seller = disclose(sellerAddr);
  state = AuctionState::CREATED;
  highestBid = disclose(0);
  endTime = disclose(currentTime + duration);
}

// State transition: CREATED -> ACTIVE
export circuit startAuction(
  caller: Opaque<"address">,
  startingBid: Opaque<"number">
): [] {
  require(state == AuctionState::CREATED);
  require(disclose(caller) == seller);
  require(startingBid > 0);

  highestBid = disclose(startingBid);
  state = AuctionState::ACTIVE;
}

// Place bid (only in ACTIVE state)
export circuit placeBid(
  bidder: Opaque<"address">,
  amount: Opaque<"number">,
  currentTime: Opaque<"number">
): [] {
  require(state == AuctionState::ACTIVE);
  require(disclose(currentTime) < endTime);
  require(disclose(amount) > highestBid);

  highestBid = disclose(amount);
  highestBidder = disclose(bidder);
}

// End auction (ACTIVE -> ENDED)
export circuit endAuction(currentTime: Opaque<"number">): [] {
  require(state == AuctionState::ACTIVE);
  require(disclose(currentTime) >= endTime);

  state = AuctionState::ENDED;
}

// Cancel auction (CREATED or ACTIVE -> CANCELLED)
export circuit cancelAuction(caller: Opaque<"address">): [] {
  require(state == AuctionState::CREATED || state == AuctionState::ACTIVE);
  require(disclose(caller) == seller);

  state = AuctionState::CANCELLED;
}
```

---

### Skill 3: Privacy-Preserving Patterns

Implement selective disclosure for privacy:

```compact
pragma compact(">=0.25");

// Private voting system
export ledger totalVotes: Opaque<"number">;
export ledger yesVotes: Opaque<"number">;
export ledger noVotes: Opaque<"number">;
export ledger hasVoted: Map<Opaque<"address">, Boolean>;
export ledger votingClosed: Boolean;

// Cast a private vote - only the totals are revealed
export circuit vote(
  voter: Opaque<"address">,
  voteYes: Boolean  // Private input, not disclosed
): [] {
  require(!votingClosed);
  require(!hasVoted[disclose(voter)]);

  hasVoted[disclose(voter)] = true;
  totalVotes = disclose(totalVotes + 1);

  // Conditionally update based on private vote
  if (voteYes) {
    yesVotes = disclose(yesVotes + 1);
  } else {
    noVotes = disclose(noVotes + 1);
  }
}

// Age verification without revealing exact age
export ledger verified: Map<Opaque<"address">, Boolean>;

export circuit verifyAge(
  user: Opaque<"address">,
  age: Opaque<"number">,  // Private - never disclosed
  minimumAge: Opaque<"number">
): [] {
  // Check age privately, only reveal verification result
  require(age >= minimumAge);
  verified[disclose(user)] = true;
  // Note: actual age is never stored or disclosed
}
```

**Range proofs pattern**:
```compact
pragma compact(">=0.25");

// Prove value is in range without revealing it
export circuit proveBalanceInRange(
  balance: Opaque<"number">,  // Private
  minBalance: Opaque<"number">,
  maxBalance: Opaque<"number">
): Boolean {
  // These checks happen in ZK - balance not revealed
  let inRange = balance >= minBalance && balance <= maxBalance;
  require(inRange);
  return disclose(inRange);  // Only true/false is public
}

// Credit score verification (reveals nothing about actual score)
export circuit verifyCreditWorthy(
  creditScore: Opaque<"number">,  // Private
  threshold: Opaque<"number">
): Boolean {
  let worthy = creditScore >= threshold;
  return disclose(worthy);
}
```

---

### Skill 4: Efficient Data Structures

Optimize data storage patterns:

```compact
pragma compact(">=0.25");

// Packed struct for efficient storage
export struct UserProfile {
  age: Opaque<"number">,
  level: Opaque<"number">,
  score: Opaque<"number">,
  active: Boolean
}

export ledger profiles: Map<Opaque<"address">, UserProfile>;

// Batch operations for efficiency
export circuit batchUpdate(
  addresses: [Opaque<"address">; 10],
  scores: [Opaque<"number">; 10]
): [] {
  // Update multiple records in single transaction
  let i = 0;
  while (i < 10) {
    let addr = disclose(addresses[i]);
    let profile = profiles[addr];
    profiles[addr] = UserProfile {
      age: profile.age,
      level: profile.level,
      score: disclose(scores[i]),
      active: profile.active
    };
    i = i + 1;
  }
}

// Merkle tree root for efficient verification
export ledger merkleRoot: Opaque<"bytes32">;

// Store only the root, verify membership off-chain
export circuit updateRoot(
  newRoot: Opaque<"bytes32">,
  proof: [Opaque<"bytes32">; 32],  // Merkle proof
  leaf: Opaque<"bytes32">
): [] {
  // Verify old state before updating
  require(verifyMerkleProof(merkleRoot, proof, leaf));
  merkleRoot = disclose(newRoot);
}
```

---

### Skill 5: Event Logging Patterns

Implement structured event logging:

```compact
pragma compact(">=0.25");

// Event types
export enum EventType {
  TRANSFER,
  APPROVAL,
  STAKE,
  UNSTAKE
}

// Event log structure
export struct LogEntry {
  eventType: EventType,
  timestamp: Opaque<"number">,
  actor: Opaque<"address">,
  amount: Opaque<"number">
}

export ledger eventLog: Map<Opaque<"number">, LogEntry>;
export ledger eventCount: Opaque<"number">;

// Log an event
circuit logEvent(
  eventType: EventType,
  timestamp: Opaque<"number">,
  actor: Opaque<"address">,
  amount: Opaque<"number">
): [] {
  let idx = disclose(eventCount);
  eventLog[idx] = LogEntry {
    eventType: eventType,
    timestamp: disclose(timestamp),
    actor: disclose(actor),
    amount: disclose(amount)
  };
  eventCount = disclose(eventCount + 1);
}

// Transfer with event logging
export ledger balances: Map<Opaque<"address">, Opaque<"number">>;

export circuit transfer(
  from: Opaque<"address">,
  to: Opaque<"address">,
  amount: Opaque<"number">,
  timestamp: Opaque<"number">
): [] {
  require(balances[disclose(from)] >= disclose(amount));

  balances[disclose(from)] = disclose(balances[disclose(from)] - amount);
  balances[disclose(to)] = disclose(balances[disclose(to)] + amount);

  logEvent(EventType::TRANSFER, timestamp, from, amount);
}
```

---

### Skill 6: Upgrade Patterns

Design contracts for future upgrades:

```compact
pragma compact(">=0.25");

// Proxy pattern - separate logic from storage
export ledger admin: Opaque<"address">;
export ledger implementationVersion: Opaque<"number">;
export ledger paused: Boolean;

// Storage slots for upgrade-safe storage
export ledger storage0: Opaque<"number">;
export ledger storage1: Opaque<"number">;
export ledger storage2: Opaque<"address">;
export ledger storageMap: Map<Opaque<"bytes32">, Opaque<"number">>;

// Pause functionality for safe upgrades
export circuit pause(caller: Opaque<"address">): [] {
  require(disclose(caller) == admin);
  paused = true;
}

export circuit unpause(caller: Opaque<"address">): [] {
  require(disclose(caller) == admin);
  paused = false;
}

// Version-aware functions
export circuit upgradeVersion(
  caller: Opaque<"address">,
  newVersion: Opaque<"number">
): [] {
  require(disclose(caller) == admin);
  require(paused);  // Must pause before upgrade
  require(disclose(newVersion) > implementationVersion);

  implementationVersion = disclose(newVersion);
}

// Modifier pattern for pause check
witness whenNotPaused(): Boolean {
  return !paused;
}

export circuit protectedFunction(input: Opaque<"number">): [] {
  require(whenNotPaused());
  // Function logic
}
```

---

### Skill 7: Gas Optimization Patterns

Minimize constraint complexity:

```compact
pragma compact(">=0.25");

// INEFFICIENT: Multiple require statements
export circuit inefficientValidation(
  a: Opaque<"number">,
  b: Opaque<"number">,
  c: Opaque<"number">
): [] {
  require(a > 0);
  require(a < 100);
  require(b > 0);
  require(b < 100);
  require(c > 0);
  require(c < 100);
  // 6 separate constraint checks
}

// EFFICIENT: Combined validation
export circuit efficientValidation(
  a: Opaque<"number">,
  b: Opaque<"number">,
  c: Opaque<"number">
): [] {
  let validA = a > 0 && a < 100;
  let validB = b > 0 && b < 100;
  let validC = c > 0 && c < 100;
  require(validA && validB && validC);
  // Single combined constraint
}

// INEFFICIENT: Redundant storage reads
export ledger balance: Opaque<"number">;

export circuit inefficientUpdate(amount: Opaque<"number">): [] {
  require(balance >= disclose(amount));  // Read 1
  let remaining = balance - disclose(amount);  // Read 2
  balance = disclose(remaining);  // Write
}

// EFFICIENT: Cache storage reads
export circuit efficientUpdate(amount: Opaque<"number">): [] {
  let currentBalance = balance;  // Single read
  require(currentBalance >= disclose(amount));
  balance = disclose(currentBalance - amount);
}

// EFFICIENT: Avoid unnecessary disclosures
export circuit keepPrivate(
  secret: Opaque<"number">,
  threshold: Opaque<"number">
): Boolean {
  // Only disclose the boolean result, not the values
  let result = secret >= threshold;
  return disclose(result);
}
```

---

### Skill 8: Testing Advanced Contracts

Test complex contract logic:

```typescript
// tests/auction.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { createContext } from './helpers';

describe('Auction State Machine', () => {
  let ctx: any;
  const seller = 'seller-address';
  const bidder1 = 'bidder-1';
  const bidder2 = 'bidder-2';

  beforeEach(() => {
    ctx = createContext({
      state: 'CREATED',
      seller: seller,
      highestBid: 0,
      highestBidder: null,
      endTime: 1000
    });
  });

  describe('State Transitions', () => {
    it('should transition from CREATED to ACTIVE', () => {
      const result = contract.circuits.startAuction({
        ...ctx,
        privateInputs: {
          caller: seller,
          startingBid: 100
        }
      });

      expect(result.newState.state).toBe('ACTIVE');
      expect(result.newState.highestBid).toBe(100);
    });

    it('should not allow non-seller to start auction', () => {
      expect(() => {
        contract.circuits.startAuction({
          ...ctx,
          privateInputs: {
            caller: bidder1,
            startingBid: 100
          }
        });
      }).toThrow();
    });

    it('should accept higher bids in ACTIVE state', () => {
      // First transition to ACTIVE
      const activeCtx = {
        ...ctx,
        originalState: {
          ...ctx.originalState,
          state: 'ACTIVE',
          highestBid: 100
        }
      };

      const result = contract.circuits.placeBid({
        ...activeCtx,
        privateInputs: {
          bidder: bidder1,
          amount: 150,
          currentTime: 500
        }
      });

      expect(result.newState.highestBid).toBe(150);
      expect(result.newState.highestBidder).toBe(bidder1);
    });

    it('should reject bids lower than current highest', () => {
      const activeCtx = {
        ...ctx,
        originalState: {
          ...ctx.originalState,
          state: 'ACTIVE',
          highestBid: 100
        }
      };

      expect(() => {
        contract.circuits.placeBid({
          ...activeCtx,
          privateInputs: {
            bidder: bidder1,
            amount: 50,  // Less than 100
            currentTime: 500
          }
        });
      }).toThrow();
    });

    it('should not accept bids after auction ends', () => {
      const activeCtx = {
        ...ctx,
        originalState: {
          ...ctx.originalState,
          state: 'ACTIVE',
          highestBid: 100,
          endTime: 1000
        }
      };

      expect(() => {
        contract.circuits.placeBid({
          ...activeCtx,
          privateInputs: {
            bidder: bidder1,
            amount: 150,
            currentTime: 1001  // After endTime
          }
        });
      }).toThrow();
    });
  });

  describe('Access Control', () => {
    it('should only allow seller to cancel', () => {
      expect(() => {
        contract.circuits.cancelAuction({
          ...ctx,
          privateInputs: { caller: bidder1 }
        });
      }).toThrow();

      // Seller should succeed
      const result = contract.circuits.cancelAuction({
        ...ctx,
        privateInputs: { caller: seller }
      });
      expect(result.newState.state).toBe('CANCELLED');
    });
  });
});
```

---

### Skill 9: Cross-Contract Communication

Design contracts that work together:

```compact
// contracts/registry.compact
pragma compact(">=0.25");

// Registry contract - stores contract addresses
export ledger contracts: Map<Opaque<"string">, Opaque<"address">>;
export ledger admin: Opaque<"address">;

export circuit registerContract(
  caller: Opaque<"address">,
  name: Opaque<"string">,
  addr: Opaque<"address">
): [] {
  require(disclose(caller) == admin);
  contracts[disclose(name)] = disclose(addr);
}

export circuit getContract(name: Opaque<"string">): Opaque<"address"> {
  return contracts[disclose(name)];
}
```

```compact
// contracts/token.compact
pragma compact(">=0.25");

export ledger balances: Map<Opaque<"address">, Opaque<"number">>;
export ledger allowances: Map<Opaque<"address">, Map<Opaque<"address">, Opaque<"number">>>;
export ledger totalSupply: Opaque<"number">;

// Allow another contract to spend tokens
export circuit approve(
  owner: Opaque<"address">,
  spender: Opaque<"address">,
  amount: Opaque<"number">
): [] {
  allowances[disclose(owner)][disclose(spender)] = disclose(amount);
}

// Transfer on behalf of owner
export circuit transferFrom(
  spender: Opaque<"address">,
  from: Opaque<"address">,
  to: Opaque<"address">,
  amount: Opaque<"number">
): [] {
  let allowed = allowances[disclose(from)][disclose(spender)];
  require(allowed >= disclose(amount));
  require(balances[disclose(from)] >= disclose(amount));

  allowances[disclose(from)][disclose(spender)] = disclose(allowed - amount);
  balances[disclose(from)] = disclose(balances[disclose(from)] - amount);
  balances[disclose(to)] = disclose(balances[disclose(to)] + amount);
}
```

```compact
// contracts/staking.compact
pragma compact(">=0.25");

// Staking contract that interacts with token contract
export ledger stakes: Map<Opaque<"address">, Opaque<"number">>;
export ledger tokenContract: Opaque<"address">;
export ledger totalStaked: Opaque<"number">;

// Note: Cross-contract calls happen at the application layer
// The contract stores references for the DApp to orchestrate

export circuit recordStake(
  staker: Opaque<"address">,
  amount: Opaque<"number">
): [] {
  stakes[disclose(staker)] = disclose(stakes[disclose(staker)] + amount);
  totalStaked = disclose(totalStaked + amount);
}

export circuit recordUnstake(
  staker: Opaque<"address">,
  amount: Opaque<"number">
): [] {
  require(stakes[disclose(staker)] >= disclose(amount));
  stakes[disclose(staker)] = disclose(stakes[disclose(staker)] - amount);
  totalStaked = disclose(totalStaked - amount);
}
```

**Application layer orchestration**:
```typescript
// src/lib/staking.ts
import { TokenContract, StakingContract } from '@/contracts';

export class StakingService {
  constructor(
    private token: TokenContract,
    private staking: StakingContract
  ) {}

  async stake(user: string, amount: number) {
    // Step 1: Approve staking contract to spend tokens
    await this.token.circuits.approve({
      owner: user,
      spender: this.staking.address,
      amount
    });

    // Step 2: Transfer tokens to staking contract
    await this.token.circuits.transferFrom({
      spender: this.staking.address,
      from: user,
      to: this.staking.address,
      amount
    });

    // Step 3: Record stake
    await this.staking.circuits.recordStake({
      staker: user,
      amount
    });
  }
}
```

---

### Skill 10: Production Checklist

Before deploying to production:

**Security Review**:
```compact
// ✓ All external inputs validated
export circuit transfer(amount: Opaque<"number">): [] {
  require(amount > 0);  // Validate input
  require(amount <= MAX_TRANSFER);  // Bound input
}

// ✓ Access control on sensitive functions
export circuit adminFunction(caller: Opaque<"address">): [] {
  require(disclose(caller) == admin);
}

// ✓ State transitions properly guarded
export circuit stateChange(newState: State): [] {
  require(isValidTransition(currentState, newState));
}

// ✓ Integer overflow/underflow prevention
export circuit safeSubtract(a: Opaque<"number">, b: Opaque<"number">): Opaque<"number"> {
  require(a >= b);  // Prevent underflow
  return disclose(a - b);
}
```

**Testing Coverage**:
```
✓ Unit tests for all circuits
✓ State machine transition tests
✓ Access control tests
✓ Edge case tests
✓ Integration tests with proof server
✓ Performance benchmarks
```

**Documentation**:
```
✓ Contract architecture documentation
✓ Circuit documentation with inputs/outputs
✓ Privacy guarantees documented
✓ Upgrade procedures documented
✓ Emergency procedures documented
```

**Deployment**:
```bash
# Pre-deployment checks
compact compile --check contracts/*.compact

# Run full test suite
npm run test:all

# Deploy to testnet first
npm run deploy:testnet

# Verify on testnet
npm run verify:testnet

# Production deployment (with approval)
npm run deploy:production
```

---

## Resources
- [Compact Language Reference](https://docs.midnight.network/develop/reference/compact/)
- [Midnight Security Best Practices](https://docs.midnight.network/develop/guides/)
- [ZK Circuit Optimization](https://docs.midnight.network/learn/understanding-midnights-technology/)
- [Smart Contract Patterns](https://docs.midnight.network/develop/tutorials/)
