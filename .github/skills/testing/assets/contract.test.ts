// @ts-nocheck
// Midnight Contract Test Template
// Location: test/contracts/[contract].test.ts
// Unit tests for Compact contracts using the simulator

import { describe, it, expect, beforeEach } from 'vitest';
import { NetworkId, setNetworkId } from '@midnight-ntwrk/midnight-js-types';

// Contract imports (generated from compiled Compact)
// import { Contract, Ledger } from '@/contracts/my-contract';

// Example types (replace with your contract types)
interface Ledger {
  counter: bigint;
}

// Simulator wrapper class
class ContractSimulator {
  private state: Ledger;
  private context: any;

  constructor() {
    // Initialize with constructor context
    // this.context = Contract.constructorContext();
    this.context = {};
    this.state = this.getLedger();
  }

  private getLedger(): Ledger {
    // return this.context.transactionContext.state;
    return { counter: 0n };
  }

  // Expose ledger state
  get ledger(): Ledger {
    return this.state;
  }

  // Circuit wrappers
  increment(amount: bigint): void {
    // this.context = Contract.increment(this.context, amount);
    this.state = { counter: this.state.counter + amount };
  }

  decrement(amount: bigint): void {
    if (this.state.counter < amount) {
      throw new Error('Counter cannot go below zero');
    }
    this.state = { counter: this.state.counter - amount };
  }
}

describe('MyContract', () => {
  let simulator: ContractSimulator;

  beforeEach(() => {
    // Set network for testing
    setNetworkId(NetworkId.Undeployed);

    // Create fresh simulator
    simulator = new ContractSimulator();
  });

  describe('constructor', () => {
    it('should initialize with default values', () => {
      expect(simulator.ledger.counter).toBe(0n);
    });
  });

  describe('increment', () => {
    it('should increase counter', () => {
      simulator.increment(5n);
      expect(simulator.ledger.counter).toBe(5n);
    });

    it('should accumulate multiple increments', () => {
      simulator.increment(3n);
      simulator.increment(7n);
      expect(simulator.ledger.counter).toBe(10n);
    });
  });

  describe('decrement', () => {
    it('should decrease counter', () => {
      simulator.increment(10n);
      simulator.decrement(3n);
      expect(simulator.ledger.counter).toBe(7n);
    });

    it('should fail when decrementing below zero', () => {
      expect(() => simulator.decrement(1n)).toThrow('Counter cannot go below zero');
    });
  });
});
