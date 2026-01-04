# Midnight.js Providers

Configure providers for contract deployment and interaction.

## Provider Overview

| Provider | Package | Purpose |
| -------- | ------- | ------- |
| `privateStateProvider` | `@midnight-ntwrk/midnight-js-level-private-state-provider` | Local private state |
| `publicDataProvider` | `@midnight-ntwrk/midnight-js-indexer-public-data-provider` | Blockchain queries |
| `zkConfigProvider` | `@midnight-ntwrk/midnight-js-node-zk-config-provider` | ZK circuit config |
| `proofProvider` | `@midnight-ntwrk/midnight-js-http-client-proof-provider` | Proof generation |

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
  setNetworkId
} from '@midnight-ntwrk/midnight-js-network-id';

// MUST be called before using any providers
setNetworkId(NetworkId.TestNet);

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
```

### Custom In-Memory Provider

```typescript
function memoryPrivateStateProvider<T>() {
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

Queries blockchain state via indexer:

```typescript
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';

const publicDataProvider = indexerPublicDataProvider(
  TESTNET_CONFIG.indexer,
  TESTNET_CONFIG.indexerWS
);
```

### Provider Methods

```typescript
interface PublicDataProvider {
  // Get contract state
  contractState(address: ContractAddress): Promise<ContractState>;

  // Watch for state changes
  watchContractState(
    address: ContractAddress,
    callback: (state: ContractState) => void
  ): Subscription;

  // Query transactions
  getTransaction(txId: TransactionId): Promise<Transaction>;
}
```

## ZK Config Provider

Loads circuit configuration:

```typescript
import { nodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';

const zkConfigProvider = nodeZkConfigProvider(
  './contracts/managed/my-contract'
);
```

### Browser ZK Config

```typescript
import { httpClientZkConfigProvider } from '@midnight-ntwrk/midnight-js-http-client-zk-config-provider';

const zkConfigProvider = httpClientZkConfigProvider(
  '/contracts/my-contract'  // Served from public folder
);
```

## Proof Provider

Connects to proof server for ZK proof generation:

```typescript
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';

const proofProvider = httpClientProofProvider(
  TESTNET_CONFIG.proofServer
);
```

## Wallet Provider

Wraps wallet API for transaction signing:

```typescript
import type { WalletProvider } from '@midnight-ntwrk/midnight-js-types';

function createWalletProvider(walletApi: DAppConnectorWalletAPI): WalletProvider {
  return {
    coinPublicKey: walletApi.coinPublicKey(),

    async balanceAndProveOwnership() {
      return await walletApi.balanceAndProveOwnership();
    },

    async submitTransaction(tx) {
      return await walletApi.submitTransaction(tx);
    }
  };
}
```

## Combined Provider Setup

```typescript
import { setNetworkId, NetworkId } from '@midnight-ntwrk/midnight-js-network-id';

export async function setupProviders(walletApi: DAppConnectorWalletAPI) {
  // Set network first
  setNetworkId(NetworkId.TestNet);

  // Get endpoints from wallet
  const uris = await walletApi.serviceUriConfig();

  // Create providers
  const privateStateProvider = levelPrivateStateProvider({
    privateStateStoreName: 'my-dapp-state'
  });

  const publicDataProvider = indexerPublicDataProvider(
    uris.indexer,
    uris.indexerWS
  );

  const zkConfigProvider = nodeZkConfigProvider(
    './contracts/managed/my-contract'
  );

  const proofProvider = httpClientProofProvider(
    uris.proofServer
  );

  const walletProvider = createWalletProvider(walletApi);

  return {
    privateStateProvider,
    publicDataProvider,
    zkConfigProvider,
    proofProvider,
    walletProvider
  };
}
```

## Contract Configuration

```typescript
import { Contract } from '@midnight-ntwrk/midnight-js-contracts';

export function createContractConfig(providers: Providers) {
  return {
    privateStateProvider: providers.privateStateProvider,
    publicDataProvider: providers.publicDataProvider,
    zkConfigProvider: providers.zkConfigProvider,
    proofProvider: providers.proofProvider,
    wallet: providers.walletProvider
  };
}
```

## Best Practices

1. **Set NetworkId first** - Before any provider initialization
2. **Use wallet URIs** - Get endpoints from connected wallet
3. **Handle disconnection** - Clean up subscriptions
4. **Cache providers** - Don't recreate on every operation
5. **Check proof server** - Ensure it's running for transactions
