---
name: network-configuration
description: Configure Midnight Network connections for testnet and mainnet. Covers RPC endpoints, WebSocket connections, indexer URLs, network selection, and environment-based configuration for Next.js and Node.js applications.
---

# Network Configuration

Configure your application to connect to Midnight Network infrastructure.

## When to Use

- Setting up new development environment
- Connecting to testnet or mainnet
- Configuring WebSocket subscriptions
- Setting up environment variables
- Switching between networks

## Network Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Midnight Network                         │
│                                                             │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐             │
│  │  Node    │    │ Indexer  │    │  Proof   │             │
│  │  (RPC)   │    │ (GraphQL)│    │  Server  │             │
│  └────┬─────┘    └────┬─────┘    └────┬─────┘             │
│       │               │               │                    │
└───────┼───────────────┼───────────────┼────────────────────┘
        │               │               │
        ▼               ▼               ▼
   Transactions     Queries        ZK Proofs
   Submissions    Subscriptions   Generation
```

## Testnet Configuration

### Endpoints

| Service | URL |
|---------|-----|
| Node RPC | `https://rpc.testnet-02.midnight.network` |
| Indexer GraphQL | `https://indexer.testnet-02.midnight.network/api/v1/graphql` |
| Indexer WebSocket | `wss://indexer.testnet-02.midnight.network/api/v1/graphql/ws` |
| Proof Server | `http://localhost:6300` (local) |

### Environment Variables

```bash
# .env.local (Next.js)
NEXT_PUBLIC_MIDNIGHT_NETWORK=testnet
NEXT_PUBLIC_NODE_URL=https://rpc.testnet-02.midnight.network
NEXT_PUBLIC_INDEXER_URL=https://indexer.testnet-02.midnight.network/api/v1/graphql
NEXT_PUBLIC_INDEXER_WS_URL=wss://indexer.testnet-02.midnight.network/api/v1/graphql/ws
NEXT_PUBLIC_PROOF_SERVER_URL=http://localhost:6300
```

## TypeScript Configuration

### Network Config Type

```typescript
// types/network.ts
export interface NetworkConfig {
  name: 'testnet' | 'mainnet';
  nodeUrl: string;
  indexerUrl: string;
  indexerWsUrl: string;
  proofServerUrl: string;
  chainId?: string;
  blockExplorerUrl?: string;
}

export const TESTNET_CONFIG: NetworkConfig = {
  name: 'testnet',
  nodeUrl: 'https://rpc.testnet-02.midnight.network',
  indexerUrl: 'https://indexer.testnet-02.midnight.network/api/v1/graphql',
  indexerWsUrl: 'wss://indexer.testnet-02.midnight.network/api/v1/graphql/ws',
  proofServerUrl: 'http://localhost:6300',
  chainId: 'midnight-testnet-02'
};

// Future mainnet configuration
export const MAINNET_CONFIG: NetworkConfig = {
  name: 'mainnet',
  nodeUrl: 'https://rpc.midnight.network',
  indexerUrl: 'https://indexer.midnight.network/api/v1/graphql',
  indexerWsUrl: 'wss://indexer.midnight.network/api/v1/graphql/ws',
  proofServerUrl: 'http://localhost:6300',
  chainId: 'midnight-mainnet'
};
```

### Network Selection

```typescript
// config/network.ts
import { NetworkConfig, TESTNET_CONFIG, MAINNET_CONFIG } from '../types/network';

export function getNetworkConfig(): NetworkConfig {
  const network = process.env.NEXT_PUBLIC_MIDNIGHT_NETWORK || 'testnet';

  switch (network) {
    case 'mainnet':
      return MAINNET_CONFIG;
    case 'testnet':
    default:
      return TESTNET_CONFIG;
  }
}

// With environment overrides
export function getNetworkConfigWithOverrides(): NetworkConfig {
  const base = getNetworkConfig();

  return {
    ...base,
    nodeUrl: process.env.NEXT_PUBLIC_NODE_URL || base.nodeUrl,
    indexerUrl: process.env.NEXT_PUBLIC_INDEXER_URL || base.indexerUrl,
    indexerWsUrl: process.env.NEXT_PUBLIC_INDEXER_WS_URL || base.indexerWsUrl,
    proofServerUrl: process.env.NEXT_PUBLIC_PROOF_SERVER_URL || base.proofServerUrl
  };
}
```

