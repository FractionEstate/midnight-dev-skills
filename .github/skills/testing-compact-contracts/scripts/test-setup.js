/**
 * Midnight Compact Contract Test Setup
 * Helper utilities for testing Compact contracts with Vitest
 */

import { beforeAll, afterAll, beforeEach } from 'vitest';

/**
 * Creates a mock Midnight context for testing
 * @param {Object} options - Configuration options
 * @returns {Object} Mock context object
 */
export function createTestContext(options = {}) {
  const {
    network = 'testnet',
    proofServerUrl = 'http://localhost:6300',
    initialState = {}
  } = options;

  // Mock ledger state
  const ledgerState = new Map(Object.entries(initialState));

  return {
    network,
    proofServerUrl,

    // Ledger operations
    getLedger(key) {
      return ledgerState.get(key);
    },

    setLedger(key, value) {
      ledgerState.set(key, value);
    },

    // Transaction helpers
    async simulateTransaction(circuitName, params) {
      console.log(`Simulating ${circuitName} with params:`, params);
      return {
        success: true,
        gasUsed: Math.floor(Math.random() * 100000),
        proof: 'mock-proof-' + Date.now()
      };
    },

    // Reset state
    reset() {
      ledgerState.clear();
      Object.entries(initialState).forEach(([k, v]) => {
        ledgerState.set(k, v);
      });
    }
  };
}

/**
 * Creates test fixtures for Compact contract testing
 * @param {Object} contract - Compiled contract module
 * @returns {Object} Test fixtures
 */
export function createContractFixtures(contract) {
  return {
    contract,

    // Sample test data
    testAddresses: [
      'addr_test_1qz2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3jcu5d8ps7zex2k2xt3uqxgjqnnj83ws8lhrn648jjxtwq2ytjqp',
      'addr_test_1qpu5vlrf4xkxv2qpwngf6cjhtw542ayty80v8dyr49rf5ewvxwdrt70qlcpeeagscasafhffqsxy36t90ldv06wqrk2qum8x5w'
    ],

    testValues: {
      strings: ['Hello', 'World', 'Midnight'],
      numbers: [0, 1, 100, 1000000],
      booleans: [true, false]
    }
  };
}

/**
 * Vitest setup for Compact contract tests
 */
export function setupContractTests(options = {}) {
  let ctx;

  beforeAll(async () => {
    // Verify proof server is running
    if (options.requireProofServer) {
      try {
        const response = await fetch(options.proofServerUrl || 'http://localhost:6300/health');
        if (!response.ok) throw new Error('Proof server not healthy');
      } catch (error) {
        throw new Error(
          'Proof server not available. Start with:\n' +
          'docker run -p 6300:6300 midnightnetwork/proof-server -- midnight-proof-server --network testnet'
        );
      }
    }
  });

  beforeEach(() => {
    ctx = createTestContext(options);
  });

  afterAll(() => {
    // Cleanup
  });

  return () => ctx;
}

/**
 * Assert helpers for Compact contract tests
 */
export const contractAssert = {
  ledgerEquals(ctx, key, expected, message) {
    const actual = ctx.getLedger(key);
    if (actual !== expected) {
      throw new Error(
        message || `Ledger ${key}: expected ${expected}, got ${actual}`
      );
    }
  },

  transactionSucceeds(result, message) {
    if (!result.success) {
      throw new Error(message || 'Transaction failed');
    }
  },

  transactionFails(result, message) {
    if (result.success) {
      throw new Error(message || 'Transaction should have failed');
    }
  }
};

// Example usage:
//
// import { describe, it, expect } from 'vitest';
// import { setupContractTests, contractAssert } from './test-setup.js';
// import * as contract from '../contracts/managed/mycontract/contract.cjs';
//
// describe('MyContract', () => {
//   const getContext = setupContractTests({
//     initialState: { count: 0 }
//   });
//
//   it('should increment counter', async () => {
//     const ctx = getContext();
//     const result = await ctx.simulateTransaction('increment', {});
//     contractAssert.transactionSucceeds(result);
//   });
// });
