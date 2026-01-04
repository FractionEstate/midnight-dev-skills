# Browser Wallet Integration

> **Skill**: Browser-based wallet integration for Midnight Network dApps
> **Level**: Intermediate
> **Prerequisites**: TypeScript, React, Basic Midnight concepts

## Overview

This skill covers integrating the Lace wallet and other browser-based wallets with Midnight Network dApps using the DApp Connector API.

## Source References
- https://github.com/midnightntwrk/example-bboard (bboard-ui)

---

## Key Concepts

### DApp Connector API
The browser wallet exposes a `window.midnight` object that implements the DAppConnectorAPI interface, allowing dApps to:
- Detect wallet presence
- Request wallet connection
- Access wallet state and balance
- Submit transactions

### Wallet Types
- **Lace Wallet**: The primary Midnight-compatible browser wallet
- **Service Worker Wallet**: Background wallet for continuous operation

---

## Basic Setup

### Type Definitions
```typescript
// types/midnight.d.ts
import type {
  DAppConnectorAPI,
  DAppConnectorWalletAPI
} from "@midnight-ntwrk/dapp-connector-api";

declare global {
  interface Window {
    midnight?: DAppConnectorAPI;
  }
}

export type WalletAPI = DAppConnectorWalletAPI;
```

### Wallet Detection Hook
```typescript
// hooks/useWalletDetection.ts
import { useState, useEffect } from "react";

export function useWalletDetection() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkWallet = () => {
      const hasWallet = typeof window !== "undefined" && !!window.midnight;
      setIsInstalled(hasWallet);
      setIsChecking(false);
    };

    // Check immediately
    checkWallet();

    // Also check after a delay (wallet may inject later)
    const timer = setTimeout(checkWallet, 1000);
    return () => clearTimeout(timer);
  }, []);

  return { isInstalled, isChecking };
}
```

---

## Wallet Connection

### Connection Flow
```typescript
// lib/wallet/connection.ts
import type { DAppConnectorAPI, DAppConnectorWalletAPI } from "@midnight-ntwrk/dapp-connector-api";

export interface WalletConnectionResult {
  success: boolean;
  walletApi?: DAppConnectorWalletAPI;
  error?: string;
}

export async function connectWallet(): Promise<WalletConnectionResult> {
  const connector = window.midnight;

  if (!connector) {
    return {
      success: false,
      error: "Midnight wallet not installed"
    };
  }

  try {
    // Check current state
    const state = await connector.state();

    if (state.enabledWalletApiVersion === null) {
      // Request wallet connection
      await connector.enable();
    }

    // Get wallet API
    const walletApi = await connector.walletAPI();

    return {
      success: true,
      walletApi
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Connection failed"
    };
  }
}
```

### React Hook for Wallet Connection
```typescript
// hooks/useMidnightWallet.ts
"use client";

import { useState, useCallback, useEffect } from "react";
import type { DAppConnectorWalletAPI } from "@midnight-ntwrk/dapp-connector-api";

interface WalletState {
  isConnected: boolean;
  isConnecting: boolean;
  address: string | null;
  balance: bigint | null;
  error: string | null;
}

export function useMidnightWallet() {
  const [walletApi, setWalletApi] = useState<DAppConnectorWalletAPI | null>(null);
  const [state, setState] = useState<WalletState>({
    isConnected: false,
    isConnecting: false,
    address: null,
    balance: null,
    error: null,
  });

  const connect = useCallback(async () => {
    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      const connector = window.midnight;
      if (!connector) {
        throw new Error("Please install the Midnight wallet extension");
      }

      // Enable if not already enabled
      const connectorState = await connector.state();
      if (connectorState.enabledWalletApiVersion === null) {
        await connector.enable();
      }

      // Get wallet API
      const api = await connector.walletAPI();
      setWalletApi(api);

      // Get wallet state
      const walletState = await api.state();

      setState({
        isConnected: true,
        isConnecting: false,
        address: walletState.address,
        balance: walletState.balances?.total ?? 0n,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: error instanceof Error ? error.message : "Connection failed",
      }));
    }
  }, []);

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

  return {
    ...state,
    walletApi,
    connect,
    disconnect,
  };
}
```