## Provider Setup

### Complete Provider Configuration

```typescript
import { createProviders } from '@midnight-ntwrk/midnight-js';
import { getNetworkConfig } from './config/network';

async function setupProviders(wallet: Wallet) {
  const config = getNetworkConfig();

  const providers = await createProviders({
    network: {
      indexerUrl: config.indexerUrl,
      indexerWsUrl: config.indexerWsUrl,
      nodeUrl: config.nodeUrl,
      proofServerUrl: config.proofServerUrl
    },
    wallet
  });

  return providers;
}
```

### Individual Provider Setup

```typescript
import {
  PublicDataProvider,
  PrivateStateProvider,
  ProofProvider,
  TransactionProvider
} from '@midnight-ntwrk/midnight-js';

// Public data from indexer
const publicDataProvider = new PublicDataProvider({
  url: config.indexerUrl,
  wsUrl: config.indexerWsUrl
});

// Private state (local)
const privateStateProvider = new PrivateStateProvider();

// Proof generation
const proofProvider = new ProofProvider({
  url: config.proofServerUrl
});

// Transaction submission
const transactionProvider = new TransactionProvider({
  nodeUrl: config.nodeUrl
});
```

## WebSocket Connections

### GraphQL Subscriptions

```typescript
import { createClient } from 'graphql-ws';
import { WebSocket } from 'ws';

const wsClient = createClient({
  url: config.indexerWsUrl,
  webSocketImpl: WebSocket,
  connectionParams: {
    // Optional authentication
  },
  retryAttempts: 5,
  shouldRetry: () => true,
  on: {
    connected: () => console.log('WebSocket connected'),
    closed: () => console.log('WebSocket closed'),
    error: (error) => console.error('WebSocket error:', error)
  }
});

// Subscribe to events
const unsubscribe = wsClient.subscribe(
  {
    query: `subscription {
      newBlock {
        height
        hash
        timestamp
      }
    }`
  },
  {
    next: (data) => console.log('New block:', data),
    error: (error) => console.error('Subscription error:', error),
    complete: () => console.log('Subscription complete')
  }
);
```

### React Hook for Subscriptions

```typescript
// hooks/useNetworkSubscription.ts
import { useEffect, useState } from 'react';
import { createClient } from 'graphql-ws';
import { getNetworkConfig } from '../config/network';

export function useNetworkSubscription<T>(
  query: string,
  variables?: Record<string, unknown>
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const config = getNetworkConfig();

    const client = createClient({
      url: config.indexerWsUrl,
      on: {
        connected: () => setConnected(true),
        closed: () => setConnected(false)
      }
    });

    const unsubscribe = client.subscribe(
      { query, variables },
      {
        next: (result) => setData(result.data as T),
        error: setError,
        complete: () => {}
      }
    );

    return () => {
      unsubscribe();
      client.dispose();
    };
  }, [query, JSON.stringify(variables)]);

  return { data, error, connected };
}
```

## Health Checks

### Check All Services

```typescript
interface ServiceHealth {
  node: boolean;
  indexer: boolean;
  proofServer: boolean;
}

async function checkNetworkHealth(config: NetworkConfig): Promise<ServiceHealth> {
  const results: ServiceHealth = {
    node: false,
    indexer: false,
    proofServer: false
  };

  // Check node
  try {
    const nodeResponse = await fetch(`${config.nodeUrl}/health`, {
      signal: AbortSignal.timeout(5000)
    });
    results.node = nodeResponse.ok;
  } catch {
    results.node = false;
  }

  // Check indexer
  try {
    const indexerResponse = await fetch(config.indexerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: '{ __typename }' }),
      signal: AbortSignal.timeout(5000)
    });
    results.indexer = indexerResponse.ok;
  } catch {
    results.indexer = false;
  }

  // Check proof server
  try {
    const proofResponse = await fetch(`${config.proofServerUrl}/health`, {
      signal: AbortSignal.timeout(5000)
    });
    results.proofServer = proofResponse.ok;
  } catch {
    results.proofServer = false;
  }

  return results;
}
```

