# Midnight Wallet Hook Template

React hook for wallet connection and state management.

## Location

`hooks/useMidnightWallet.ts`

## Template

```typescript
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { DAppConnectorAPI, WalletAPI } from '@midnight-ntwrk/dapp-connector-api';

declare global {
  interface Window {
    midnight?: DAppConnectorAPI;
  }
}

interface WalletState {
  isConnected: boolean;
  isConnecting: boolean;
  address: string | null;
  balance: bigint | null;
  error: string | null;
}

export function useMidnightWallet() {
  const [state, setState] = useState<WalletState>({
    isConnected: false,
    isConnecting: false,
    address: null,
    balance: null,
    error: null,
  });

  const [walletApi, setWalletApi] = useState<WalletAPI | null>(null);

  // Check if wallet is available
  const isWalletAvailable = typeof window !== 'undefined' && !!window.midnight;

  // Connect wallet
  const connect = useCallback(async () => {
    if (!window.midnight) {
      setState((prev) => ({ ...prev, error: 'Midnight wallet not installed' }));
      return;
    }

    setState((prev) => ({ ...prev, isConnecting: true, error: null }));

    try {
      const connector = window.midnight;
      const connectorState = await connector.state();

      if (connectorState.enabledWalletApiVersion === null) {
        await connector.enable();
      }

      const api = await connector.walletAPI();
      const address = await api.address();
      const balance = await api.balance();

      setWalletApi(api);
      setState({
        isConnected: true,
        isConnecting: false,
        address,
        balance,
        error: null,
      });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isConnecting: false,
        error: err instanceof Error ? err.message : 'Failed to connect',
      }));
    }
  }, []);

  // Disconnect wallet
  const disconnect = useCallback(() => {
    setWalletApi(null);
    setState({
      isConnected: false,
      isConnecting: false,
      address: null,
      balance: null,
      error: null,
    });
  }, []);

  // Refresh balance
  const refreshBalance = useCallback(async () => {
    if (!walletApi) return;

    try {
      const balance = await walletApi.balance();
      setState((prev) => ({ ...prev, balance }));
    } catch (err) {
      console.error('Failed to refresh balance:', err);
    }
  }, [walletApi]);

  return {
    ...state,
    walletApi,
    isWalletAvailable,
    connect,
    disconnect,
    refreshBalance,
  };
}
```

## Usage

```tsx
'use client';

import { useMidnightWallet } from '@/hooks/useMidnightWallet';

export function WalletButton() {
  const {
    isConnected,
    isConnecting,
    address,
    balance,
    error,
    isWalletAvailable,
    connect,
    disconnect,
  } = useMidnightWallet();

  if (!isWalletAvailable) {
    return (
      <a href="https://midnight.network/wallet" target="_blank">
        Install Wallet
      </a>
    );
  }

  if (isConnected) {
    return (
      <div>
        <p>Address: {address?.slice(0, 8)}...</p>
        <p>Balance: {balance?.toString()} tDUST</p>
        <button onClick={disconnect}>Disconnect</button>
      </div>
    );
  }

  return (
    <button onClick={connect} disabled={isConnecting}>
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </button>
  );
}
```

## Key Patterns

| Pattern | Description |
|---------|-------------|
| `'use client'` | Client component required |
| State management | Track connection status |
| Error handling | User-friendly messages |
| Wallet API | Access address, balance, signing |
