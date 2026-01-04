# Contract Simulator Testing Patterns

Official testing patterns from Midnight Network example repositories for testing Compact contracts without deploying to the network.

## Source Repositories
- https://github.com/midnightntwrk/example-counter
- https://github.com/midnightntwrk/example-bboard

---

## Counter Simulator

A simple contract simulator for testing counter functionality.

### Implementation
```typescript
// contract/src/test/counter-simulator.ts
import {
  type CircuitContext,
  QueryContext,
  sampleContractAddress,
  constructorContext
} from "@midnight-ntwrk/compact-runtime";
import {
  Contract,
  type Ledger,
  ledger
} from "../managed/counter/contract/index.cjs";
import { type CounterPrivateState, witnesses } from "../witnesses.js";

/**
 * Serves as a testbed to exercise the contract in tests.
 * This pattern can be used to test more complex contracts.
 */
export class CounterSimulator {
  readonly contract: Contract<CounterPrivateState>;
  circuitContext: CircuitContext<CounterPrivateState>;

  constructor() {
    this.contract = new Contract<CounterPrivateState>(witnesses);

    const {
      currentPrivateState,
      currentContractState,
      currentZswapLocalState
    } = this.contract.initialState(
      constructorContext({ privateCounter: 0 }, "0".repeat(64))
    );

    this.circuitContext = {
      currentPrivateState,
      currentZswapLocalState,
      originalState: currentContractState,
      transactionContext: new QueryContext(
        currentContractState.data,
        sampleContractAddress()
      )
    };
  }

  public getLedger(): Ledger {
    return ledger(this.circuitContext.transactionContext.state);
  }

  public getPrivateState(): CounterPrivateState {
    return this.circuitContext.currentPrivateState;
  }

  public increment(): Ledger {
    // Update the current context to be the result of executing the circuit
    this.circuitContext = this.contract.impureCircuits.increment(
      this.circuitContext
    ).context;
    return ledger(this.circuitContext.transactionContext.state);
  }
}
```

### Test File
```typescript
// contract/src/test/counter.test.ts
import { CounterSimulator } from "./counter-simulator.js";
import { NetworkId, setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { describe, it, expect } from "vitest";

setNetworkId(NetworkId.Undeployed);

describe("Counter smart contract", () => {
  it("generates initial ledger state deterministically", () => {
    const simulator0 = new CounterSimulator();
    const simulator1 = new CounterSimulator();
    expect(simulator0.getLedger()).toEqual(simulator1.getLedger());
  });

  it("properly initializes ledger state and private state", () => {
    const simulator = new CounterSimulator();
    const initialLedgerState = simulator.getLedger();
    expect(initialLedgerState.round).toEqual(0n);
    const initialPrivateState = simulator.getPrivateState();
    expect(initialPrivateState).toEqual({ privateCounter: 0 });
  });

  it("increments the counter correctly", () => {
    const simulator = new CounterSimulator();
    const nextLedgerState = simulator.increment();
    expect(nextLedgerState.round).toEqual(1n);
    const nextPrivateState = simulator.getPrivateState();
    expect(nextPrivateState).toEqual({ privateCounter: 0 });
  });
});
```

---

## BBoard Simulator (Multi-User Pattern)

A more advanced simulator supporting multiple users with secret keys.

