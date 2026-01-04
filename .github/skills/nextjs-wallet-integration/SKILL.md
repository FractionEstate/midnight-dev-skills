---
name: nextjs-wallet-integration
description: Guide for integrating Lace wallet into Next.js 16.1.1 applications for Midnight Network DApps. Use when users need wallet connection components, DApp Connector API setup, wallet state management, or React context providers for wallet functionality. Triggers on wallet integration, Lace connection, DApp authentication, or browser wallet requests.
---

# Next.js Wallet Integration for Midnight

Integrate Lace wallet into Next.js 16.1.1 applications using the DApp Connector API.

## Quick Start

```bash
npm install @midnight-ntwrk/dapp-connector-api
```

## Basic Wallet Connect Button

```typescript
// src/app/components/ConnectWalletButton.tsx
"use client";

import "@midnight-ntwrk/dapp-connector-api";
import { useState } from "react";

export default function ConnectWalletButton() {
  const [connected, setConnected] = useState(false);

  const handleClick = async () => {
    try {
      const api = await window.midnight.mnLace.enable();
      if (api) {
        setConnected(true);
        console.log("Wallet connected");
      }
    } catch (error) {
      console.error("Failed to connect:", error);
    }
  };

  return (
    <button onClick={handleClick}>
      {connected ? "Connected" : "Connect Wallet"}
    </button>
  );
}
```

## Key Requirements

| Requirement | Why |
|-------------|-----|
| `"use client"` directive | Browser APIs only work client-side |
| Chrome browser | Lace only supports Chrome |
| Lace extension installed | Provides `window.midnight` |

## Connection Flow

```
User clicks → Lace modal → User authorizes → Connected
```

## Advanced: Wallet Context Provider

```typescript
// src/context/WalletContext.tsx
"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import "@midnight-ntwrk/dapp-connector-api";

interface WalletState {
  connected: boolean;
  address: string | null;
  api: any | null;
}

interface WalletContextType extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalletState>({
    connected: false,
    address: null,
    api: null,
  });

  const connect = async () => {
    try {
      const api = await window.midnight.mnLace.enable();
      if (api) {
        const addresses = await api.getUsedAddresses();
        setState({
          connected: true,
          address: addresses[0] || null,
          api,
        });
      }
    } catch (error) {
      console.error("Connection failed:", error);
    }
  };

  const disconnect = () => {
    setState({ connected: false, address: null, api: null });
  };

  return (
    <WalletContext.Provider value={{ ...state, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) throw new Error("useWallet must be used within WalletProvider");
  return context;
}
```

## Using the Context

```typescript
// src/app/layout.tsx
import { WalletProvider } from "@/context/WalletContext";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <WalletProvider>{children}</WalletProvider>
      </body>
    </html>
  );
}

// src/app/components/WalletButton.tsx
"use client";
import { useWallet } from "@/context/WalletContext";

export default function WalletButton() {
  const { connected, address, connect, disconnect } = useWallet();

  if (connected) {
    return (
      <div>
        <span>{address?.slice(0, 8)}...</span>
        <button onClick={disconnect}>Disconnect</button>
      </div>
    );
  }

  return <button onClick={connect}>Connect Wallet</button>;
}
```

## TypeScript Declarations

```typescript
// src/types/midnight.d.ts
declare global {
  interface Window {
    midnight?: {
      mnLace?: {
        enable: () => Promise<any>;
        isEnabled: () => Promise<boolean>;
      };
    };
  }
}
export {};
```

## Check Wallet Availability

```typescript
const connectWallet = async () => {
  if (typeof window === 'undefined') {
    console.log("Not in browser");
    return;
  }

  if (!window.midnight?.mnLace) {
    alert("Please install Lace Midnight Preview wallet");
    window.open("https://chromewebstore.google.com/detail/lace-beta/hgeekaiplokcnmakghbdfbgnlfheichg");
    return;
  }

  const api = await window.midnight.mnLace.enable();
};
```

## Common Errors

| Error | Solution |
|-------|----------|
| `window.midnight undefined` | Install Lace wallet |
| `enable() rejected` | User denied access |
| `useState in server component` | Add `"use client"` |

## API Methods

```typescript
const api = await window.midnight.mnLace.enable();

// Get addresses
const addresses = await api.getUsedAddresses();

// Get balance
const balance = await api.getBalance();

// Sign transaction
const signedTx = await api.signTx(tx);
```

## Resources

- DApp Connector API: https://docs.midnight.network/develop/reference/midnight-api/dapp-connector/
- Next.js Client Components: https://nextjs.org/docs/app/building-your-application/rendering/client-components
