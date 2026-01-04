---
applyTo: '**/test/**,**/*.test.ts,**/*.spec.ts'
---

# Midnight Contract Testing Guidelines

You are an expert in testing Midnight Network smart contracts and dApps.

## Testing Framework Setup

### Vitest Configuration
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['test/**/*.test.ts', 'contracts/**/*.test.ts'],
    testTimeout: 60000, // Proof generation can be slow
    hookTimeout: 30000
  }
});
```

### Test Setup File
```typescript
// test/setup.ts
import { beforeAll, afterAll } from 'vitest';
import { startProofServer, stopProofServer } from './helpers/proof-server';

let proofServerProcess: any;

beforeAll(async () => {
  proofServerProcess = await startProofServer();
});

afterAll(async () => {
  await stopProofServer(proofServerProcess);
});
```

## Contract Testing

### Unit Test Structure
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { deployContract, createMockWallet } from './helpers';
import { MyContract } from '../contracts/MyContract';

describe('MyContract', () => {
  let contract: ContractInstance;
  let wallet: MockWallet;

  beforeEach(async () => {
    wallet = await createMockWallet();
    contract = await deployContract(MyContract, wallet);
  });

  describe('circuit: updateValue', () => {
    it('should update the value correctly', async () => {
      const newValue = 42n;

      const tx = await contract.updateValue(newValue);
      await wallet.submitTransaction(tx);

      const result = await contract.getValue();
      expect(result).toBe(newValue);
    });

    it('should reject invalid values', async () => {
      const invalidValue = -1n;

      await expect(
        contract.updateValue(invalidValue)
      ).rejects.toThrow('Invalid value');
    });
  });
});
```

### Mock Wallet Helper
```typescript
// test/helpers/mock-wallet.ts
import { WalletAPI, UnbalancedTransaction, TransactionId } from '@midnight-ntwrk/dapp-connector-api';

export class MockWallet implements WalletAPI {
  private balance: bigint = 1000000n;
  private transactions: Map<string, any> = new Map();

  async getBalance(): Promise<CoinInfo> {
    return { value: this.balance };
  }

  async balanceTransaction(tx: UnbalancedTransaction) {
    return { ...tx, balanced: true };
  }

  async signTransaction(tx: any) {
    return { ...tx, signed: true };
  }

  async submitTransaction(tx: any): Promise<{ txId: TransactionId }> {
    const txId = `tx_${Date.now()}`;
    this.transactions.set(txId, tx);
    return { txId };
  }
}

export function createMockWallet(): MockWallet {
  return new MockWallet();
}
```

## Circuit Testing

### Testing Privacy Circuits
```typescript
describe('Privacy Circuits', () => {
  describe('commitment scheme', () => {
    it('should generate valid commitment', async () => {
      const secret = 12345n;
      const commitment = await contract.commit({ witness: secret });

      expect(commitment).toBeDefined();
      expect(typeof commitment).toBe('bigint');
    });

    it('should verify correct reveal', async () => {
      const secret = 12345n;
      const commitment = await contract.commit({ witness: secret });

      await expect(
        contract.reveal({ secret, commitment })
      ).resolves.not.toThrow();
    });

    it('should reject invalid reveal', async () => {
      const secret = 12345n;
      const wrongSecret = 99999n;
      const commitment = await contract.commit({ witness: secret });

      await expect(
        contract.reveal({ secret: wrongSecret, commitment })
      ).rejects.toThrow('Invalid commitment');
    });
  });
});
```

### Testing Witnesses
```typescript
describe('Witness Handling', () => {
  it('should not expose witness in transaction', async () => {
    const sensitiveData = 'secret123';
    const tx = await contract.processPrivateData({ witness: sensitiveData });

    // Verify witness is not in transaction data
    const txString = JSON.stringify(tx);
    expect(txString).not.toContain(sensitiveData);
  });
});
```

## Integration Testing

### Full Flow Test
```typescript
describe('Integration: Voting Flow', () => {
  let contract: VotingContract;
  let voter1: MockWallet;
  let voter2: MockWallet;

  beforeEach(async () => {
    voter1 = await createMockWallet();
    voter2 = await createMockWallet();
    contract = await deployContract(VotingContract, voter1);

    // Setup: Register voters
    await contract.registerVoter(voter1.address);
    await contract.registerVoter(voter2.address);
  });

  it('should complete full voting cycle', async () => {
    // 1. Create proposal
    const proposalId = await contract.createProposal('Test Proposal');

    // 2. Vote
    await contract.vote(proposalId, true, { wallet: voter1 });
    await contract.vote(proposalId, false, { wallet: voter2 });

    // 3. Get results
    const results = await contract.getResults(proposalId);
    expect(results.yes).toBe(1);
    expect(results.no).toBe(1);
  });

  it('should prevent double voting', async () => {
    const proposalId = await contract.createProposal('Test');

    await contract.vote(proposalId, true, { wallet: voter1 });

    await expect(
      contract.vote(proposalId, true, { wallet: voter1 })
    ).rejects.toThrow('Already voted');
  });
});
```

## Testing Utilities

### Assertion Helpers
```typescript
// test/helpers/assertions.ts
import { expect } from 'vitest';

export function expectValidCommitment(commitment: bigint) {
  expect(commitment).toBeDefined();
  expect(typeof commitment).toBe('bigint');
  expect(commitment > 0n).toBe(true);
}

export function expectTransactionSuccess(result: any) {
  expect(result.txId).toBeDefined();
  expect(result.txId).toMatch(/^tx_/);
}

export async function expectRevert(
  promise: Promise<any>,
  message: string
) {
  await expect(promise).rejects.toThrow(message);
}
```

## Test Coverage

### Coverage Configuration
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      include: ['contracts/**/*.ts', 'lib/**/*.ts'],
      exclude: ['**/*.test.ts', '**/types/**'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75
      }
    }
  }
});
```

## Best Practices

1. **Test All Circuits**: Every exported circuit needs tests
2. **Test Privacy Guarantees**: Verify secrets aren't leaked
3. **Test Edge Cases**: Zero values, max values, empty states
4. **Test Error Paths**: All assertion failures should be tested
5. **Use Realistic Data**: Test with production-like values
6. **Isolate Tests**: Each test should be independent
7. **Document Test Purpose**: Clear descriptions of what's being tested
