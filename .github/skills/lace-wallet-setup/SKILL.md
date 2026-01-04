---
name: lace-wallet-setup
description: Integrate the Lace wallet browser extension with your Midnight dApp. Covers wallet detection, connection flow, transaction signing, state synchronization, and error handling for seamless wallet integration.
---

# Lace Wallet Setup

Integrate the Lace wallet browser extension to enable users to interact with your Midnight dApp.

## When to Use

- Building a web-based Midnight dApp
- Enabling user wallet connection
- Signing transactions with user keys
- Managing user balances and state
- Handling wallet events

## Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Your dApp     │◀──▶│  Lace Wallet    │◀──▶│   Midnight      │
│   (Next.js)     │    │  (Extension)    │    │   Network       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                      │
        └──────────────────────┘
           DApp Connector API
```

## Prerequisites

1. User has Lace wallet installed
2. Midnight extension enabled in Lace
3. User has testnet/mainnet account

## Wallet Detection

### Check Installation

```typescript
// Check if Lace wallet is available
function isLaceInstalled(): boolean {
  return typeof window !== 'undefined' &&
         'midnight' in window &&
         typeof window.midnight === 'object';
}

// Check specific capabilities
function getLaceCapabilities(): string[] {
  if (!isLaceInstalled()) return [];

  return Object.keys(window.midnight || {});
}
```

### React Hook for Detection

```typescript
// hooks/useLaceWallet.ts
import { useState, useEffect } from 'react';

interface LaceState {
  installed: boolean;
  enabled: boolean;
  loading: boolean;
  error: string | null;
}

export function useLaceDetection() {
  const [state, setState] = useState<LaceState>({
    installed: false,
    enabled: false,
    loading: true,
    error: null
  });

  useEffect(() => {
    // Check after window loads
    const checkWallet = () => {
      if (typeof window === 'undefined') {
        setState(s => ({ ...s, loading: true }));
        return;
      }

      const installed = 'midnight' in window;

      setState({
        installed,
        enabled: installed && Boolean(window.midnight?.enabled),
        loading: false,
        error: installed ? null : 'Lace wallet not detected'
      });
    };

    // Initial check
    checkWallet();

    // Listen for wallet injection (some extensions inject async)
    const timeout = setTimeout(checkWallet, 1000);

    return () => clearTimeout(timeout);
  }, []);

  return state;
}
```

## Wallet Connection

### Request Connection

```typescript
import { DAppConnectorAPI } from '@midnight-ntwrk/dapp-connector-api';

async function connectWallet(): Promise<DAppConnectorAPI | null> {
  // Check if available
  if (!window.midnight) {
    throw new Error('Lace wallet not installed');
  }

  // Request connection
  try {
    const api = await window.midnight.enable({
      name: 'My Midnight dApp',
      icon: 'https://mydapp.com/icon.png'
    });

    return api;
  } catch (error) {
    if (error.code === 'USER_REJECTED') {
      throw new Error('User rejected connection request');
    }
    throw error;
  }
}
```

### Connection Flow Component

```typescript
// components/WalletConnect.tsx
import { useState } from 'react';
import { useLaceDetection } from '../hooks/useLaceWallet';

