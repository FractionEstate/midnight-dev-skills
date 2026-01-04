# Midnight Provider Configuration Template

Configure providers for contract interactions.

## Location

`lib/midnight/providers.ts`

## Template

```typescript
import {
  createPublicDataProvider,
  createPrivateStateProvider,
  createZkConfigProvider,
} from '@midnight-ntwrk/midnight-js-contracts';

// Network configurations
export const NETWORKS = {
  testnet: {
    indexer: 'https://indexer.testnet-02.midnight.network/api/v1/graphql',
    indexerWS: 'wss://indexer.testnet-02.midnight.network/api/v1/graphql/ws',
    node: 'https://rpc.testnet-02.midnight.network',
    proofServer: 'http://localhost:6300',
  },
  // Add mainnet when available
};

export type NetworkId = keyof typeof NETWORKS;

// Create all providers for a network
export function createProviders(network: NetworkId = 'testnet') {
  const config = NETWORKS[network];

  return {
    privateStateProvider: createPrivateStateProvider(),

    publicDataProvider: createPublicDataProvider({
      indexerUrl: config.indexer,
      indexerWsUrl: config.indexerWS,
      nodeUrl: config.node,
    }),

    zkConfigProvider: createZkConfigProvider({
      proofServerUrl: config.proofServer,
    }),
  };
}

// Environment-based provider setup
export function getProviders() {
  const network = (process.env.NEXT_PUBLIC_NETWORK || 'testnet') as NetworkId;
  return createProviders(network);
}
```

## Usage

```typescript
import { getProviders } from '@/lib/midnight/providers';
import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';

async function deploy(walletApi: WalletAPI) {
  const providers = getProviders();

  const instance = await deployContract({
    contract: MyContract,
    initialState: { /* ... */ },
    ...providers,
    wallet: walletApi,
  });

  return instance;
}
```

## Provider Types

| Provider | Purpose |
|----------|---------|
| `privateStateProvider` | Manages off-chain private state |
| `publicDataProvider` | Queries on-chain data via indexer |
| `zkConfigProvider` | Generates ZK proofs via proof server |

## Environment Variables

```env
# .env.local
NEXT_PUBLIC_NETWORK=testnet
NEXT_PUBLIC_INDEXER_URL=https://indexer.testnet-02.midnight.network/api/v1/graphql
NEXT_PUBLIC_NODE_URL=https://rpc.testnet-02.midnight.network
NEXT_PUBLIC_PROOF_SERVER=http://localhost:6300
```