---

## Browser Deployed Contract Manager

Pattern from bboard-ui for managing contract deployment in browser:

### Contract Manager Class
```typescript
// lib/contract/browser-contract-manager.ts
import type { DAppConnectorWalletAPI } from "@midnight-ntwrk/dapp-connector-api";
import {
  type MidnightProviders
} from "@midnight-ntwrk/midnight-js-types";
import {
  deployContract,
  findDeployedContract
} from "@midnight-ntwrk/midnight-js-contracts";
import {
  indexerPublicDataProvider
} from "@midnight-ntwrk/midnight-js-indexer-public-data-provider";
import {
  fetchZkConfigProvider
} from "@midnight-ntwrk/midnight-js-fetch-zk-config-provider";

export interface BrowserContractConfig {
  indexer: string;
  indexerWS: string;
  zkConfigUrl: string;
}

export class BrowserContractManager<PrivateState> {
  private providers: MidnightProviders<"deploy", PrivateState>;
  private walletApi: DAppConnectorWalletAPI;

  constructor(
    walletApi: DAppConnectorWalletAPI,
    config: BrowserContractConfig,
    privateStateProvider: PrivateStateProvider<PrivateState>
  ) {
    this.walletApi = walletApi;

    this.providers = {
      walletProvider: {
        coinPublicKey: walletApi.state().coinPublicKey,
        balanceTx: (tx, newCoins) => walletApi.balanceTx(tx, newCoins),
        proveTransaction: (tx) => walletApi.proveTransaction(tx),
      },
      publicDataProvider: indexerPublicDataProvider(
        config.indexer,
        config.indexerWS
      ),
      zkConfigProvider: fetchZkConfigProvider(
        window,
        config.zkConfigUrl
      ),
      privateStateProvider,
    };
  }

  async deploy(
    contractFactory: ContractFactory,
    initialPrivateState: PrivateState
  ): Promise<DeployedContract> {
    return deployContract(this.providers, {
      contract: contractFactory,
      initialPrivateState,
    });
  }

  async findExisting(
    contractFactory: ContractFactory,
    contractAddress: string,
    privateState: PrivateState
  ): Promise<DeployedContract | null> {
    return findDeployedContract(this.providers, {
      contract: contractFactory,
      contractAddress,
      privateState,
    });
  }
}
```

---

## React Components

### Wallet Connect Button
```tsx
// components/WalletConnectButton.tsx
"use client";

import { useMidnightWallet } from "@/hooks/useMidnightWallet";

export function WalletConnectButton() {
  const { isConnected, isConnecting, address, connect, disconnect, error } =
    useMidnightWallet();

  if (error) {
    return (
      <div className="text-red-500">
        <p>{error}</p>
        <button
          onClick={connect}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-4">
        <span className="font-mono text-sm">
          {address.slice(0, 8)}...{address.slice(-6)}
        </span>
        <button
          onClick={disconnect}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connect}
      disabled={isConnecting}
      className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
    >
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </button>
  );
}
```

### Wallet Provider Context
```tsx
// contexts/WalletContext.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode
} from "react";
import type { DAppConnectorWalletAPI } from "@midnight-ntwrk/dapp-connector-api";

interface WalletContextType {
  walletApi: DAppConnectorWalletAPI | null;
  isConnected: boolean;
  address: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [walletApi, setWalletApi] = useState<DAppConnectorWalletAPI | null>(null);
  const [address, setAddress] = useState<string | null>(null);

  const connect = useCallback(async () => {
    const connector = window.midnight;
    if (!connector) {
      throw new Error("Wallet not installed");
    }

    const state = await connector.state();
    if (state.enabledWalletApiVersion === null) {
      await connector.enable();
    }

    const api = await connector.walletAPI();
    const walletState = await api.state();

    setWalletApi(api);
    setAddress(walletState.address);
  }, []);

  const disconnect = useCallback(() => {
    setWalletApi(null);
    setAddress(null);
  }, []);

  return (
    <WalletContext.Provider
      value={{
        walletApi,
        isConnected: !!walletApi,
        address,
        connect,
        disconnect,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within WalletProvider");
  }
  return context;
}
```

