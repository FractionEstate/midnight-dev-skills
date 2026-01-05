# Contract Deployment

Deploy and connect to Midnight smart contracts.

## Deployment Overview

```text
┌─────────────────┐     ┌──────────────┐     ┌─────────────┐
│ Compile Contract│ ──▶ │ Setup Config │ ──▶ │   Deploy    │
│  (compact CLI)  │     │  (providers) │     │ (submitTx)  │
└─────────────────┘     └──────────────┘     └─────────────┘
```

## Contract Compilation

```bash
# Compile Compact contract
compact compile contracts/my-contract.compact contracts/managed/my-contract

# Output structure
contracts/managed/my-contract/
├── contract/          # JSON artifacts
│   └── contract.json  # ABI and bytecode
├── keys/              # ZK proving/verifying keys
│   ├── circuit-name.pk
│   └── circuit-name.vk
└── zkir/              # ZK Intermediate Representation
```

## Contract Instance Type

```typescript
import type { Contract, ContractInstance } from '@midnight-ntwrk/midnight-js-contracts';

// Generated contract type
import { MyContract } from './managed/my-contract/contract';

type MyContractInstance = ContractInstance<typeof MyContract>;
```

## Deploy New Contract

```typescript
import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';

async function deploy(providers: Providers): Promise<ContractAddress> {
  // Initial private state (if any)
  const privateState = {
    // Contract-specific private state
  };

  // Deploy
  const { contractAddress, finalizedDeployTx } = await deployContract({
    contract: MyContract,
    privateState,
    ...providers,
  });

  // Wait for confirmation
  await finalizedDeployTx;

  console.log('Deployed at:', contractAddress);
  return contractAddress;
}
```

## Connect to Existing Contract

```typescript
import { findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';

async function connect(
  contractAddress: ContractAddress,
  providers: Providers
): Promise<MyContractInstance> {
  // Find and connect
  const { contract } = await findDeployedContract({
    contractAddress,
    contract: MyContract,
    ...providers,
  });

  return contract;
}
```

## Call Circuit Functions

```typescript
async function callCircuit(contract: MyContractInstance) {
  // Call a circuit (generates proof and submits tx)
  const { txId, finalizedTx } = await contract.callTx.setMessage({
    input: 'Hello, Midnight!',
  });

  // Wait for finalization
  await finalizedTx;

  console.log('Transaction:', txId);
}
```

## Read Ledger State

```typescript
async function readState(contract: MyContractInstance) {
  // Get current ledger state
  const state = contract.state.ledger;

  // Access public state
  const message = state.message;
  const counter = state.counter;

  return { message, counter };
}
```

## Watch State Changes

```typescript
function watchContract(contract: MyContractInstance) {
  // Subscribe to state updates
  const subscription = contract.state$.subscribe({
    next: (state) => {
      console.log('State updated:', state.ledger);
    },
    error: (err) => {
      console.error('Watch error:', err);
    },
  });

  // Cleanup
  return () => subscription.unsubscribe();
}
```

## Full Deployment Example

```typescript
import { setNetworkId, NetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { deployContract, findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { MyContract } from './managed/my-contract/contract';

export class MyContractManager {
  private contract: ContractInstance<typeof MyContract> | null = null;

  constructor(private providers: Providers) {
    setNetworkId(NetworkId.TestNet);
  }

  async deploy(): Promise<string> {
    const { contractAddress, finalizedDeployTx } = await deployContract({
      contract: MyContract,
      privateState: {},
      ...this.providers,
    });

    await finalizedDeployTx;

    this.contract = await this.connect(contractAddress);
    return contractAddress;
  }

  async connect(address: string): Promise<ContractInstance<typeof MyContract>> {
    const { contract } = await findDeployedContract({
      contractAddress: address as ContractAddress,
      contract: MyContract,
      ...this.providers,
    });

    this.contract = contract;
    return contract;
  }

  async setMessage(message: string): Promise<void> {
    if (!this.contract) throw new Error('Not connected');

    const { finalizedTx } = await this.contract.callTx.setMessage({
      input: message,
    });

    await finalizedTx;
  }

  getState() {
    if (!this.contract) throw new Error('Not connected');
    return this.contract.state.ledger;
  }
}
```

## Error Handling

```typescript
async function safeDeployment(providers: Providers) {
  try {
    const address = await deploy(providers);
    return { success: true, address };
  } catch (error) {
    if (error.message.includes('insufficient funds')) {
      return { success: false, error: 'Need more tDUST' };
    }
    if (error.message.includes('proof server')) {
      return { success: false, error: 'Proof server not running' };
    }
    if (error.message.includes('timeout')) {
      return { success: false, error: 'Proof generation timed out' };
    }
    throw error;
  }
}
```

## Best Practices

1. **Wait for finalization** - Don't proceed until tx is confirmed
2. **Handle errors** - Proof generation can fail or timeout
3. **Cache contract address** - Store deployed address for reconnection
4. **Use typed contracts** - Generated types provide safety
5. **Clean up subscriptions** - Unsubscribe when component unmounts
