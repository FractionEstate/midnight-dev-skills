---
name: dapp-connector-api
description: Integrate browser wallet connections using the Midnight DApp Connector API. Covers enable(), isEnabled(), state(), balanceAndProveTransaction(), and submitTransaction() methods for connecting web applications to the Lace Midnight Preview wallet.
---

# DApp Connector API Integration

The DApp Connector API (`@midnight-ntwrk/dapp-connector-api` v3.0.0) enables web applications to connect with browser extension wallets like Lace Midnight Preview. This skill covers the complete wallet connection flow.

## When to Use

- Building web-based dApps that need wallet connectivity
- Implementing "Connect Wallet" functionality
- Submitting transactions through browser wallets
- Querying wallet state and balances

## Core Concepts

### API Injection

The wallet extension injects the API into `window.midnight`:

```typescript
interface Window {
  midnight?: {
    mnLace?: DAppConnectorAPI;
  };
}
```

### API Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `isEnabled()` | Check if DApp is connected | `Promise<boolean>` |
| `enable()` | Request wallet connection | `Promise<DAppConnectorWalletAPI>` |
| `apiVersion()` | Get API version | `string` |
| `name()` | Get wallet name | `string` |
| `icon()` | Get wallet icon (base64) | `string` |

## Implementation Steps

### Step 1: Check Wallet Availability

```typescript
function checkWalletAvailable(): boolean {
  return typeof window !== 'undefined' &&
         window.midnight?.mnLace !== undefined;
}

function getConnectorAPI(): DAppConnectorAPI | null {
  if (!checkWalletAvailable()) {
    console.error('Lace Midnight Preview wallet not installed');
    return null;
  }
  return window.midnight!.mnLace!;
}
```

### Step 2: Request Connection

```typescript
import type {
  DAppConnectorAPI,
  DAppConnectorWalletAPI
} from '@midnight-ntwrk/dapp-connector-api';

async function connectWallet(): Promise<DAppConnectorWalletAPI | null> {
  const api = getConnectorAPI();
  if (!api) return null;

  try {
    // Check if already connected
    const isConnected = await api.isEnabled();
    if (isConnected) {
      return api.enable();
    }

    // Request new connection (prompts user)
    const walletAPI = await api.enable();
    console.log('Connected to wallet');
    return walletAPI;
  } catch (error) {
    console.error('User rejected connection:', error);
    return null;
  }
}
```

### Step 3: Query Wallet State

Once connected, use the `DAppConnectorWalletAPI`:

```typescript
async function getWalletState(walletAPI: DAppConnectorWalletAPI) {
  const state = await walletAPI.state();

  return {
    address: state.address,
    balances: state.balances,
    coinPublicKey: state.coinPublicKey,
    encryptionPublicKey: state.encryptionPublicKey
  };
}
```

### Step 4: Balance and Prove Transactions

```typescript
import { createBalancedTx } from '@midnight-ntwrk/midnight-js-types';
import type { UnbalancedTransaction } from '@midnight-ntwrk/ledger';

async function balanceAndProve(
  walletAPI: DAppConnectorWalletAPI,
  unbalancedTx: UnbalancedTransaction,
  newCoins: CoinInfo[] = []
): Promise<BalancedTransaction> {
  // Wallet handles balancing, proving, and signing
  const balancedTx = await walletAPI.balanceAndProveTransaction(
    unbalancedTx,
    newCoins
  );

  return createBalancedTx(balancedTx);
}
```

### Step 5: Submit Transactions

```typescript
async function submitTransaction(
  walletAPI: DAppConnectorWalletAPI,
  provenTx: Transaction
): Promise<TransactionId> {
  const result = await walletAPI.submitTransaction(provenTx);
  console.log('Transaction submitted:', result.txId);
  return result;
}
```

## Complete React Hook Example

