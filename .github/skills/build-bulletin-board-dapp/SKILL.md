---
name: build-bulletin-board-dapp
description: Complete hands-on tutorial for building a privacy-preserving bulletin board DApp on Midnight Network with Next.js 16.1.1. Use when users want to build a full DApp from scratch covering smart contract, testing, frontend, and deployment. Triggers on tutorial requests, full DApp development, or end-to-end Midnight project building.
---

# Building a Bulletin Board DApp

Complete tutorial: Build a privacy-preserving bulletin board on Midnight Network with Next.js 16.1.1.

## What We're Building

A bulletin board where users can:
- Post messages (when board is vacant)
- Take down messages (only by original poster)
- View current message and status

**Privacy**: Poster identity is verified with ZK proofs but never revealed.

## Step 1: Project Setup

```bash
mkdir midnight-bulletin-board && cd midnight-bulletin-board
npm init -y

# Install dependencies
npm install next@16.1.1 react react-dom typescript
npm install @midnight-ntwrk/dapp-connector-api @midnight-ntwrk/midnight-js-contracts
npm install --save-dev vitest @types/react @types/node

# Create structure
mkdir -p contracts/managed src/app/components src/lib tests
```

## Step 2: Write the Contract

**contracts/bboard.compact**:
```compact
pragma language_version 0.17;

enum State { VACANT, OCCUPIED }

export ledger status: State;
export ledger message: Opaque<"string">;
export ledger posterCommitment: Opaque<"bytes">;

witness posterSecret: Opaque<"bytes">;

export circuit initialize(): [] {
  status = disclose(State::VACANT);
  message = disclose("");
  posterCommitment = disclose(0x0);
}

export circuit post(newMessage: Opaque<"string">): [] {
  require(status == State::VACANT);
  let commitment = hash(posterSecret);
  status = disclose(State::OCCUPIED);
  message = disclose(newMessage);
  posterCommitment = disclose(commitment);
}

export circuit takeDown(): [] {
  require(status == State::OCCUPIED);
  let callerCommitment = hash(posterSecret);
  require(callerCommitment == posterCommitment);
  status = disclose(State::VACANT);
  message = disclose("");
  posterCommitment = disclose(0x0);
}
```

## Step 3: Compile Contract

```bash
compact compile contracts/bboard.compact contracts/managed/bboard
```

## Step 4: Write Tests

**tests/bboard.test.ts**:
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { Contract } from '../contracts/managed/bboard/contract/index.cjs';

describe('Bulletin Board', () => {
  let contract: any;
  const mockSecret = Buffer.from('secret123');

  beforeEach(() => {
    contract = new Contract({ posterSecret: () => mockSecret });
  });

  it('should initialize as vacant', () => {
    const ctx = { originalState: {} };
    const result = contract.circuits.initialize(ctx);
    expect(result.newState.status).toBe('VACANT');
  });

  it('should post message when vacant', () => {
    const ctx = { originalState: { status: 'VACANT' } };
    const result = contract.circuits.post({ ...ctx, newMessage: 'Hello!' });
    expect(result.newState.status).toBe('OCCUPIED');
    expect(result.newState.message).toBe('Hello!');
  });

  it('should reject post when occupied', () => {
    const ctx = { originalState: { status: 'OCCUPIED' } };
    expect(() => contract.circuits.post({ ...ctx, newMessage: 'Test' })).toThrow();
  });
});
```

Run: `npm test`

## Step 5: Create Wallet Context

**src/app/context/WalletContext.tsx**:
```typescript
"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import "@midnight-ntwrk/dapp-connector-api";

interface WalletState {
  connected: boolean;
  api: any | null;
}

const WalletContext = createContext<any>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalletState>({ connected: false, api: null });

  const connect = async () => {
    const api = await window.midnight.mnLace.enable();
    if (api) setState({ connected: true, api });
  };

  return (
    <WalletContext.Provider value={{ ...state, connect }}>
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => useContext(WalletContext);
```

## Step 6: Create UI Components

**src/app/components/BulletinBoard.tsx**:
```typescript
"use client";
import { useState, useEffect } from "react";
import { useWallet } from "../context/WalletContext";
import { getContract } from "@/lib/contract";

export default function BulletinBoard() {
  const { api, connected } = useWallet();
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("VACANT");
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    if (connected) loadState();
  }, [connected]);

  const loadState = async () => {
    const contract = await getContract(api);
    const state = await contract.state();
    setMessage(state.message);
    setStatus(state.status);
  };

  const handlePost = async () => {
    const contract = await getContract(api);
    await contract.circuits.post({ newMessage });
    await loadState();
    setNewMessage("");
  };

  const handleTakeDown = async () => {
    const contract = await getContract(api);
    await contract.circuits.takeDown();
    await loadState();
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Bulletin Board</h1>

      <div className="p-4 border rounded mb-4">
        <p className="text-sm text-gray-500">Status: {status}</p>
        <p className="text-lg mt-2">{message || "(Empty)"}</p>
      </div>

      {status === "VACANT" ? (
        <div>
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Enter message"
            className="w-full p-2 border rounded mb-2"
          />
          <button onClick={handlePost} className="w-full bg-blue-600 text-white p-2 rounded">
            Post Message
          </button>
        </div>
      ) : (
        <button onClick={handleTakeDown} className="w-full bg-red-600 text-white p-2 rounded">
          Take Down
        </button>
      )}
    </div>
  );
}
```

## Step 7: Create Contract Helper

**src/lib/contract.ts**:
```typescript
import { createContractInstance } from "@midnight-ntwrk/midnight-js-contracts";
import contractArtifact from "@/contracts/managed/bboard/contract/contract.json";

export async function getContract(walletApi: any) {
  return createContractInstance({
    contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!,
    artifact: contractArtifact,
    wallet: walletApi,
    proofServerUrl: process.env.NEXT_PUBLIC_PROOF_SERVER_URL!,
  });
}
```

## Step 8: Create Layout

**src/app/layout.tsx**:
```typescript
import { WalletProvider } from "./context/WalletContext";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <WalletProvider>{children}</WalletProvider>
      </body>
    </html>
  );
}
```

**src/app/page.tsx**:
```typescript
import BulletinBoard from "./components/BulletinBoard";
import ConnectWallet from "./components/ConnectWallet";

export default function Home() {
  return (
    <main>
      <ConnectWallet />
      <BulletinBoard />
    </main>
  );
}
```

## Step 9: Deploy Contract

```bash
# Start proof server
docker run -p 6300:6300 midnightnetwork/proof-server -- midnight-proof-server --network testnet

# Deploy
npm run deploy
```

Update `.env.local`:
```
NEXT_PUBLIC_CONTRACT_ADDRESS=mn1...
NEXT_PUBLIC_PROOF_SERVER_URL=http://localhost:6300
```

## Step 10: Run the DApp

```bash
npm run dev
```

Open http://localhost:3000

## Complete Flow

1. User connects Lace wallet
2. User enters message and clicks "Post"
3. ZK proof generated (proves poster identity without revealing)
4. Transaction submitted to Midnight Testnet
5. Board shows message with "OCCUPIED" status
6. Only original poster can take down (verified by ZK proof)

## Resources

- Full code: See `references/complete-code.md`
- Midnight Docs: https://docs.midnight.network/
- Tutorials: https://docs.midnight.network/develop/tutorials/