### Implementation
```typescript
// contract/src/test/bboard-simulator.ts
import {
  type CircuitContext,
  QueryContext,
  sampleContractAddress,
  constructorContext,
  convert_bigint_to_Uint8Array
} from "@midnight-ntwrk/compact-runtime";
import {
  Contract,
  type Ledger,
  ledger
} from "../managed/bboard/contract/index.cjs";
import { type BBoardPrivateState, witnesses } from "../witnesses.js";

/**
 * Serves as a testbed to exercise the contract in tests.
 */
export class BBoardSimulator {
  readonly contract: Contract<BBoardPrivateState>;
  circuitContext: CircuitContext<BBoardPrivateState>;

  constructor(secretKey: Uint8Array) {
    this.contract = new Contract<BBoardPrivateState>(witnesses);

    const {
      currentPrivateState,
      currentContractState,
      currentZswapLocalState
    } = this.contract.initialState(
      constructorContext({ secretKey }, "0".repeat(64))
    );

    this.circuitContext = {
      currentPrivateState,
      currentZswapLocalState,
      originalState: currentContractState,
      transactionContext: new QueryContext(
        currentContractState.data,
        sampleContractAddress()
      )
    };
  }

  /**
   * Switch to a different secret key for a different user.
   * Useful for testing multi-user dApps.
   */
  public switchUser(secretKey: Uint8Array) {
    this.circuitContext.currentPrivateState = {
      secretKey,
    };
  }

  public getLedger(): Ledger {
    return ledger(this.circuitContext.transactionContext.state);
  }

  public getPrivateState(): BBoardPrivateState {
    return this.circuitContext.currentPrivateState;
  }

  public post(message: string): Ledger {
    this.circuitContext = this.contract.impureCircuits.post(
      this.circuitContext,
      message
    ).context;
    return ledger(this.circuitContext.transactionContext.state);
  }

  public takeDown(): Ledger {
    this.circuitContext = this.contract.impureCircuits.takeDown(
      this.circuitContext
    ).context;
    return ledger(this.circuitContext.transactionContext.state);
  }

  public publicKey(): Uint8Array {
    const sequence = convert_bigint_to_Uint8Array(
      32,
      this.getLedger().sequence
    );
    return this.contract.circuits.publicKey(
      this.circuitContext,
      this.getPrivateState().secretKey,
      sequence
    ).result;
  }
}
```

### Test File
```typescript
// contract/src/test/bboard.test.ts
import { BBoardSimulator } from "./bboard-simulator.js";
import { State } from "../managed/bboard/contract/index.cjs";
import { NetworkId, setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { randomBytes } from "crypto";
import { describe, it, expect } from "vitest";

setNetworkId(NetworkId.Undeployed);

describe("BBoard smart contract", () => {
  it("generates initial ledger state deterministically", () => {
    const key = randomBytes(32);
    const simulator0 = new BBoardSimulator(key);
    const simulator1 = new BBoardSimulator(key);
    expect(simulator0.getLedger()).toEqual(simulator1.getLedger());
  });

  it("properly initializes ledger state and private state", () => {
    const key = randomBytes(32);
    const simulator = new BBoardSimulator(key);
    const initialLedgerState = simulator.getLedger();
    expect(initialLedgerState.sequence).toEqual(1n);
    expect(initialLedgerState.message.is_some).toEqual(false);
    expect(initialLedgerState.message.value).toEqual("");
    expect(initialLedgerState.owner).toEqual(new Uint8Array(32));
    expect(initialLedgerState.state).toEqual(State.VACANT);
    const initialPrivateState = simulator.getPrivateState();
    expect(initialPrivateState).toEqual({ secretKey: key });
  });

  it("lets you post a message, then take it down", () => {
    const simulator = new BBoardSimulator(randomBytes(32));
    const initialPrivateState = simulator.getPrivateState();
    const initialPublicKey = simulator.publicKey();

    const message = "Hello, Midnight!";
    simulator.post(message);
    simulator.takeDown();

    // Private state shouldn't change
    expect(initialPrivateState).toEqual(simulator.getPrivateState());

    // Verify ledger state updates
    const ledgerState = simulator.getLedger();
    expect(ledgerState.sequence).toEqual(2n);
    expect(ledgerState.message.is_some).toEqual(false);
    expect(ledgerState.state).toEqual(State.VACANT);
  });

  it("lets you post another message after taking down the first", () => {
    const simulator = new BBoardSimulator(randomBytes(32));
    simulator.post("First message");
    simulator.takeDown();
    simulator.post("Second message");

    const ledgerState = simulator.getLedger();
    expect(ledgerState.message.is_some).toEqual(true);
    expect(ledgerState.message.value).toEqual("Second message");
    expect(ledgerState.state).toEqual(State.OCCUPIED);
  });

  it("prevents non-owner from taking down message", () => {
    const user1Key = randomBytes(32);
    const user2Key = randomBytes(32);

    const simulator = new BBoardSimulator(user1Key);
    simulator.post("User 1's message");

    // Switch to user 2
    simulator.switchUser(user2Key);

    // User 2 should not be able to take down user 1's message
    expect(() => simulator.takeDown()).toThrow();
  });
});
```

