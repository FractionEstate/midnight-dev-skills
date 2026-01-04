#!/usr/bin/env node
/**
 * Wallet SDK Setup Script
 * Demonstrates complete wallet initialization and basic operations
 *
 * Usage: npx ts-node wallet-setup.ts
 */

import { WalletBuilder, type Wallet } from '@midnight-ntwrk/wallet';
import { NetworkId, nativeToken } from '@midnight-ntwrk/zswap';
import { generateRandomSeed, HDWallet, Roles } from '@midnight-ntwrk/wallet-sdk-hd';
import * as Rx from 'rxjs';
import * as readline from 'readline/promises';

// =============================================================================
// Configuration
// =============================================================================

const TESTNET_CONFIG = {
  indexer: 'https://indexer.testnet-02.midnight.network/api/v1/graphql',
  indexerWS: 'wss://indexer.testnet-02.midnight.network/api/v1/graphql/ws',
  proofServer: 'http://localhost:6300',
  node: 'https://rpc.testnet-02.midnight.network'
};

// =============================================================================
// HD Wallet Derivation
// =============================================================================

/**
 * Derive wallet seed using BIP-44 path: m/44'/2400'/account'/3/0
 */
function deriveWalletSeed(masterSeed: Uint8Array, account = 0): string {
  const hdWallet = HDWallet.fromSeed(masterSeed);

  if (hdWallet.type !== 'seedOk') {
    throw new Error('Failed to initialize HD Wallet from seed');
  }

  const zswapKey = hdWallet.hdWallet
    .selectAccount(account)
    .selectRole(Roles.Zswap)
    .deriveKeyAt(0);

  if (zswapKey.type !== 'keyDerived') {
    throw new Error('Failed to derive Zswap key');
  }

  // Convert to hex string
  return Array.from(zswapKey.key, b =>
    b.toString(16).padStart(2, '0')
  ).join('');
}

/**
 * Generate a new random wallet seed
 */
function generateNewSeed(): { masterSeed: string; walletSeed: string } {
  const masterSeed = generateRandomSeed();
  const masterSeedHex = Array.from(masterSeed, b =>
    b.toString(16).padStart(2, '0')
  ).join('');

  const walletSeed = deriveWalletSeed(masterSeed);

  return { masterSeed: masterSeedHex, walletSeed };
}

// =============================================================================
// Wallet Operations
// =============================================================================

/**
 * Build and start a wallet from seed
 */
async function buildWallet(seed: string): Promise<Wallet> {
  console.log('Building wallet...');

  const wallet = await WalletBuilder.build(
    TESTNET_CONFIG.indexer,
    TESTNET_CONFIG.indexerWS,
    TESTNET_CONFIG.proofServer,
    TESTNET_CONFIG.node,
    seed,
    NetworkId.TestNet,
    'info'
  );

  wallet.start();
  console.log('Wallet started, waiting for sync...');

  // Wait for initial sync
  await Rx.firstValueFrom(
    wallet.state().pipe(
      Rx.filter(state => state.syncProgress?.synced === true)
    )
  );

  console.log('Wallet synced!');
  return wallet;
}

/**
 * Display wallet state
 */
async function displayWalletState(wallet: Wallet): Promise<void> {
  const state = await Rx.firstValueFrom(wallet.state());

  console.log('\n=== Wallet State ===');
  console.log('Address:', state.address);
  console.log('Coin Public Key:', state.coinPublicKey);

  const balance = state.balances[nativeToken()] || 0n;
  console.log('tDUST Balance:', balance.toString());
  console.log('====================\n');
}

/**
 * Wait for wallet to receive funds
 */
async function waitForFunds(wallet: Wallet): Promise<bigint> {
  console.log('\nWaiting for funds...');
  console.log('Send tDUST from: https://midnight.network/test-faucet\n');

  return Rx.firstValueFrom(
    wallet.state().pipe(
      Rx.tap(state => {
        if (state.syncProgress && !state.syncProgress.synced) {
          console.log('Syncing...');
        }
      }),
      Rx.filter(state => state.syncProgress?.synced === true),
      Rx.map(state => state.balances[nativeToken()] ?? 0n),
      Rx.filter(balance => balance > 0n),
      Rx.tap(balance => console.log(`Received: ${balance} tDUST`))
    )
  );
}

/**
 * Transfer tDUST to another address
 */
async function transferTokens(
  wallet: Wallet,
  recipient: string,
  amount: bigint
): Promise<{ txId: string }> {
  console.log(`\nTransferring ${amount} tDUST to ${recipient}...`);

  // Create transfer transaction
  const recipe = await wallet.transferTransaction([
    {
      amount,
      type: nativeToken(),
      receiverAddress: recipient
    }
  ]);
  console.log('Transfer recipe created');

  // Prove transaction (this takes time)
  console.log('Generating zero-knowledge proofs (30-60 seconds)...');
  const proven = await wallet.proveTransaction(recipe);
  console.log('Proofs generated');

  // Submit transaction
  console.log('Submitting transaction...');
  const result = await wallet.submitTransaction(proven);
  console.log('Transaction submitted!');
  console.log('Transaction ID:', result.txId);

  return result;
}

// =============================================================================
// Main CLI Application
// =============================================================================

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log('\n=== Midnight Wallet SDK Demo ===\n');

  let wallet: Wallet | null = null;

  try {
    // Ask about seed
    const hasSeed = await rl.question('Do you have an existing wallet seed? (y/n): ');

    let walletSeed: string;

    if (hasSeed.toLowerCase() === 'y') {
      walletSeed = await rl.question('Enter your 64-character wallet seed: ');

      if (walletSeed.length !== 64) {
        throw new Error('Invalid seed length. Expected 64 hex characters.');
      }
    } else {
      console.log('\nGenerating new wallet...');
      const { masterSeed, walletSeed: derived } = generateNewSeed();
      walletSeed = derived;

      console.log('\n*** IMPORTANT: Save these values ***');
      console.log('Master Seed:', masterSeed);
      console.log('Wallet Seed:', walletSeed);
      console.log('************************************\n');
    }

    // Build wallet
    wallet = await buildWallet(walletSeed);
    await displayWalletState(wallet);

    // Check balance
    const state = await Rx.firstValueFrom(wallet.state());
    const balance = state.balances[nativeToken()] || 0n;

    if (balance === 0n) {
      console.log('Your wallet address:', state.address);
      await waitForFunds(wallet);
      await displayWalletState(wallet);
    }

    // Interactive menu
    let running = true;
    while (running) {
      console.log('\n--- Menu ---');
      console.log('1. Show wallet state');
      console.log('2. Transfer tDUST');
      console.log('3. Exit');

      const choice = await rl.question('\nChoice: ');

      switch (choice) {
        case '1':
          await displayWalletState(wallet);
          break;

        case '2':
          const recipient = await rl.question('Recipient address: ');
          const amountStr = await rl.question('Amount (in smallest unit): ');
          const amount = BigInt(amountStr);

          await transferTokens(wallet, recipient, amount);
          await displayWalletState(wallet);
          break;

        case '3':
          running = false;
          break;

        default:
          console.log('Invalid choice');
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (wallet) {
      console.log('\nClosing wallet...');
      await wallet.close();
    }
    rl.close();
  }
}

// Run if executed directly
main().catch(console.error);
