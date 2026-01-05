# Next.js Setup for Midnight dApps

Configure Next.js for Midnight Network dApp development.

## Project Setup

```bash
# Create Next.js app
npx create-next-app@latest my-midnight-dapp --typescript --tailwind --app

# Install Midnight packages
cd my-midnight-dapp
npm install @midnight-ntwrk/dapp-connector-api \
  @midnight-ntwrk/midnight-js-contracts \
  @midnight-ntwrk/midnight-js-types \
  @midnight-ntwrk/midnight-js-network-id
```

## Project Structure

```text
my-midnight-dapp/
├── app/
│   ├── layout.tsx           # Root layout with providers
│   ├── page.tsx             # Home (Server Component)
│   └── dashboard/
│       └── page.tsx         # Wallet interactions (Client)
├── contracts/
│   ├── my-contract.compact  # Compact source
│   └── managed/             # Compiled (gitignore)
├── lib/
│   └── midnight/
│       ├── client.ts        # Midnight client setup
│       ├── providers.ts     # Provider configuration
│       └── wallet.ts        # Wallet utilities
├── hooks/
│   ├── useMidnightWallet.ts
│   └── useContract.ts
├── components/
│   ├── WalletButton.tsx
│   └── ContractPanel.tsx
└── types/
    └── midnight.d.ts
```

## TypeScript Configuration

```typescript
// types/midnight.d.ts
import type { DAppConnectorAPI } from '@midnight-ntwrk/dapp-connector-api';

declare global {
  interface Window {
    midnight?: DAppConnectorAPI;
  }
}

export {};
```

## Next.js Configuration

```typescript
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  webpack: (config) => {
    // Handle Node.js modules in browser
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
  // Serve contract artifacts
  async headers() {
    return [
      {
        source: '/contracts/:path*',
        headers: [{ key: 'Access-Control-Allow-Origin', value: '*' }],
      },
    ];
  },
};

export default nextConfig;
```

## Wallet Context Provider

```typescript
// lib/midnight/WalletProvider.tsx
"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import type { DAppConnectorWalletAPI } from "@midnight-ntwrk/dapp-connector-api";

interface WalletContextType {
  isConnected: boolean;
  isConnecting: boolean;
  walletApi: DAppConnectorWalletAPI | null;
  connect: () => Promise<boolean>;
  disconnect: () => void;
  error: string | null;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [walletApi, setWalletApi] = useState<DAppConnectorWalletAPI | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const connector = window.midnight;
      if (!connector) {
        throw new Error("Wallet not installed");
      }

      const state = await connector.state();
      if (state.enabledWalletApiVersion === null) {
        await connector.enable();
      }

      const api = await connector.walletAPI();
      setWalletApi(api);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection failed");
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setWalletApi(null);
  }, []);

  return (
    <WalletContext.Provider value={{
      isConnected: !!walletApi,
      isConnecting,
      walletApi,
      connect,
      disconnect,
      error
    }}>
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

## Root Layout

```typescript
// app/layout.tsx
import { WalletProvider } from "@/lib/midnight/WalletProvider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <WalletProvider>
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}
```

## Wallet Button Component

```typescript
// components/WalletButton.tsx
"use client";

import { useWallet } from "@/lib/midnight/WalletProvider";

export function WalletButton() {
  const { isConnected, isConnecting, connect, disconnect, error } = useWallet();

  if (isConnecting) {
    return <button disabled>Connecting...</button>;
  }

  if (isConnected) {
    return (
      <button onClick={disconnect}>
        Disconnect Wallet
      </button>
    );
  }

  return (
    <div>
      <button onClick={connect}>
        Connect Wallet
      </button>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
```

## Contract Hook

```typescript
// hooks/useContract.ts
'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/lib/midnight/WalletProvider';
import { setupProviders, connectContract } from '@/lib/midnight/client';

export function useContract(contractAddress: string | null) {
  const { walletApi } = useWallet();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!walletApi || !contractAddress) {
      setContract(null);
      return;
    }

    let mounted = true;

    async function load() {
      setLoading(true);
      try {
        const providers = await setupProviders(walletApi);
        const instance = await connectContract(contractAddress, providers);
        if (mounted) setContract(instance);
      } catch (err) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [walletApi, contractAddress]);

  return { contract, loading, error };
}
```

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_NETWORK=testnet
NEXT_PUBLIC_INDEXER_URL=https://indexer.testnet-02.midnight.network/api/v1/graphql
NEXT_PUBLIC_PROOF_SERVER_URL=http://localhost:6300
```

## Best Practices

1. **Client Components** - Use `"use client"` for wallet interactions
2. **Server Components** - Keep static content as Server Components
3. **Context Providers** - Use context for shared wallet state
4. **Error Boundaries** - Wrap wallet components in error boundaries
5. **Loading States** - Show loading during async operations
6. **Environment Variables** - Use `NEXT_PUBLIC_` prefix for client-side
