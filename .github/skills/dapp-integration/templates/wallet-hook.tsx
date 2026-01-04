"use client";

import { useState, useEffect, useCallback } from "react";
import type { DAppConnectorWalletAPI } from "@midnight-ntwrk/dapp-connector-api";

interface WalletState {
  isInstalled: boolean;
  isConnected: boolean;
  isConnecting: boolean;
  walletApi: DAppConnectorWalletAPI | null;
  balance: bigint | null;
  error: string | null;
}

export function useMidnightWallet() {
  const [state, setState] = useState<WalletState>({
    isInstalled: false,
    isConnected: false,
    isConnecting: false,
    walletApi: null,
    balance: null,
    error: null
  });

  // Check wallet installation
  useEffect(() => {
    const checkInstalled = () => {
      const installed = typeof window !== "undefined" && !!window.midnight;
      setState(prev => ({ ...prev, isInstalled: installed }));
    };

    checkInstalled();
    // Re-check after delay (wallet may inject later)
    const timer = setTimeout(checkInstalled, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Connect to wallet
  const connect = useCallback(async (): Promise<boolean> => {
    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      const connector = window.midnight;
      if (!connector) {
        throw new Error("Midnight wallet not installed");
      }

      // Check current state
      const walletState = await connector.state();

      // Enable if needed
      if (walletState.enabledWalletApiVersion === null) {
        await connector.enable();
      }

      // Get wallet API
      const walletApi = await connector.walletAPI();

      // Get initial balance
      const balance = await walletApi.balanceAndProveOwnership();

      setState(prev => ({
        ...prev,
        isConnecting: false,
        isConnected: true,
        walletApi,
        balance
      }));

      return true;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: error instanceof Error ? error.message : "Connection failed"
      }));
      return false;
    }
  }, []);

  // Disconnect wallet
  const disconnect = useCallback(() => {
    setState(prev => ({
      ...prev,
      isConnected: false,
      walletApi: null,
      balance: null
    }));
  }, []);

  // Refresh balance
  const refreshBalance = useCallback(async () => {
    if (!state.walletApi) return;

    try {
      const balance = await state.walletApi.balanceAndProveOwnership();
      setState(prev => ({ ...prev, balance }));
    } catch (error) {
      console.error("Failed to refresh balance:", error);
    }
  }, [state.walletApi]);

  return {
    ...state,
    connect,
    disconnect,
    refreshBalance
  };
}