```typescript
import { useState, useCallback, useEffect } from 'react';
import type {
  DAppConnectorAPI,
  DAppConnectorWalletAPI
} from '@midnight-ntwrk/dapp-connector-api';

interface WalletState {
  isAvailable: boolean;
  isConnected: boolean;
  address: string | null;
  balances: Record<string, bigint>;
}

export function useWalletConnector() {
  const [walletAPI, setWalletAPI] = useState<DAppConnectorWalletAPI | null>(null);
  const [state, setState] = useState<WalletState>({
    isAvailable: false,
    isConnected: false,
    address: null,
    balances: {}
  });

  // Check availability on mount
  useEffect(() => {
    const checkAvailability = () => {
      const available = window.midnight?.mnLace !== undefined;
      setState(prev => ({ ...prev, isAvailable: available }));
    };

    checkAvailability();
    // Retry check after delay for slow-loading extensions
    const timeout = setTimeout(checkAvailability, 1000);
    return () => clearTimeout(timeout);
  }, []);

  const connect = useCallback(async () => {
    const api = window.midnight?.mnLace;
    if (!api) throw new Error('Wallet not available');

    const wallet = await api.enable();
    setWalletAPI(wallet);

    const walletState = await wallet.state();
    setState({
      isAvailable: true,
      isConnected: true,
      address: walletState.address,
      balances: walletState.balances
    });

    return wallet;
  }, []);

  const disconnect = useCallback(() => {
    setWalletAPI(null);
    setState(prev => ({
      ...prev,
      isConnected: false,
      address: null,
      balances: {}
    }));
  }, []);

  return {
    ...state,
    walletAPI,
    connect,
    disconnect
  };
}
```

## Error Handling

```typescript
enum ConnectorError {
  NOT_INSTALLED = 'Wallet extension not installed',
  USER_REJECTED = 'User rejected connection request',
  ALREADY_CONNECTED = 'Already connected to wallet',
  NETWORK_MISMATCH = 'Wallet on different network'
}

async function safeConnect(): Promise<Result<DAppConnectorWalletAPI>> {
  try {
    if (!window.midnight?.mnLace) {
      return { error: ConnectorError.NOT_INSTALLED };
    }

    const api = window.midnight.mnLace;
    const wallet = await api.enable();
    return { value: wallet };
  } catch (e) {
    if (e instanceof Error && e.message.includes('rejected')) {
      return { error: ConnectorError.USER_REJECTED };
    }
    return { error: String(e) };
  }
}
```

## TypeScript Types

```typescript
// Key types from @midnight-ntwrk/dapp-connector-api

interface DAppConnectorAPI {
  enable(): Promise<DAppConnectorWalletAPI>;
  isEnabled(): Promise<boolean>;
  apiVersion(): string;
  name(): string;
  icon(): string;
}

interface DAppConnectorWalletAPI {
  state(): Promise<WalletState>;
  balanceAndProveTransaction(
    tx: UnbalancedTransaction,
    newCoins?: CoinInfo[]
  ): Promise<BalancedTransaction>;
  submitTransaction(tx: Transaction): Promise<TransactionId>;
}

interface WalletState {
  address: string;
  balances: Record<string, bigint>;
  coinPublicKey: string;
  encryptionPublicKey: string;
}
```

## Best Practices

1. **Check availability before connecting** - Wallet may not be installed
2. **Handle user rejection gracefully** - Users can decline connection
3. **Cache connection state** - Avoid repeated enable() calls
4. **Subscribe to state changes** - Balances update after transactions
5. **Validate network** - Ensure wallet matches your target network

## Related Skills

- [nextjs-wallet-integration](../nextjs-wallet-integration/SKILL.md) - Full Next.js integration
- [wallet-sdk-integration](../wallet-sdk-integration/SKILL.md) - Programmatic wallet SDK
- [zswap-transactions](../zswap-transactions/SKILL.md) - Transaction building

## References

- [DApp Connector API Reference](https://docs.midnight.network/develop/reference/midnight-api/dapp-connector)
- [Lace Wallet Setup](https://docs.midnight.network/getting-started/installation)
