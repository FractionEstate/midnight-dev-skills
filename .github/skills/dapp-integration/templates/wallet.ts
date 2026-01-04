// Midnight Wallet Integration Template
// Location: lib/midnight/wallet.ts

import type {
  DAppConnectorAPI,
  WalletAPI,
  WalletState,
  EnabledWalletApiVersion,
} from '@midnight-ntwrk/dapp-connector-api';

// ============================================
// Type Declarations
// ============================================

declare global {
  interface Window {
    midnight?: DAppConnectorAPI;
  }
}

export interface WalletInfo {
  address: string;
  balance: bigint;
  connected: boolean;
}

export interface WalletError {
  code: string;
  message: string;
}

// ============================================
// Wallet Connection
// ============================================

/**
 * Check if Midnight wallet extension is installed
 */
export function isWalletInstalled(): boolean {
  return typeof window !== 'undefined' && !!window.midnight;
}

/**
 * Get wallet connector
 */
export function getConnector(): DAppConnectorAPI | null {
  if (typeof window === 'undefined') return null;
  return window.midnight ?? null;
}

/**
 * Get current wallet state
 */
export async function getWalletState(): Promise<WalletState | null> {
  const connector = getConnector();
  if (!connector) return null;
  
  try {
    return await connector.state();
  } catch (error) {
    console.error('Failed to get wallet state:', error);
    return null;
  }
}

/**
 * Check if wallet is connected and enabled
 */
export async function isWalletConnected(): Promise<boolean> {
  const state = await getWalletState();
  return state?.enabledWalletApiVersion !== null;
}

/**
 * Connect to wallet
 */
export async function connectWallet(): Promise<WalletAPI | null> {
  const connector = getConnector();
  
  if (!connector) {
    throw new WalletConnectionError(
      'WALLET_NOT_INSTALLED',
      'Midnight wallet extension is not installed'
    );
  }

  try {
    // Check current state
    const state = await connector.state();
    
    // Enable if not already enabled
    if (state.enabledWalletApiVersion === null) {
      await connector.enable();
    }
    
    // Get wallet API
    const walletApi = await connector.walletAPI();
    return walletApi;
  } catch (error) {
    if (error instanceof Error) {
      throw new WalletConnectionError('CONNECTION_FAILED', error.message);
    }
    throw new WalletConnectionError('CONNECTION_FAILED', 'Unknown error');
  }
}

/**
 * Disconnect wallet
 */
export async function disconnectWallet(): Promise<void> {
  const connector = getConnector();
  if (!connector) return;
  
  try {
    await connector.disable();
  } catch (error) {
    console.error('Failed to disconnect wallet:', error);
  }
}

// ============================================
// Wallet Information
// ============================================

/**
 * Get wallet address
 */
export async function getWalletAddress(walletApi: WalletAPI): Promise<string> {
  const state = await walletApi.state();
  return state.address;
}

/**
 * Get wallet balance
 */
export async function getWalletBalance(walletApi: WalletAPI): Promise<bigint> {
  const state = await walletApi.state();
  return state.balance ?? 0n;
}

/**
 * Get full wallet info
 */
export async function getWalletInfo(walletApi: WalletAPI): Promise<WalletInfo> {
  const state = await walletApi.state();
  return {
    address: state.address,
    balance: state.balance ?? 0n,
    connected: true,
  };
}

// ============================================
// Transaction Handling
// ============================================

/**
 * Sign and submit a transaction
 */
export async function submitTransaction(
  walletApi: WalletAPI,
  transaction: unknown // Transaction type from @midnight-ntwrk/midnight-js-types
): Promise<string> {
  try {
    // Sign the transaction
    const signedTx = await walletApi.signTransaction(transaction);
    
    // Submit to network
    const result = await walletApi.submitTransaction(signedTx);
    
    return result.txId;
  } catch (error) {
    if (error instanceof Error) {
      throw new TransactionError('SUBMIT_FAILED', error.message);
    }
    throw new TransactionError('SUBMIT_FAILED', 'Unknown error');
  }
}

/**
 * Wait for transaction confirmation
 */
export async function waitForConfirmation(
  walletApi: WalletAPI,
  txId: string,
  timeoutMs: number = 60000
): Promise<boolean> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeoutMs) {
    try {
      const status = await walletApi.getTransactionStatus(txId);
      
      if (status.confirmed) {
        return true;
      }
      
      if (status.failed) {
        throw new TransactionError('TX_FAILED', status.error ?? 'Transaction failed');
      }
      
      // Wait before checking again
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      if (error instanceof TransactionError) throw error;
      // Continue waiting on network errors
    }
  }
  
  throw new TransactionError('TX_TIMEOUT', 'Transaction confirmation timeout');
}

// ============================================
// Error Classes
// ============================================

export class WalletConnectionError extends Error {
  constructor(
    public code: string,
    message: string
  ) {
    super(message);
    this.name = 'WalletConnectionError';
  }
}

export class TransactionError extends Error {
  constructor(
    public code: string,
    message: string
  ) {
    super(message);
    this.name = 'TransactionError';
  }
}

// ============================================
// React Hook (for Next.js)
// ============================================

/*
import { useState, useEffect, useCallback } from 'react';

export function useMidnightWallet() {
  const [walletApi, setWalletApi] = useState<WalletAPI | null>(null);
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<WalletError | null>(null);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      const api = await connectWallet();
      if (api) {
        setWalletApi(api);
        const info = await getWalletInfo(api);
        setWalletInfo(info);
      }
    } catch (err) {
      if (err instanceof WalletConnectionError) {
        setError({ code: err.code, message: err.message });
      }
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    await disconnectWallet();
    setWalletApi(null);
    setWalletInfo(null);
  }, []);

  // Check for existing connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (await isWalletConnected()) {
        const api = await connectWallet();
        if (api) {
          setWalletApi(api);
          const info = await getWalletInfo(api);
          setWalletInfo(info);
        }
      }
    };
    checkConnection();
  }, []);

  return {
    walletApi,
    walletInfo,
    isConnecting,
    error,
    isInstalled: isWalletInstalled(),
    connect,
    disconnect,
  };
}
*/
