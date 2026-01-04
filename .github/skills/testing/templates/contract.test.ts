// Midnight Contract Test Template
// Location: test/contract.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  ContractSimulator,
  setNetworkId,
  NetworkId,
  sampleContractAddress,
  ledger,
} from '@midnight-ntwrk/compact-runtime';
import { MyContract } from '../dist/contract/index.cjs';

// ============================================
// Test Setup
// ============================================

describe('MyContract', () => {
  let simulator: ContractSimulator<typeof MyContract>;
  let circuitContext: ReturnType<typeof simulator.call>;

  beforeEach(() => {
    // Set network to undeployed for testing
    setNetworkId(NetworkId.Undeployed);

    // Create fresh simulator instance
    simulator = new ContractSimulator(MyContract);

    // Deploy contract (call constructor)
    circuitContext = simulator.call.constructor();
  });

  // ============================================
  // State Tests
  // ============================================

  describe('Initial State', () => {
    it('should initialize with default values', () => {
      const state = ledger(circuitContext.transactionContext.state);

      expect(state.counter.value).toBe(0n);
      expect(state.owner).toBeDefined();
    });

    it('should set constructor parameters correctly', () => {
      const customSimulator = new ContractSimulator(MyContract);
      const ctx = customSimulator.call.constructor({
        initialValue: 100n
      });

      const state = ledger(ctx.transactionContext.state);
      expect(state.counter.value).toBe(100n);
    });
  });

  // ============================================
  // Circuit Tests
  // ============================================

  describe('increment circuit', () => {
    it('should increment counter by 1', () => {
      // Call the circuit
      const result = simulator.call.increment();

      // Check new state
      const state = ledger(result.transactionContext.state);
      expect(state.counter.value).toBe(1n);
    });

    it('should increment counter multiple times', () => {
      simulator.call.increment();
      simulator.call.increment();
      const result = simulator.call.increment();

      const state = ledger(result.transactionContext.state);
      expect(state.counter.value).toBe(3n);
    });

    it('should emit correct events', () => {
      const result = simulator.call.increment();

      expect(result.events).toContainEqual({
        type: 'CounterIncremented',
        value: 1n,
      });
    });
  });

  describe('setCounter circuit', () => {
    it('should set counter to specified value', () => {
      const result = simulator.call.setCounter({ value: 42n });

      const state = ledger(result.transactionContext.state);
      expect(state.counter.value).toBe(42n);
    });

    it('should fail for negative values', () => {
      expect(() => {
        simulator.call.setCounter({ value: -1n });
      }).toThrow('Value must be non-negative');
    });

    it('should enforce maximum value', () => {
      expect(() => {
        simulator.call.setCounter({ value: 2n ** 64n });
      }).toThrow('Value exceeds maximum');
    });
  });

  // ============================================
  // Access Control Tests
  // ============================================

  describe('Access Control', () => {
    it('should allow owner to call admin functions', () => {
      // Simulator uses owner context by default
      expect(() => {
        simulator.call.adminReset();
      }).not.toThrow();
    });

    it('should reject non-owner from admin functions', () => {
      // Change caller context
      const nonOwnerAddress = sampleContractAddress();
      simulator.setCallerAddress(nonOwnerAddress);

      expect(() => {
        simulator.call.adminReset();
      }).toThrow('Only owner can call this function');
    });
  });

  // ============================================
  // Witness Tests (ZK Proofs)
  // ============================================

  describe('Witness Verification', () => {
    it('should verify valid witness', () => {
      const secret = 12345n;
      const commitment = hashSecret(secret);

      // First, store commitment
      simulator.call.storeCommitment({ commitment });

      // Then reveal with witness
      const result = simulator.call.reveal({
        witness: { secret },
        commitment,
      });

      expect(result.verified).toBe(true);
    });

    it('should reject invalid witness', () => {
      const secret = 12345n;
      const wrongSecret = 99999n;
      const commitment = hashSecret(secret);

      simulator.call.storeCommitment({ commitment });

      expect(() => {
        simulator.call.reveal({
          witness: { secret: wrongSecret },
          commitment,
        });
      }).toThrow('Invalid commitment proof');
    });
  });

  // ============================================
  // Transaction Tests
  // ============================================

  describe('Transaction Handling', () => {
    it('should return correct transaction outputs', () => {
      const result = simulator.call.transfer({
        recipient: sampleContractAddress(),
        amount: 100n,
      });

      expect(result.transactionContext.outputs).toHaveLength(1);
      expect(result.transactionContext.outputs[0]).toMatchObject({
        amount: 100n,
      });
    });

    it('should track gas usage', () => {
      const result = simulator.call.complexOperation();

      expect(result.gasUsed).toBeDefined();
      expect(result.gasUsed).toBeLessThan(1000000n);
    });
  });

  // ============================================
  // Edge Cases
  // ============================================

  describe('Edge Cases', () => {
    it('should handle maximum uint64 value', () => {
      const maxValue = 2n ** 64n - 1n;
      const result = simulator.call.setCounter({ value: maxValue });

      const state = ledger(result.transactionContext.state);
      expect(state.counter.value).toBe(maxValue);
    });

    it('should handle empty inputs', () => {
      expect(() => {
        simulator.call.processData({ data: new Uint8Array(0) });
      }).toThrow('Data cannot be empty');
    });

    it('should handle concurrent state updates', () => {
      // Simulate concurrent calls
      const results = [
        simulator.call.increment(),
        simulator.call.increment(),
        simulator.call.increment(),
      ];

      // Final state should reflect all increments
      const finalState = ledger(results[2].transactionContext.state);
      expect(finalState.counter.value).toBe(3n);
    });
  });
});

// ============================================
// Helper Functions
// ============================================

function hashSecret(secret: bigint): bigint {
  // Simplified hash for testing
  // In real code, use proper hashing from @midnight-ntwrk/compact-runtime
  return secret * 31n % (2n ** 256n);
}
