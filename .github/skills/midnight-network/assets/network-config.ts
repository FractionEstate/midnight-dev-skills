// @ts-nocheck
// Midnight Network Configuration Template
// Location: lib/midnight/config.ts
// Network endpoints and environment configuration

import {
  NetworkId,
  setNetworkId,
  getZswapNetworkId,
  getLedgerNetworkId,
} from '@midnight-ntwrk/midnight-js-network-id';

// Network configurations
export const NETWORKS = {
  testnet: {
    id: NetworkId.TestNet,
    name: 'Testnet-02',
    indexer: 'https://indexer.testnet-02.midnight.network/api/v1/graphql',
    indexerWS: 'wss://indexer.testnet-02.midnight.network/api/v1/graphql/ws',
    node: 'https://rpc.testnet-02.midnight.network',
    proofServer: 'http://localhost:6300',
    faucet: 'https://faucet.testnet-02.midnight.network',
  },
  local: {
    id: NetworkId.Undeployed,
    name: 'Local Development',
    indexer: 'http://localhost:8080/graphql',
    indexerWS: 'ws://localhost:8080/graphql/ws',
    node: 'http://localhost:9944',
    proofServer: 'http://localhost:6300',
    faucet: null,
  },
} as const;

export type NetworkKey = keyof typeof NETWORKS;

// Current network from environment
export function getCurrentNetwork(): NetworkKey {
  const env = process.env.NEXT_PUBLIC_MIDNIGHT_NETWORK;
  if (env === 'local') return 'local';
  return 'testnet';
}

// Initialize network - MUST be called before providers
export function initializeNetwork(network: NetworkKey = getCurrentNetwork()) {
  const config = NETWORKS[network];
  setNetworkId(config.id);

  // Verify initialization
  console.log(`Midnight Network: ${config.name}`);
  console.log(`Zswap NetworkId: ${getZswapNetworkId()}`);
  console.log(`Ledger NetworkId: ${getLedgerNetworkId()}`);

  return config;
}

// Get config for current network
export function getNetworkConfig() {
  return NETWORKS[getCurrentNetwork()];
}
