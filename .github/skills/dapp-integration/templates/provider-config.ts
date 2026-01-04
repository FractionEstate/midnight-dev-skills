import { setNetworkId, NetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { nodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import type { DAppConnectorWalletAPI } from '@midnight-ntwrk/dapp-connector-api';

// Network configuration
const NETWORKS = {
  testnet: {
    indexer: 'https://indexer.testnet-02.midnight.network/api/v1/graphql',
    indexerWS: 'wss://indexer.testnet-02.midnight.network/api/v1/graphql/ws',
    proofServer: 'http://localhost:6300',
    node: 'https://rpc.testnet-02.midnight.network',
    networkId: NetworkId.TestNet
  }
} as const;

export type NetworkName = keyof typeof NETWORKS;

// Provider types
export interface Providers {
  privateStateProvider: ReturnType<typeof levelPrivateStateProvider>;
  publicDataProvider: ReturnType<typeof indexerPublicDataProvider>;
  zkConfigProvider: ReturnType<typeof nodeZkConfigProvider>;
  proofProvider: ReturnType<typeof httpClientProofProvider>;
  walletProvider: WalletProvider;
}

interface WalletProvider {
  coinPublicKey: string;
  balanceAndProveOwnership: () => Promise<bigint>;
  submitTransaction: (tx: unknown) => Promise<unknown>;
}

// Create provider configuration
export async function createProviders(
  walletApi: DAppConnectorWalletAPI,
  contractPath: string,
  network: NetworkName = 'testnet'
): Promise<Providers> {
  const config = NETWORKS[network];

  // Set network ID first (required)
  setNetworkId(config.networkId);

  // Get service URIs from wallet (or use defaults)
  let uris = config;
  try {
    const walletUris = await walletApi.serviceUriConfig();
    uris = { ...config, ...walletUris };
  } catch {
    console.log('Using default network configuration');
  }

  // Create private state provider
  const privateStateProvider = levelPrivateStateProvider({
    privateStateStoreName: `midnight-${Date.now()}`
  });

  // Create public data provider (indexer)
  const publicDataProvider = indexerPublicDataProvider(
    uris.indexer,
    uris.indexerWS
  );

  // Create ZK config provider (loads circuit artifacts)
  const zkConfigProvider = nodeZkConfigProvider(contractPath);

  // Create proof provider (connects to proof server)
  const proofProvider = httpClientProofProvider(uris.proofServer);

  // Create wallet provider
  const walletProvider = createWalletProvider(walletApi);

  return {
    privateStateProvider,
    publicDataProvider,
    zkConfigProvider,
    proofProvider,
    walletProvider
  };
}

// Create wallet provider wrapper
function createWalletProvider(walletApi: DAppConnectorWalletAPI): WalletProvider {
  let cachedCoinPublicKey: string | null = null;

  return {
    get coinPublicKey() {
      if (!cachedCoinPublicKey) {
        throw new Error('Coin public key not yet fetched');
      }
      return cachedCoinPublicKey;
    },

    async balanceAndProveOwnership() {
      const result = await walletApi.balanceAndProveOwnership();
      // Cache coin public key on first balance check
      if (!cachedCoinPublicKey) {
        cachedCoinPublicKey = await walletApi.coinPublicKey();
      }
      return result;
    },

    async submitTransaction(tx: unknown) {
      return await walletApi.submitTransaction(tx);
    }
  };
}

// Helper to get contract configuration
export function getContractConfig(providers: Providers) {
  return {
    privateStateProvider: providers.privateStateProvider,
    publicDataProvider: providers.publicDataProvider,
    zkConfigProvider: providers.zkConfigProvider,
    proofProvider: providers.proofProvider,
    wallet: providers.walletProvider
  };
}