export function WalletConnect() {
  const { installed, loading } = useLaceDetection();
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [api, setApi] = useState<DAppConnectorAPI | null>(null);

  const handleConnect = async () => {
    setConnecting(true);
    setError(null);

    try {
      const walletApi = await connectWallet();
      setApi(walletApi);
      setConnected(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setConnecting(false);
    }
  };

  if (loading) {
    return <div>Checking for wallet...</div>;
  }

  if (!installed) {
    return (
      <div className="wallet-install">
        <p>Lace wallet not detected</p>
        <a
          href="https://www.lace.io"
          target="_blank"
          rel="noopener noreferrer"
        >
          Install Lace Wallet
        </a>
      </div>
    );
  }

  if (connected) {
    return (
      <div className="wallet-connected">
        ✅ Wallet Connected
      </div>
    );
  }

  return (
    <div className="wallet-connect">
      <button
        onClick={handleConnect}
        disabled={connecting}
      >
        {connecting ? 'Connecting...' : 'Connect Lace Wallet'}
      </button>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
```

## Using Connected Wallet

### Get Wallet State

```typescript
async function getWalletState(api: DAppConnectorAPI) {
  // Get account info
  const state = await api.state();

  return {
    address: state.address,
    balance: state.balance,
    network: state.network
  };
}
```

### Get Balance

```typescript
async function getBalance(api: DAppConnectorAPI): Promise<bigint> {
  const balance = await api.balance();
  return balance.confirmed;
}
```

### Watch for State Changes

```typescript
// Subscribe to state changes
function watchWalletState(
  api: DAppConnectorAPI,
  callback: (state: WalletState) => void
) {
  return api.onStateChange(callback);
}

// React hook
function useWalletState(api: DAppConnectorAPI | null) {
  const [state, setState] = useState<WalletState | null>(null);

  useEffect(() => {
    if (!api) return;

    // Get initial state
    api.state().then(setState);

    // Watch for changes
    const unsubscribe = api.onStateChange(setState);

    return () => unsubscribe();
  }, [api]);

  return state;
}
```

## Transaction Signing

### Sign and Submit Transaction

```typescript
import { Transaction } from '@midnight-ntwrk/zswap';

async function signAndSubmitTransaction(
  api: DAppConnectorAPI,
  transaction: Transaction
): Promise<string> {
  // Request user signature
  const signedTx = await api.signTransaction(transaction);

  // Submit to network
  const txHash = await api.submitTransaction(signedTx);

  return txHash;
}
```

### With User Confirmation UI

```typescript
// components/TransactionConfirm.tsx
import { useState } from 'react';

interface TransactionConfirmProps {
  transaction: Transaction;
  api: DAppConnectorAPI;
  onSuccess: (txHash: string) => void;
  onError: (error: Error) => void;
  onCancel: () => void;
}

export function TransactionConfirm({
  transaction,
  api,
  onSuccess,
  onError,
  onCancel
}: TransactionConfirmProps) {
  const [signing, setSigning] = useState(false);

  const handleConfirm = async () => {
    setSigning(true);

    try {
      const txHash = await signAndSubmitTransaction(api, transaction);
      onSuccess(txHash);
    } catch (error) {
      if (error.code === 'USER_REJECTED') {
        onCancel();
      } else {
        onError(error);
      }
    } finally {
      setSigning(false);
    }
  };

  return (
    <div className="tx-confirm">
      <h3>Confirm Transaction</h3>
      <div className="tx-details">
        <p>Amount: {transaction.amount}</p>
        <p>Recipient: {transaction.recipient}</p>
        <p>Fee: {transaction.fee}</p>
      </div>
      <div className="tx-actions">
        <button onClick={onCancel} disabled={signing}>
          Cancel
        </button>
        <button onClick={handleConfirm} disabled={signing}>
          {signing ? 'Signing...' : 'Confirm'}
        </button>
      </div>
    </div>
  );
}
```

## Complete Wallet Context

```typescript
// contexts/WalletContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DAppConnectorAPI } from '@midnight-ntwrk/dapp-connector-api';

interface WalletContextType {
  api: DAppConnectorAPI | null;
  connected: boolean;
  address: string | null;
  balance: bigint;
  network: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  signTransaction: (tx: Transaction) => Promise<string>;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [api, setApi] = useState<DAppConnectorAPI | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<bigint>(0n);
  const [network, setNetwork] = useState<string | null>(null);

  const connected = api !== null;

  // Sync state from wallet
  useEffect(() => {
    if (!api) return;

    const syncState = async () => {
      const state = await api.state();
      setAddress(state.address);
      setBalance(state.balance.confirmed);
      setNetwork(state.network);
    };

    syncState();
    const unsubscribe = api.onStateChange(syncState);

    return () => unsubscribe();
  }, [api]);

  const connect = async () => {
    if (!window.midnight) {
      throw new Error('Wallet not installed');
    }

    const connectedApi = await window.midnight.enable({
      name: 'My dApp'
    });

    setApi(connectedApi);
  };

  const disconnect = () => {
    setApi(null);
    setAddress(null);
    setBalance(0n);
    setNetwork(null);
  };

  const signTransaction = async (tx: Transaction): Promise<string> => {
    if (!api) throw new Error('Wallet not connected');

    const signed = await api.signTransaction(tx);
    return api.submitTransaction(signed);
  };

  return (
    <WalletContext.Provider value={{
      api,
      connected,
      address,
      balance,
      network,
      connect,
      disconnect,
      signTransaction
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
}
```

## Error Handling

### Common Wallet Errors

```typescript
enum WalletErrorCode {
  NOT_INSTALLED = 'NOT_INSTALLED',
  USER_REJECTED = 'USER_REJECTED',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  NETWORK_MISMATCH = 'NETWORK_MISMATCH',
  CONNECTION_LOST = 'CONNECTION_LOST'
}

function handleWalletError(error: any): string {
  switch (error.code) {
    case WalletErrorCode.NOT_INSTALLED:
      return 'Please install Lace wallet';
    case WalletErrorCode.USER_REJECTED:
      return 'Request was rejected';
    case WalletErrorCode.INSUFFICIENT_FUNDS:
      return 'Insufficient balance';
    case WalletErrorCode.NETWORK_MISMATCH:
      return 'Please switch to the correct network';
    case WalletErrorCode.CONNECTION_LOST:
      return 'Wallet connection lost. Please reconnect.';
    default:
      return error.message || 'Unknown wallet error';
  }
}
```

## Network Switching

```typescript
async function requestNetworkSwitch(
  api: DAppConnectorAPI,
  network: 'testnet' | 'mainnet'
) {
  const currentNetwork = (await api.state()).network;

  if (currentNetwork !== network) {
    // Request network switch (user must approve in wallet)
    await api.switchNetwork(network);
  }
}
```

## Security Best Practices

1. **Always verify wallet origin**
```typescript
// Check we're talking to the real Lace wallet
if (window.midnight?.isLace !== true) {
  throw new Error('Unknown wallet provider');
}
```

2. **Don't store sensitive data**
```typescript
// NEVER store private keys or seeds
// Let the wallet handle all signing
```

3. **Validate transaction before signing**
```typescript
// Always show users what they're signing
// Verify amounts, recipients, etc.
```

4. **Handle disconnections gracefully**
```typescript
useEffect(() => {
  const handleDisconnect = () => {
    setApi(null);
    // Clear sensitive state
  };

  api?.onDisconnect(handleDisconnect);

  return () => api?.offDisconnect(handleDisconnect);
}, [api]);
```

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| Wallet not detected | Extension not installed | Install Lace |
| Connection rejected | User denied | Request again |
| Network mismatch | Wrong network | Switch network |
| Transaction fails | Various | Check error code |

## Related Skills

- [dapp-connector-api](../dapp-connector-api/SKILL.md) - DApp Connector details
- [wallet-sdk-integration](../wallet-sdk-integration/SKILL.md) - Wallet SDK
- [nextjs-wallet-integration](../nextjs-wallet-integration/SKILL.md) - Next.js setup

## References

- [Lace Wallet](https://www.lace.io)
- [Midnight Documentation](https://docs.midnight.network)
- [DApp Connector API](https://docs.midnight.network/develop/reference/dapp-connector-api)
