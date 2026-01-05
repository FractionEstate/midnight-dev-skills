# Wallet Connection

Complete guide for connecting Midnight dApps to browser wallets.

## DApp Connector API

```typescript
import type {
  DAppConnectorAPI,
  DAppConnectorWalletAPI,
  ServiceUriConfig,
} from '@midnight-ntwrk/dapp-connector-api';

declare global {
  interface Window {
    midnight?: DAppConnectorAPI;
  }
}
```

## Connection Flow

### 1. Detect Wallet

```typescript
function isWalletInstalled(): boolean {
  return typeof window !== 'undefined' && !!window.midnight;
}

// Wait for wallet injection (may load after page)
async function waitForWallet(timeout = 3000): Promise<boolean> {
  return new Promise((resolve) => {
    if (isWalletInstalled()) {
      resolve(true);
      return;
    }

    const timer = setTimeout(() => resolve(false), timeout);
    const check = setInterval(() => {
      if (isWalletInstalled()) {
        clearInterval(check);
        clearTimeout(timer);
        resolve(true);
      }
    }, 100);
  });
}
```

### 2. Connect to Wallet

```typescript
export interface WalletConnectionResult {
  success: boolean;
  walletApi?: DAppConnectorWalletAPI;
  error?: string;
}

export async function connectWallet(): Promise<WalletConnectionResult> {
  const connector = window.midnight;

  if (!connector) {
    return { success: false, error: 'Wallet not installed' };
  }

  try {
    // Check current state
    const state = await connector.state();

    // Enable if not already
    if (state.enabledWalletApiVersion === null) {
      await connector.enable();
    }

    // Get wallet API
    const walletApi = await connector.walletAPI();
    return { success: true, walletApi };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Connection failed',
    };
  }
}
```

### 3. Get Wallet State

```typescript
async function getWalletInfo(walletApi: DAppConnectorWalletAPI) {
  // Get balance and prove ownership
  const balance = await walletApi.balanceAndProveOwnership();

  // Get coin public key
  const coinPublicKey = await walletApi.coinPublicKey();

  // Get service URIs
  const uris = await walletApi.serviceUriConfig();

  return { balance, coinPublicKey, uris };
}
```

## React Hook

```typescript
import { useState, useEffect, useCallback } from 'react';
import type { DAppConnectorWalletAPI } from '@midnight-ntwrk/dapp-connector-api';

interface WalletState {
  isInstalled: boolean;
  isConnected: boolean;
  isConnecting: boolean;
  walletApi: DAppConnectorWalletAPI | null;
  error: string | null;
}

export function useMidnightWallet() {
  const [state, setState] = useState<WalletState>({
    isInstalled: false,
    isConnected: false,
    isConnecting: false,
    walletApi: null,
    error: null,
  });

  // Check installation on mount
  useEffect(() => {
    const checkWallet = () => {
      setState((prev) => ({
        ...prev,
        isInstalled: typeof window !== 'undefined' && !!window.midnight,
      }));
    };

    checkWallet();
    const timer = setTimeout(checkWallet, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Connect function
  const connect = useCallback(async () => {
    setState((prev) => ({ ...prev, isConnecting: true, error: null }));

    const result = await connectWallet();

    setState((prev) => ({
      ...prev,
      isConnecting: false,
      isConnected: result.success,
      walletApi: result.walletApi ?? null,
      error: result.error ?? null,
    }));

    return result.success;
  }, []);

  // Disconnect function
  const disconnect = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isConnected: false,
      walletApi: null,
    }));
  }, []);

  return { ...state, connect, disconnect };
}
```

## Wallet API Methods

| Method                       | Returns            | Description                  |
| ---------------------------- | ------------------ | ---------------------------- |
| `balanceAndProveOwnership()` | `bigint`           | Balance with ownership proof |
| `coinPublicKey()`            | `string`           | Public key for coins         |
| `serviceUriConfig()`         | `ServiceUriConfig` | Network endpoints            |
| `state()`                    | `ConnectorState`   | Connection state             |
| `enable()`                   | `void`             | Request connection           |

## Service URI Configuration

```typescript
interface ServiceUriConfig {
  indexer: string;
  indexerWS: string;
  proofServer: string;
  node: string;
}

async function getEndpoints(walletApi: DAppConnectorWalletAPI): Promise<ServiceUriConfig> {
  return await walletApi.serviceUriConfig();
}
```

## Error Handling

```typescript
async function safeConnect(): Promise<void> {
  try {
    const result = await connectWallet();

    if (!result.success) {
      switch (result.error) {
        case 'Wallet not installed':
          // Prompt to install Lace
          showInstallPrompt();
          break;
        case 'User rejected':
          // User declined connection
          showRetryOption();
          break;
        default:
          console.error('Connection error:', result.error);
      }
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}
```

## Best Practices

1. **Always check installation first** before attempting connection
2. **Handle rejection gracefully** - user may decline
3. **Persist connection state** - don't reconnect on every page
4. **Show clear status** - user should know connection state
5. **Provide fallback** - link to wallet installation if not found