---

## Vitest Configuration

### vitest.config.ts
```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  mode: "node",
  test: {
    deps: {
      interopDefault: true
    },
    globals: true,
    environment: "node",
    include: ["**/*.test.ts"],
    exclude: ["node_modules"],
    root: ".",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      thresholds: {
        branches: 50,
        functions: 73,
        lines: 72,
        statements: -269,
      },
    },
    reporters: ["default", ["junit", { outputFile: "reports/report.xml" }]],
  },
  resolve: {
    extensions: [".ts", ".js"],
    conditions: ["import", "node", "default"],
  },
});
```

### vitest.setup.ts
```typescript
import protobuf from "protobufjs";
import Long from "long";

protobuf.util.Long = Long;
protobuf.configure();
```

---

## Witnesses File Pattern

### Simple Witnesses (Counter)
```typescript
// contract/src/witnesses.ts

// Empty private state type for simple contracts
export type CounterPrivateState = {
  privateCounter: number;
};

// Empty witnesses object (no witness functions needed)
export const witnesses = {};
```

### Witnesses with Secret Key (BBoard)
```typescript
// contract/src/witnesses.ts
import { Ledger } from "./managed/bboard/contract/index.cjs";
import { WitnessContext } from "@midnight-ntwrk/compact-runtime";

/**
 * The private state for the bulletin board.
 * Contains the user's secret key.
 */
export type BBoardPrivateState = {
  readonly secretKey: Uint8Array;
};

export const createBBoardPrivateState = (secretKey: Uint8Array) => ({
  secretKey,
});

/**
 * Witness functions for the bulletin board contract.
 *
 * Each function takes a WitnessContext as first argument and returns
 * a tuple of [newPrivateState, returnValue].
 */
export const witnesses = {
  localSecretKey: ({
    privateState,
  }: WitnessContext<Ledger, BBoardPrivateState>): [
    BBoardPrivateState,
    Uint8Array
  ] => [privateState, privateState.secretKey],
};
```

---

## Integration Testing Pattern

For testing with real network (testcontainers):

```typescript
// counter-cli/src/test/counter.api.test.ts
import { type Resource } from "@midnight-ntwrk/wallet";
import { type Wallet } from "@midnight-ntwrk/wallet-api";
import { TestEnvironment } from "./commons";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as api from "../api";

describe("API", () => {
  let testEnvironment: TestEnvironment;
  let wallet: Wallet & Resource;
  let providers: CounterProviders;

  beforeAll(async () => {
    testEnvironment = new TestEnvironment(logger);
    const testConfiguration = await testEnvironment.start();
    wallet = await testEnvironment.getWallet();
    providers = await api.configureProviders(wallet, testConfiguration.dappConfig);
  }, 1000 * 60 * 45); // 45 minute timeout

  afterAll(async () => {
    await testEnvironment.saveWalletCache();
    await testEnvironment.shutdown();
  });

  it("should deploy the contract and increment the counter [@slow]", async () => {
    const counterContract = await api.deploy(providers, { privateCounter: 0 });
    expect(counterContract).not.toBeNull();

    const counter = await api.displayCounterValue(providers, counterContract);
    expect(counter.counterValue).toEqual(BigInt(0));

    await new Promise((resolve) => setTimeout(resolve, 2000));
    const response = await api.increment(counterContract);
    expect(response.txHash).toMatch(/[0-9a-f]{64}/);
    expect(response.blockHeight).toBeGreaterThan(BigInt(0));

    const counterAfter = await api.displayCounterValue(providers, counterContract);
    expect(counterAfter.counterValue).toEqual(BigInt(1));
  });
});
```

---

## Running Tests

```bash
# Run unit tests (fast, no network)
npm run test

# Run with coverage
npm run test -- --coverage

# Run specific test file
npm run test -- counter.test.ts

# Watch mode
npm run test -- --watch
```
