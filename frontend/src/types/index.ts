export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export interface WalletState {
  connected: boolean;
  publicKey: string | null;
  balance: number;
}

export interface ApiError {
  message: string;
  code?: string;
}

export interface Bill {
  id: string;
  title: string;
  summary?: string;
  status: string;
  pdf_link: string | string[];
  congress: number;
  type: string;
  latest_action: {
    actionDate: string;
    text: string;
  };
}