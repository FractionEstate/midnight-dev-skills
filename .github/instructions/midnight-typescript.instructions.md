---
description: TypeScript guidelines for Midnight Network dApp development
name: Midnight TypeScript
applyTo: '**/*.{ts,tsx}'
---

# Midnight dApp TypeScript Guidelines

You are an expert in building Midnight Network dApps with TypeScript and Next.js.

## Package Imports

### Core Midnight Packages

```typescript
// DApp Connector (augments window.midnight)
import '@midnight-ntwrk/dapp-connector-api';
import type {
  DAppConnectorAPI,
  DAppConnectorWalletAPI,
  DAppConnectorWalletState,
  ServiceUriConfig,
} from '@midnight-ntwrk/dapp-connector-api';

// Network configuration
import { NetworkId, setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';

// Transactions
import type {
  Transaction,
  TransactionId,
  UnbalancedTransaction,
} from '@midnight-ntwrk/midnight-js-types';

// Contract interaction
import {
  deployContract,
  callContract,
  ContractInstance,
} from '@midnight-ntwrk/midnight-js-contracts';

// Ledger types
import type { ContractAddress, TransactionIdentifier } from '@midnight-ntwrk/ledger';

// ZSwap (token operations)
import type { CoinInfo } from '@midnight-ntwrk/zswap';
```

## Wallet Connection

Access the Lace wallet via `window.midnight.mnLace`:

```typescript
// Import augments window global automatically
import '@midnight-ntwrk/dapp-connector-api';

// Check availability
const isInstalled = () => !!window.midnight?.mnLace;

// Connect and get state
async function connect() {
  const api = await window.midnight?.mnLace.enable();
  if (!api) throw new Error('Wallet not available');

  const state = await api.state();
  return { api, address: state.address };
}
```

## Client Components

Wallet interactions must be in Client Components:

```typescript
'use client';

import { useState, useEffect } from 'react';
import "@midnight-ntwrk/dapp-connector-api";
import type { DAppConnectorWalletAPI, DAppConnectorWalletState } from '@midnight-ntwrk/dapp-connector-api';

export function WalletButton() {
  const [api, setApi] = useState<DAppConnectorWalletAPI | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const connect = async () => {
    setIsConnecting(true);
    try {
      const connector = window.midnight?.mnLace;
      if (!connector) throw new Error('Lace wallet not installed');

      const walletApi = await connector.enable();
      const state = await walletApi.state();

      setApi(walletApi);
      setAddress(state.address);
    } catch (error) {
      console.error('Wallet connection failed:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <button onClick={connect} disabled={isConnecting}>
      {address ? `Connected: ${address.slice(0,8)}...` : 'Connect Wallet'}
    </button>
  );
}
```

## Network Configuration

### Testnet Endpoints

```typescript
const TESTNET_CONFIG = {
  indexer: 'https://indexer.testnet-02.midnight.network/api/v1/graphql',
  indexerWS: 'wss://indexer.testnet-02.midnight.network/api/v1/graphql/ws',
  node: 'https://rpc.testnet-02.midnight.network',
  proofServer: 'http://localhost:6300',
};
```

## Provider Setup

```typescript
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';

export const providers = {
  publicDataProvider: indexerPublicDataProvider(TESTNET_CONFIG.indexer, TESTNET_CONFIG.indexerWS),
  proofProvider: httpClientProofProvider(TESTNET_CONFIG.proofServer),
};
```

## Contract Interaction

### Deploy a Contract

```typescript
import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';

const deployed = await deployContract(providers, {
  contract: MyContractFactory,
  initialPrivateState: { secretKey: new Uint8Array(32) },
});

console.log('Contract address:', deployed.contractAddress);
```

### Call a Circuit

```typescript
const result = await deployed.call.myCircuit({
  arg1: 100n,
  arg2: true,
});

await result.wait(); // Wait for confirmation
```

## Error Handling

```typescript
try {
  const result = await contract.call.transfer({ amount: 100n });
  await result.wait();
} catch (error) {
  if (error.code === 'WALLET_NOT_CONNECTED') {
    // Prompt user to connect wallet
  } else if (error.code === 'INSUFFICIENT_FUNDS') {
    // Show balance error
  } else if (error.code === 'PROOF_GENERATION_FAILED') {
    // Check proof server is running
  }
}
```

## Type Safety

### Contract Types

```typescript
// Import generated types from compiled contract
import type { MyContractTypes } from '../managed/mycontract/contract';

// Use typed parameters
const params: MyContractTypes.TransferParams = {
  recipient: address,
  amount: 100n,
};
```

## Best Practices

1. **Always use 'use client'** for wallet-connected components
2. **Check wallet availability** before any operation
3. **Handle all error states** gracefully
4. **Use typed imports** from @midnight-ntwrk packages
5. **Await transaction confirmation** before updating UI
6. **Never log sensitive data** (witnesses, private keys)
