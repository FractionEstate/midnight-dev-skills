// @ts-nocheck
// DApp Connector API TypeScript Examples
// @midnight-ntwrk/dapp-connector-api v3.0.0

import type {
  DAppConnectorAPI,
  DAppConnectorWalletAPI,
} from '@midnight-ntwrk/dapp-connector-api';
import { createBalancedTx } from '@midnight-ntwrk/midnight-js-types';

// ============================================================================
// Type Definitions
// ============================================================================

declare global {
  interface Window {
    midnight?: {
      mnLace?: DAppConnectorAPI;
    };
  }
}

interface WalletState {
  address: string;
  balances: Record<string, bigint>;
  coinPublicKey: string;
  encryptionPublicKey: string;
}

interface CoinInfo {
  nonce: Uint8Array;
  color: Uint8Array;
  value: bigint;
}

// ============================================================================
// Connection Utilities
// ============================================================================

/**
 * Check if Lace Midnight Preview wallet is installed
 */
export function isWalletInstalled(): boolean {
  return typeof window !== 'undefined' &&
    window.midnight?.mnLace !== undefined;
}

/**
 * Get the DApp Connector API instance
 */
export function getConnectorAPI(): DAppConnectorAPI | null {
  if (!isWalletInstalled()) {
    return null;
  }
  return window.midnight!.mnLace!;
}

/**
 * Check if already connected to wallet
 */
export async function isConnected(): Promise<boolean> {
  const api = getConnectorAPI();
  if (!api) return false;
  return api.isEnabled();
}

/**
 * Connect to the Lace wallet
 */
export async function connectWallet(): Promise<DAppConnectorWalletAPI> {
  const api = getConnectorAPI();
  if (!api) {
    throw new Error('Lace Midnight Preview wallet not installed');
  }

  return api.enable();
}

/**
 * Get wallet metadata
 */
export function getWalletInfo(): { name: string; version: string; icon: string } | null {
  const api = getConnectorAPI();
  if (!api) return null;

  return {
    name: api.name(),
    version: api.apiVersion(),
    icon: api.icon()
  };
}

// ============================================================================
// Wallet State Operations
// ============================================================================

/**
 * Get current wallet state
 */
export async function getWalletState(
  walletAPI: DAppConnectorWalletAPI
): Promise<WalletState> {
  return walletAPI.state();
}

/**
 * Get native token (tDUST) balance
 */
export async function getNativeBalance(
  walletAPI: DAppConnectorWalletAPI
): Promise<bigint> {
  const state = await walletAPI.state();
  // Native token has empty string key or specific token type
  return state.balances[''] || state.balances['native'] || 0n;
}

// ============================================================================
// Transaction Operations
// ============================================================================

/**
 * Balance and prove a transaction through the wallet
 */
export async function balanceAndProveTransaction<T>(
  walletAPI: DAppConnectorWalletAPI,
  unbalancedTx: T,
  newCoins: CoinInfo[] = []
) {
  const balanced = await walletAPI.balanceAndProveTransaction(
    unbalancedTx as any,
    newCoins
  );
  return createBalancedTx(balanced as any);
}

/**
 * Submit a proven transaction
 */
export async function submitTransaction<T>(
  walletAPI: DAppConnectorWalletAPI,
  provenTx: T
): Promise<{ txId: string }> {
  return walletAPI.submitTransaction(provenTx as any);
}

// ============================================================================
// React Hook Implementation
// ============================================================================

// For use with React - uncomment if using React
/*
import { useState, useCallback, useEffect } from 'react';

export interface UseWalletConnectorReturn {
  isInstalled: boolean;
  isConnected: boolean;
  isConnecting: boolean;
  address: string | null;
  balances: Record<string, bigint>;
  walletAPI: DAppConnectorWalletAPI | null;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  refreshState: () => Promise<void>;
}

export function useWalletConnector(): UseWalletConnectorReturn {
  const [walletAPI, setWalletAPI] = useState<DAppConnectorWalletAPI | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [balances, setBalances] = useState<Record<string, bigint>>({});
  const [error, setError] = useState<string | null>(null);

  // Check if wallet is installed on mount
  useEffect(() => {
    const check = () => setIsInstalled(isWalletInstalled());
    check();

    // Retry after delay for slow-loading extensions
    const timeout = setTimeout(check, 1000);
    return () => clearTimeout(timeout);
  }, []);

  // Check existing connection on mount
  useEffect(() => {
    async function checkConnection() {
      if (!isInstalled) return;

      const connected = await isConnected();
      if (connected) {
        const api = getConnectorAPI();
        if (api) {
          const wallet = await api.enable();
          setWalletAPI(wallet);
          setIsConnected(true);

          const state = await wallet.state();
          setAddress(state.address);
          setBalances(state.balances);
        }
      }
    }
    checkConnection();
  }, [isInstalled]);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const wallet = await connectWallet();
      setWalletAPI(wallet);
      setIsConnected(true);

      const state = await wallet.state();
      setAddress(state.address);
      setBalances(state.balances);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Connection failed');
      throw e;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setWalletAPI(null);
    setIsConnected(false);
    setAddress(null);
    setBalances({});
  }, []);

  const refreshState = useCallback(async () => {
    if (!walletAPI) return;

    const state = await walletAPI.state();
    setAddress(state.address);
    setBalances(state.balances);
  }, [walletAPI]);

  return {
    isInstalled,
    isConnected,
    isConnecting,
    address,
    balances,
    walletAPI,
    error,
    connect,
    disconnect,
    refreshState
  };
}
*/

// ============================================================================
// Error Handling
// ============================================================================

export enum WalletError {
  NOT_INSTALLED = 'WALLET_NOT_INSTALLED',
  CONNECTION_REJECTED = 'CONNECTION_REJECTED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED'
}

export interface Result<T> {
  success: boolean;
  data?: T;
  error?: WalletError;
  message?: string;
}

export async function safeConnect(): Promise<Result<DAppConnectorWalletAPI>> {
  try {
    if (!isWalletInstalled()) {
      return {
        success: false,
        error: WalletError.NOT_INSTALLED,
        message: 'Please install Lace Midnight Preview wallet'
      };
    }

    const wallet = await connectWallet();
    return { success: true, data: wallet };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';

    if (message.includes('rejected') || message.includes('denied')) {
      return {
        success: false,
        error: WalletError.CONNECTION_REJECTED,
        message: 'User rejected the connection request'
      };
    }

    return {
      success: false,
      error: WalletError.NETWORK_ERROR,
      message
    };
  }
}
