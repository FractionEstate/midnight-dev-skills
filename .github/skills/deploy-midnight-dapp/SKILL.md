---
name: deploy-midnight-dapp
description: Guide for deploying Compact smart contracts to Midnight Testnet and connecting Next.js frontends. Use when users need to deploy contracts, configure deployment scripts, set up environment variables, create contract instances, or handle ZK proof transactions. Triggers on deployment, testnet, contract addresses, or transaction handling.
---

# Deploy Midnight DApp to Testnet

Deploy Compact smart contracts to Midnight Testnet and connect your Next.js frontend.

## Prerequisites

- Compiled contract in `contracts/managed/`
- Lace wallet with tDUST tokens
- Proof server running
- Node.js 22.x

## Quick Start

```bash
# Install SDK
npm install @midnight-ntwrk/midnight-js-contracts @midnight-ntwrk/midnight-js-types

# Deploy
npm run deploy

# Update .env.local with contract address
```

## Step 1: Verify Contract Artifacts

```bash
compact compile contracts/my-contract.compact contracts/managed/my-contract

ls contracts/managed/my-contract/
# contract/  keys/  zkir/
```

## Step 2: Install Midnight SDK

```bash
npm install @midnight-ntwrk/midnight-js-contracts
npm install @midnight-ntwrk/midnight-js-types
npm install @midnight-ntwrk/midnight-js-utils
```

## Step 3: Create Deployment Script

```typescript
// scripts/deploy.ts
import { deployContract } from "@midnight-ntwrk/midnight-js-contracts";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

async function main() {
  console.log("Starting deployment...");

  const contractPath = join(__dirname, "../contracts/managed/my-contract/contract/contract.json");
  const contractData = JSON.parse(readFileSync(contractPath, "utf-8"));

  const deployment = await deployContract({
    contract: contractData,
    network: "testnet",
    proofServerUrl: "http://localhost:6300",
  });

  console.log("Contract Address:", deployment.contractAddress);

  writeFileSync(
    join(__dirname, "../deployment.json"),
    JSON.stringify({
      contractAddress: deployment.contractAddress,
      txHash: deployment.txHash,
      network: "testnet",
      deployedAt: new Date().toISOString(),
    }, null, 2)
  );
}

main();
```

## Step 4: Configure Environment

```bash
# .env.local
NEXT_PUBLIC_MIDNIGHT_NETWORK=testnet
NEXT_PUBLIC_PROOF_SERVER_URL=http://localhost:6300
NEXT_PUBLIC_CONTRACT_ADDRESS=mn1abc123...
```

## Step 5: Deploy

```bash
# Start proof server
docker run -p 6300:6300 midnightnetwork/proof-server -- midnight-proof-server --network testnet

# Deploy
npm run deploy

# Approve in Lace wallet
```

## Step 6: Create Contract Instance

```typescript
// src/lib/contract.ts
"use client";

import { createContractInstance } from "@midnight-ntwrk/midnight-js-contracts";
import contractArtifact from "@/contracts/managed/my-contract/contract/contract.json";

export async function getContract(walletApi: any) {
  return createContractInstance({
    contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!,
    artifact: contractArtifact,
    wallet: walletApi,
    proofServerUrl: process.env.NEXT_PUBLIC_PROOF_SERVER_URL!,
  });
}
```

## Step 7: Call Contract Circuits

```typescript
// src/app/components/ContractInteraction.tsx
"use client";

import { useState } from "react";
import { useWallet } from "@/context/WalletContext";
import { getContract } from "@/lib/contract";

export default function ContractInteraction() {
  const { api } = useWallet();
  const [message, setMessage] = useState("");

  const storeMessage = async () => {
    const contract = await getContract(api);

    const tx = await contract.circuits.storeMessage({
      customMessage: message,
    });

    console.log("Transaction:", tx.txHash);
  };

  const readMessage = async () => {
    const contract = await getContract(api);
    const state = await contract.state.message();
    console.log("Current message:", state);
  };

  return (
    <div>
      <input value={message} onChange={(e) => setMessage(e.target.value)} />
      <button onClick={storeMessage}>Store Message</button>
      <button onClick={readMessage}>Read Message</button>
    </div>
  );
}
```

## Transaction Flow

```
Call circuit → Generate ZK proof → Sign with wallet → Submit to network → Confirm
```

## Common Issues

| Issue | Solution |
|-------|----------|
| Insufficient funds | Get tDUST from faucet |
| Proof generation timeout | Increase timeout, check Docker resources |
| Contract not found | Verify address in .env.local |
| Network mismatch | Ensure all components use testnet |

## Deployment Checklist

```
✓ Contract compiles without errors
✓ Artifacts in contracts/managed/
✓ Proof server running
✓ Wallet has tDUST
✓ Environment variables set
✓ deployment.json saved
✓ Frontend can read contract state
```

## Resources

- SDK Reference: https://docs.midnight.network/develop/reference/
- Testnet Faucet: https://midnight.network/test-faucet/
- Explorer: https://explorer.testnet-02.midnight.network/
