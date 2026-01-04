# Network Configuration

Configure Midnight Network connections for different environments.

## Network Endpoints

### Testnet-02 (Current)

```typescript
const TESTNET_CONFIG = {
  network: 'testnet',
  indexer: 'https://indexer.testnet-02.midnight.network/api/v1/graphql',
  indexerWS: 'wss://indexer.testnet-02.midnight.network/api/v1/graphql/ws',
  node: 'https://rpc.testnet-02.midnight.network',
  proofServer: 'http://localhost:6300',
  faucet: 'https://faucet.testnet-02.midnight.network'
};
```

### Local Development

```typescript
const LOCAL_CONFIG = {
  network: 'undeployed',
  indexer: 'http://localhost:8080/graphql',
  indexerWS: 'ws://localhost:8080/graphql/ws',
  node: 'http://localhost:9944',
  proofServer: 'http://localhost:6300'
};
```

## Network ID Setup

```typescript
import {
  NetworkId,
  setNetworkId,
  getZswapNetworkId,
  getLedgerNetworkId
} from '@midnight-ntwrk/midnight-js-network-id';

// MUST be called before any provider initialization
setNetworkId(NetworkId.TestNet);

// Verify network IDs match
console.log('Zswap NetworkId:', getZswapNetworkId());
console.log('Ledger NetworkId:', getLedgerNetworkId());
```

## Environment-Based Configuration

```typescript
// lib/config.ts
type NetworkEnvironment = 'testnet' | 'local';

const NETWORKS: Record<NetworkEnvironment, NetworkConfig> = {
  testnet: {
    networkId: NetworkId.TestNet,
    indexer: 'https://indexer.testnet-02.midnight.network/api/v1/graphql',
    indexerWS: 'wss://indexer.testnet-02.midnight.network/api/v1/graphql/ws',
    node: 'https://rpc.testnet-02.midnight.network',
    proofServer: 'http://localhost:6300'
  },
  local: {
    networkId: NetworkId.Undeployed,
    indexer: 'http://localhost:8080/graphql',
    indexerWS: 'ws://localhost:8080/graphql/ws',
    node: 'http://localhost:9944',
    proofServer: 'http://localhost:6300'
  }
};

export function getNetworkConfig(): NetworkConfig {
  const env = process.env.NEXT_PUBLIC_NETWORK || 'testnet';
  return NETWORKS[env as NetworkEnvironment] || NETWORKS.testnet;
}
```

## Using Wallet Service URIs

The wallet provides network configuration:

```typescript
async function getConfigFromWallet(walletApi: DAppConnectorWalletAPI) {
  try {
    const uris = await walletApi.serviceUriConfig();
    return {
      indexer: uris.indexer,
      indexerWS: uris.indexerWS,
      proofServer: uris.proofServer,
      node: uris.node
    };
  } catch (error) {
    // Fall back to defaults
    return getNetworkConfig();
  }
}
```

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_NETWORK=testnet
NEXT_PUBLIC_INDEXER_URL=https://indexer.testnet-02.midnight.network/api/v1/graphql
NEXT_PUBLIC_INDEXER_WS_URL=wss://indexer.testnet-02.midnight.network/api/v1/graphql/ws
NEXT_PUBLIC_NODE_URL=https://rpc.testnet-02.midnight.network
NEXT_PUBLIC_PROOF_SERVER_URL=http://localhost:6300
```

## Connection Testing

```typescript
async function testConnections(config: NetworkConfig): Promise<void> {
  // Test indexer
  const indexerResponse = await fetch(config.indexer, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: '{ __typename }' })
  });
  console.log('Indexer:', indexerResponse.ok ? '✓' : '✗');

  // Test proof server
  try {
    const proofResponse = await fetch(`${config.proofServer}/health`);
    console.log('Proof Server:', proofResponse.ok ? '✓' : '✗');
  } catch {
    console.log('Proof Server: ✗ (not running)');
  }

  // Test node
  const nodeResponse = await fetch(config.node, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'system_health',
      params: [],
      id: 1
    })
  });
  console.log('Node:', nodeResponse.ok ? '✓' : '✗');
}
```

## Network Switching

```typescript
class NetworkManager {
  private currentNetwork: NetworkEnvironment = 'testnet';

  switchNetwork(network: NetworkEnvironment): void {
    this.currentNetwork = network;
    const config = NETWORKS[network];
    setNetworkId(config.networkId);
  }

  getConfig(): NetworkConfig {
    return NETWORKS[this.currentNetwork];
  }
}
```

## Best Practices

1. **Set NetworkId first** - Always before provider creation
2. **Use wallet URIs** - Prefer wallet-provided endpoints
3. **Environment variables** - Don't hardcode URLs
4. **Connection testing** - Verify services on startup
5. **Error handling** - Provide clear network error messages
