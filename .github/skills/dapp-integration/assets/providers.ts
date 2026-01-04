// @ts-nocheck
// Midnight Provider Configuration Template
// Location: lib/midnight/providers.ts
// Configure providers for contract interactions

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
