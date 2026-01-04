---
description: Integrate Midnight wallet connection into a dApp
name: Integrate Wallet
agent: Midnight Developer
tools:
  - edit/editFiles
  - search
---

# Integrate Wallet

Set up Midnight wallet integration for a dApp.

## Input Variables

- **Framework**: ${input:framework:nextjs, react, or vanilla}
- **Features Needed**: ${input:features:connect, balance, sign, or all}

## Implementation

### 1. Type Declarations

Create `types/midnight.d.ts`:

```typescript
import type { DAppConnectorAPI } from '@midnight-ntwrk/dapp-connector-api';

declare global {
  interface Window {
    midnight?: DAppConnectorAPI;
  }
}

export {};
```

### 2. Wallet Hook (React)

Create `hooks/useMidnightWallet.ts`:

```typescript
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { DAppConnectorWalletAPI, ServiceUriConfig } from '@midnight-ntwrk/dapp-connector-api';

interface WalletState {
  wallet: DAppConnectorWalletAPI | null;
  address: string | null;
  balance: bigint | null;
  isConnecting: boolean;
  error: Error | null;
}

export function useMidnightWallet() {
  const [state, setState] = useState<WalletState>({
    wallet: null,
    address: null,
    balance: null,
    isConnecting: false,
    error: null,
  });

  const connect = useCallback(async () => {
    setState(s => ({ ...s, isConnecting: true, error: null }));

    try {
      const connector = window.midnight;
      if (!connector) {
        throw new Error('Midnight wallet not installed. Please install Lace wallet.');
      }

      const connectorState = await connector.state();
      if (connectorState.enabledWalletApiVersion === null) {
        await connector.enable();
      }

      const wallet = await connector.walletAPI();
      const address = (await wallet.state()).address;

      setState({
        wallet,
        address,
        balance: null,
        isConnecting: false,
        error: null,
      });
    } catch (error) {
      setState(s => ({
        ...s,
        isConnecting: false,
        error: error instanceof Error ? error : new Error('Connection failed'),
      }));
    }
  }, []);

  const disconnect = useCallback(() => {
    setState({
      wallet: null,
      address: null,
      balance: null,
      isConnecting: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    connect,
    disconnect,
    isConnected: state.wallet !== null,
  };
}
```

### 3. Wallet Context (React)

Create `contexts/WalletContext.tsx`:

```typescript
'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useMidnightWallet } from '@/hooks/useMidnightWallet';

type WalletContextType = ReturnType<typeof useMidnightWallet>;

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const wallet = useMidnightWallet();
  return (
    <WalletContext.Provider value={wallet}>
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

### 4. Wallet Button Component

```typescript
'use client';

import { useWallet } from '@/contexts/WalletContext';

export function WalletButton() {
  const { isConnected, isConnecting, address, error, connect, disconnect } = useWallet();

  if (error) {
    return (
      <div className="text-red-500">
        {error.message}
        <button onClick={connect}>Retry</button>
      </div>
    );
  }

  if (isConnected) {
    return (
      <div>
        <span>{address?.slice(0, 8)}...{address?.slice(-6)}</span>
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

## Output Format

Provide:

1. Type declaration file
2. Custom hook for wallet management
3. React context provider
4. UI components
5. Usage example

Use #tool:search to find existing patterns. Use #tool:edit/editFiles to create the integration files.