---

## ZK Config Provider for Browser

```typescript
// lib/providers/browser-zk-config.ts
import { fetchZkConfigProvider } from "@midnight-ntwrk/midnight-js-fetch-zk-config-provider";

/**
 * Create a ZK config provider that fetches from a URL.
 * For browser apps, the compiled contract artifacts should be
 * served from a static URL.
 */
export function createBrowserZkConfigProvider(baseUrl: string) {
  return fetchZkConfigProvider(window, baseUrl);
}

// Usage in Next.js:
// 1. Place compiled contracts in /public/contracts/
// 2. Use: createBrowserZkConfigProvider('/contracts/')
```

---

## Private State in Browser

Using IndexedDB for browser-based private state:

```typescript
// lib/providers/browser-private-state.ts
import { openDB, type IDBPDatabase } from "idb";

export interface BrowserPrivateStateProvider<T> {
  get(contractAddress: string): Promise<T | null>;
  set(contractAddress: string, state: T): Promise<void>;
  delete(contractAddress: string): Promise<void>;
}

export async function createBrowserPrivateStateProvider<T>(
  dbName: string = "midnight-private-state"
): Promise<BrowserPrivateStateProvider<T>> {
  const db = await openDB(dbName, 1, {
    upgrade(db) {
      db.createObjectStore("states", { keyPath: "contractAddress" });
    },
  });

  return {
    async get(contractAddress: string) {
      const record = await db.get("states", contractAddress);
      return record?.state ?? null;
    },

    async set(contractAddress: string, state: T) {
      await db.put("states", { contractAddress, state });
    },

    async delete(contractAddress: string) {
      await db.delete("states", contractAddress);
    },
  };
}
```

---

## Error Handling

```typescript
// lib/wallet/errors.ts

export class WalletNotInstalledError extends Error {
  constructor() {
    super("Midnight wallet is not installed. Please install the Lace wallet extension.");
    this.name = "WalletNotInstalledError";
  }
}

export class WalletConnectionError extends Error {
  constructor(message: string) {
    super(`Failed to connect wallet: ${message}`);
    this.name = "WalletConnectionError";
  }
}

export class TransactionError extends Error {
  constructor(message: string, public txHash?: string) {
    super(`Transaction failed: ${message}`);
    this.name = "TransactionError";
  }
}

export function handleWalletError(error: unknown): never {
  if (error instanceof Error) {
    if (error.message.includes("User rejected")) {
      throw new WalletConnectionError("User rejected the connection request");
    }
    if (error.message.includes("Not installed")) {
      throw new WalletNotInstalledError();
    }
    throw new WalletConnectionError(error.message);
  }
  throw new WalletConnectionError("Unknown error occurred");
}
```

---

## Best Practices

### Do's ✅
- Always check `window.midnight` before operations
- Use React context for wallet state management
- Store private state in IndexedDB for persistence
- Handle wallet rejection gracefully
- Show loading states during async operations

### Don'ts ❌
- Never store secrets in localStorage
- Don't assume wallet is always available
- Avoid blocking UI during proof generation
- Don't expose wallet API outside secure contexts

---

## Related Skills
- [Wallet SDK Integration](../wallet-sdk-integration/SKILL.md) - Server-side wallet patterns
- [State Management](../state-management/SKILL.md) - Contract state handling
- [Transaction Patterns](../transaction-patterns/SKILL.md) - Building transactions