### React Health Status Component

```typescript
// components/NetworkStatus.tsx
import { useEffect, useState } from 'react';
import { getNetworkConfig } from '../config/network';

export function NetworkStatus() {
  const [health, setHealth] = useState<ServiceHealth | null>(null);
  const config = getNetworkConfig();

  useEffect(() => {
    const checkHealth = async () => {
      const result = await checkNetworkHealth(config);
      setHealth(result);
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!health) return <div>Checking network...</div>;

  return (
    <div className="network-status">
      <h3>Network: {config.name}</h3>
      <ul>
        <li>Node: {health.node ? '✅' : '❌'}</li>
        <li>Indexer: {health.indexer ? '✅' : '❌'}</li>
        <li>Proof Server: {health.proofServer ? '✅' : '❌'}</li>
      </ul>
    </div>
  );
}
```

## Next.js Configuration

### Environment Files

```bash
# .env.local - Local development
NEXT_PUBLIC_MIDNIGHT_NETWORK=testnet
NEXT_PUBLIC_PROOF_SERVER_URL=http://localhost:6300

# .env.production - Production
NEXT_PUBLIC_MIDNIGHT_NETWORK=mainnet
NEXT_PUBLIC_PROOF_SERVER_URL=https://proof.yourapp.com
```

### Server-Side Configuration

```typescript
// app/api/network/route.ts
import { NextResponse } from 'next/server';
import { getNetworkConfig } from '@/config/network';

export async function GET() {
  const config = getNetworkConfig();

  // Return safe public configuration
  return NextResponse.json({
    network: config.name,
    indexerUrl: config.indexerUrl
    // Don't expose sensitive endpoints
  });
}
```

## Docker Configuration

### docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    environment:
      - NEXT_PUBLIC_MIDNIGHT_NETWORK=testnet
      - NEXT_PUBLIC_NODE_URL=https://rpc.testnet-02.midnight.network
      - NEXT_PUBLIC_INDEXER_URL=https://indexer.testnet-02.midnight.network/api/v1/graphql
      - NEXT_PUBLIC_INDEXER_WS_URL=wss://indexer.testnet-02.midnight.network/api/v1/graphql/ws
      - NEXT_PUBLIC_PROOF_SERVER_URL=http://proof-server:6300
    depends_on:
      - proof-server

  proof-server:
    image: midnightnetwork/proof-server:latest
    command: -- midnight-proof-server --network testnet
```

## Network Switching

```typescript
// Context for network switching
import { createContext, useContext, useState } from 'react';

interface NetworkContextType {
  config: NetworkConfig;
  switchNetwork: (network: 'testnet' | 'mainnet') => void;
}

const NetworkContext = createContext<NetworkContextType | null>(null);

export function NetworkProvider({ children }) {
  const [network, setNetwork] = useState<'testnet' | 'mainnet'>('testnet');

  const config = network === 'mainnet' ? MAINNET_CONFIG : TESTNET_CONFIG;

  const switchNetwork = (newNetwork: 'testnet' | 'mainnet') => {
    setNetwork(newNetwork);
    // Reconnect providers, etc.
  };

  return (
    <NetworkContext.Provider value={{ config, switchNetwork }}>
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  const context = useContext(NetworkContext);
  if (!context) throw new Error('useNetwork must be used within NetworkProvider');
  return context;
}
```

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| Connection timeout | Network issues | Check internet, try again |
| CORS error | Wrong URL or browser restrictions | Use proxy or server-side calls |
| WebSocket fails | Firewall blocking | Check WSS port access |
| Wrong network | Mismatched config | Verify NEXT_PUBLIC_MIDNIGHT_NETWORK |

## Related Skills

- [midnight-js-providers](../midnight-js-providers/SKILL.md) - Provider details
- [midnight-indexer-graphql](../midnight-indexer-graphql/SKILL.md) - GraphQL queries
- [proof-server-operations](../proof-server-operations/SKILL.md) - Proof server setup

## References

- [Midnight Documentation](https://docs.midnight.network)
- [Network Status](https://status.midnight.network)
