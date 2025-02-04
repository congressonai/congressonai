import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { Connection } from '@solana/web3.js';

const connection = new Connection('https://api.mainnet-beta.solana.com');
const wallet = new PhantomWalletAdapter();

export const connectWallet = async () => {
  try {
    await wallet.connect();
    const balance = await connection.getBalance(wallet.publicKey!);
    return {
      publicKey: wallet.publicKey?.toString(),
      balance: balance / 1e9, 
    };
  } catch (error) {
    console.error('Wallet connection error:', error);
    throw error;
  }
};

export const disconnectWallet = async () => {
  try {
    await wallet.disconnect();
  } catch (error) {
    console.error('Wallet disconnection error:', error);
    throw error;
  }
};