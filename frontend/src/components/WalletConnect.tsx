import React from 'react';
import { Wallet } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';

export function WalletConnect() {
  const { connected, publicKey, balance, connect, disconnect } = useWallet();

  return (
    <div className="relative ml-4">
      {connected ? (
        <button
          onClick={disconnect}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <Wallet className="w-5 h-5" />
          <span className="hidden sm:inline font-medium">
            {publicKey?.slice(0, 4)}...{publicKey?.slice(-4)}
          </span>
          <span className="hidden sm:inline text-sm text-gray-500">{balance} SOL</span>
        </button>
      ) : (
        <button
          onClick={connect}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors wallet-connect-button"
          style={{width: "180px"}}
        >
          <Wallet className="w-5 h-5" />
          <span className="hidden sm:inline">Connect Wallet</span>
        </button>
      )}
    </div>
  );
}