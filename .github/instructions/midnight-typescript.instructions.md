---
applyTo: '**/*.{ts,tsx}'
---

# Midnight dApp TypeScript Guidelines

You are an expert in building Midnight Network dApps with TypeScript and Next.js.

## Package Imports

### Core Midnight Packages
```typescript
// Wallet connection
import type { DAppConnectorAPI, WalletAPI } from '@midnight-ntwrk/dapp-connector-api';

// Transactions
import type { Transaction, TransactionId, UnbalancedTransaction } from '@midnight-ntwrk/midnight-js-types';

// Contract interaction
import { deployContract, callContract, ContractInstance } from '@midnight-ntwrk/midnight-js-contracts';

// State management
import type { PrivateStateProvider, PublicDataProvider, ZKConfigProvider } from '@midnight-ntwrk/midnight-js-providers';

// ZSwap (token operations)
import type { CoinInfo, TransactionInputs, TransactionOutputs } from '@midnight-ntwrk/zswap';
```

## Window Global Declaration

Always declare the Midnight global for wallet access:
```typescript
declare global {
  interface Window {
    midnight?: DAppConnectorAPI;
  }
}
```

## Client Components

Wallet interactions must be in Client Components:
```typescript
'use client';

import { useState, useEffect } from 'react';
import type { WalletAPI } from '@midnight-ntwrk/dapp-connector-api';

export function WalletButton() {
  const [wallet, setWallet] = useState<WalletAPI | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const connect = async () => {
    setIsConnecting(true);
    try {
      const connector = window.midnight;
      if (!connector) throw new Error('Wallet not installed');

      await connector.enable();
      const api = await connector.walletAPI();
      setWallet(api);
    } catch (error) {
      console.error('Connection failed:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <button onClick={connect} disabled={isConnecting}>
      {wallet ? 'Connected' : 'Connect Wallet'}
    </button>
  );
}
```

## Provider Configuration

### Network Configuration
```typescript
export const TESTNET_CONFIG = {
  indexer: 'https://indexer.testnet-02.midnight.network/api/v1/graphql',
  indexerWS: 'wss://indexer.testnet-02.midnight.network/api/v1/graphql/ws',
  node: 'https://rpc.testnet-02.midnight.network',
  proofServer: 'http://localhost:6300'
} as const;
```

### Provider Setup
```typescript
import { createPublicDataProvider, createPrivateStateProvider, createZKConfigProvider } from '@midnight-ntwrk/midnight-js-providers';

export function createProviders(config: typeof TESTNET_CONFIG) {
  return {
    publicData: createPublicDataProvider({
      indexerUrl: config.indexer,
      indexerWsUrl: config.indexerWS
    }),
    privateState: createPrivateStateProvider(),
    zkConfig: createZKConfigProvider({
      proofServerUrl: config.proofServer
    })
  };
}
```

## Transaction Handling

### Submit Transaction Pattern
```typescript
export async function submitTransaction(
  wallet: WalletAPI,
  tx: UnbalancedTransaction
): Promise<TransactionId> {
  // 1. Balance the transaction
  const balancedTx = await wallet.balanceTransaction(tx);

  // 2. Sign the transaction
  const signedTx = await wallet.signTransaction(balancedTx);

  // 3. Submit to network
  const result = await wallet.submitTransaction(signedTx);

  return result.txId;
}
```

### Transaction Confirmation
```typescript
export async function waitForConfirmation(
  txId: TransactionId,
  publicData: PublicDataProvider,
  maxAttempts = 30
): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    const status = await publicData.getTransactionStatus(txId);
    if (status === 'confirmed') return true;
    if (status === 'failed') return false;
    await new Promise(r => setTimeout(r, 2000));
  }
  throw new Error('Transaction confirmation timeout');
}
```

## Error Handling

```typescript
import { MidnightError, WalletError, NetworkError } from '@midnight-ntwrk/errors';

export async function safeTransaction<T>(
  operation: () => Promise<T>
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const data = await operation();
    return { success: true, data };
  } catch (error) {
    if (error instanceof WalletError) {
      return { success: false, error: `Wallet: ${error.message}` };
    }
    if (error instanceof NetworkError) {
      return { success: false, error: `Network: ${error.message}` };
    }
    if (error instanceof MidnightError) {
      return { success: false, error: `Midnight: ${error.message}` };
    }
    throw error;
  }
}
```

## Type Safety

Always use strict types from Midnight packages:
```typescript
// ❌ Bad: Using any
const balance: any = await wallet.getBalance();

// ✅ Good: Using proper types
import type { CoinInfo } from '@midnight-ntwrk/zswap';
const balance: CoinInfo = await wallet.getBalance();
```

## React Hooks Pattern

```typescript
// hooks/useMidnightWallet.ts
'use client';

import { useState, useCallback, useEffect } from 'react';
import type { WalletAPI } from '@midnight-ntwrk/dapp-connector-api';

export function useMidnightWallet() {
  const [wallet, setWallet] = useState<WalletAPI | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const connector = window.midnight;
        if (connector) {
          const state = await connector.state();
          if (state.enabledWalletApiVersion !== null) {
            const api = await connector.walletAPI();
            setWallet(api);
          }
        }
      } catch (e) {
        setError(e instanceof Error ? e : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    };
    checkConnection();
  }, []);

  const connect = useCallback(async () => {
    // ... connection logic
  }, []);

  const disconnect = useCallback(() => {
    setWallet(null);
  }, []);

  return { wallet, isLoading, error, connect, disconnect };
}
```
