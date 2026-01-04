---
name: midnight-js-providers
description: Configure and use Midnight.js providers for contract deployment and interaction. Covers privateStateProvider, publicDataProvider, zkConfigProvider, proofProvider, walletProvider, and midnightProvider patterns.
---

# Midnight.js Provider Configuration

Midnight.js uses a provider pattern to abstract different infrastructure concerns. Understanding and configuring providers correctly is essential for deploying and interacting with smart contracts.

## When to Use

- Setting up contract deployment infrastructure
- Configuring state management for contracts
- Connecting to indexer and proof services
- Building reusable deployment pipelines
- Integrating wallet functionality

## Provider Overview

| Provider | Purpose | Package |
|----------|---------|---------|
| `privateStateProvider` | Local private state storage | `@midnight-ntwrk/midnight-js-level-private-state-provider` |
| `publicDataProvider` | Blockchain data queries | `@midnight-ntwrk/midnight-js-indexer-public-data-provider` |
| `zkConfigProvider` | ZK circuit configuration | `@midnight-ntwrk/midnight-js-node-zk-config-provider` |
| `proofProvider` | ZK proof generation | `@midnight-ntwrk/midnight-js-http-client-proof-provider` |
| `walletProvider` | Transaction signing/submission | Custom implementation |
| `midnightProvider` | Combined wallet interface | Custom implementation |

## Installation

```bash
npm install @midnight-ntwrk/midnight-js-contracts \
  @midnight-ntwrk/midnight-js-level-private-state-provider \
  @midnight-ntwrk/midnight-js-indexer-public-data-provider \
  @midnight-ntwrk/midnight-js-node-zk-config-provider \
  @midnight-ntwrk/midnight-js-http-client-proof-provider \
  @midnight-ntwrk/midnight-js-types \
  @midnight-ntwrk/midnight-js-network-id
```

## Network Configuration

```typescript
import {
  NetworkId,
  setNetworkId,
  getZswapNetworkId,
  getLedgerNetworkId
} from '@midnight-ntwrk/midnight-js-network-id';

// MUST be called before using any providers
setNetworkId(NetworkId.TestNet);

// Testnet endpoints
const TESTNET_CONFIG = {
  indexer: 'https://indexer.testnet-02.midnight.network/api/v1/graphql',
  indexerWS: 'wss://indexer.testnet-02.midnight.network/api/v1/graphql/ws',
  proofServer: 'http://localhost:6300',
  node: 'https://rpc.testnet-02.midnight.network'
};
```

## Private State Provider

Manages local private state using LevelDB:

```typescript
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';

const privateStateProvider = levelPrivateStateProvider({
  privateStateStoreName: 'my-contract-state'
});

// Provider interface
interface PrivateStateProvider<T> {
  get(id: string): Promise<T | null>;
  set(id: string, state: T): Promise<void>;
  clear(id: string): Promise<void>;
}
```

### Custom Private State Provider

```typescript
// In-memory provider for testing
function memoryPrivateStateProvider<T>(): PrivateStateProvider<T> {
  const store = new Map<string, T>();

  return {
    async get(id: string): Promise<T | null> {
      return store.get(id) ?? null;
    },
    async set(id: string, state: T): Promise<void> {
      store.set(id, state);
    },
    async clear(id: string): Promise<void> {
      store.delete(id);
    }
  };
}
```

## Public Data Provider

Queries blockchain state via the indexer:

```typescript
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';

const publicDataProvider = indexerPublicDataProvider(
  TESTNET_CONFIG.indexer,
  TESTNET_CONFIG.indexerWS
);

// Query contract state
const state = await publicDataProvider.queryContractState(contractAddress);

// Subscribe to state updates
publicDataProvider.contractStateUpdates(contractAddress).subscribe(
  update => console.log('State updated:', update)
);
```

### Provider Interface

```typescript
interface PublicDataProvider {
  queryContractState(address: string): Promise<ContractState | null>;
  contractStateUpdates(address: string): Observable<ContractState>;
  queryTransaction(hash: string): Promise<Transaction | null>;
}
```

## ZK Config Provider

Loads circuit configurations from compiled contract artifacts:

```typescript
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import * as path from 'path';

const contractPath = path.join(process.cwd(), 'contracts', 'managed', 'my-contract');
const zkConfigProvider = new NodeZkConfigProvider(contractPath);

// For browser environments, use fetch-based provider
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';

const browserZkProvider = new FetchZkConfigProvider(
  window.location.origin,
  fetch.bind(window)
);
```

## Proof Provider

Connects to the proof server for ZK proof generation:

```typescript
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';

const proofProvider = httpClientProofProvider(TESTNET_CONFIG.proofServer);

// Provider interface
interface ProofProvider {
  prove(circuit: string, inputs: CircuitInputs): Promise<Proof>;
}
```

## Wallet Provider

Custom implementation for transaction management:

```typescript
import { createBalancedTx } from '@midnight-ntwrk/midnight-js-types';
import { Transaction } from '@midnight-ntwrk/ledger';
import { Transaction as ZswapTransaction } from '@midnight-ntwrk/zswap';
import type { Wallet } from '@midnight-ntwrk/wallet-api';

function createWalletProvider(wallet: Wallet) {
  const state = await wallet.state();

  return {
    coinPublicKey: state.coinPublicKey,
    encryptionPublicKey: state.encryptionPublicKey,

    async balanceTx(tx: any, newCoins: any[] = []) {
      // Convert to Zswap transaction
      const zswapTx = ZswapTransaction.deserialize(
        tx.serialize(getLedgerNetworkId()),
        getZswapNetworkId()
      );

      // Balance and prove
      const balanced = await wallet.balanceTransaction(zswapTx, newCoins);
      const proven = await wallet.proveTransaction(balanced);

      // Convert back to ledger transaction
      const ledgerTx = Transaction.deserialize(
        proven.serialize(getZswapNetworkId()),
        getLedgerNetworkId()
      );

      return createBalancedTx(ledgerTx);
    },

    async submitTx(tx: any) {
      return wallet.submitTransaction(tx);
    }
  };
}
```

### Wallet Provider Interface

```typescript
interface WalletProvider {
  coinPublicKey: string;
  encryptionPublicKey: string;
  balanceTx(tx: UnbalancedTransaction, newCoins?: CoinInfo[]): Promise<BalancedTransaction>;
  submitTx(tx: Transaction): Promise<TransactionResult>;
}
```

## Complete Provider Setup

```typescript
import { deployContract, findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { NetworkId, setNetworkId, getZswapNetworkId, getLedgerNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { createBalancedTx } from '@midnight-ntwrk/midnight-js-types';
import { WalletBuilder } from '@midnight-ntwrk/wallet';

// Set network first
setNetworkId(NetworkId.TestNet);

// Build wallet
const wallet = await WalletBuilder.build(
  TESTNET_CONFIG.indexer,
  TESTNET_CONFIG.indexerWS,
  TESTNET_CONFIG.proofServer,
  TESTNET_CONFIG.node,
  walletSeed,
  NetworkId.TestNet
);
wallet.start();

// Wait for sync
const walletState = await firstValueFrom(
  wallet.state().pipe(filter(s => s.syncProgress?.synced === true))
);

// Create wallet provider
const walletProvider = {
  coinPublicKey: walletState.coinPublicKey,
  encryptionPublicKey: walletState.encryptionPublicKey,

  async balanceTx(tx: any, newCoins: any[] = []) {
    const zswapTx = ZswapTransaction.deserialize(
      tx.serialize(getLedgerNetworkId()),
      getZswapNetworkId()
    );
    const balanced = await wallet.balanceTransaction(zswapTx, newCoins);
    const proven = await wallet.proveTransaction(balanced);
    const ledgerTx = Transaction.deserialize(
      proven.serialize(getZswapNetworkId()),
      getLedgerNetworkId()
    );
    return createBalancedTx(ledgerTx);
  },

  async submitTx(tx: any) {
    return wallet.submitTransaction(tx);
  }
};

// Configure all providers
const providers = {
  privateStateProvider: levelPrivateStateProvider({
    privateStateStoreName: 'my-contract-state'
  }),
  publicDataProvider: indexerPublicDataProvider(
    TESTNET_CONFIG.indexer,
    TESTNET_CONFIG.indexerWS
  ),
  zkConfigProvider: new NodeZkConfigProvider(
    path.join(process.cwd(), 'contracts', 'managed', 'my-contract')
  ),
  proofProvider: httpClientProofProvider(TESTNET_CONFIG.proofServer),
  walletProvider,
  midnightProvider: walletProvider
};
```

## Deploying with Providers

```typescript
import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';

// Load compiled contract
const ContractModule = await import('./contracts/managed/my-contract/contract/index.cjs');
const contract = new ContractModule.Contract({});

// Deploy
const deployed = await deployContract(providers, {
  contract,
  privateStateId: 'myContractState',
  initialPrivateState: {}
});

console.log('Contract address:', deployed.deployTxData.public.contractAddress);
```

## Finding Deployed Contracts

```typescript
import { findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';

const deployed = await findDeployedContract(providers, {
  contractAddress: '0x...',
  contract,
  privateStateId: 'myContractState',
  initialPrivateState: {}
});

// Call contract functions
const result = await deployed.callTx.myFunction(arg1, arg2);
```

## Provider Factory Pattern

```typescript
interface ProviderConfig {
  network: 'testnet' | 'mainnet';
  proofServerUrl: string;
  contractPath: string;
  stateStoreName: string;
}

function createProviders(config: ProviderConfig, wallet: Wallet) {
  const endpoints = config.network === 'testnet'
    ? TESTNET_CONFIG
    : MAINNET_CONFIG;

  setNetworkId(
    config.network === 'testnet' ? NetworkId.TestNet : NetworkId.MainNet
  );

  return {
    privateStateProvider: levelPrivateStateProvider({
      privateStateStoreName: config.stateStoreName
    }),
    publicDataProvider: indexerPublicDataProvider(
      endpoints.indexer,
      endpoints.indexerWS
    ),
    zkConfigProvider: new NodeZkConfigProvider(config.contractPath),
    proofProvider: httpClientProofProvider(config.proofServerUrl),
    walletProvider: createWalletProvider(wallet),
    midnightProvider: createWalletProvider(wallet)
  };
}
```

## Best Practices

1. **Call setNetworkId() first** before any provider operations
2. **Reuse provider instances** across multiple contract interactions
3. **Handle WebSocket reconnection** for publicDataProvider
4. **Check proof server health** before deployments
5. **Use appropriate storage** for private state (LevelDB for production)

## Related Skills

- [contract-deployment](../contract-deployment/SKILL.md) - Deployment workflows
- [wallet-sdk-integration](../wallet-sdk-integration/SKILL.md) - Wallet setup
- [midnight-indexer-graphql](../midnight-indexer-graphql/SKILL.md) - Indexer queries

## References

- [Midnight.js API Reference](https://docs.midnight.network/develop/reference/midnight-api/midnight-js)
- [Deploy an MN App](https://docs.midnight.network/getting-started/deploy-mn-app)
