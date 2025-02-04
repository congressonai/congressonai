import React from 'react';
import { Bot } from 'lucide-react';
import { Link } from 'react-router-dom';
import { WalletConnect } from './WalletConnect';
// import logo from "../assets/eagle.png"
import logo from "../assets/betterCat.png"

import { Twitter, Github, Send } from 'lucide-react';

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-b border-neutral-200/50 z-40 desktop p-2">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3 group"> 
          <Link to="/" className="flex items-center space-x-3 group">
          <img src={logo} alt="CongressBills.ai" className="w-6 h-6" style={{width: "45px", height: "auto", }} />
            <span className="text-xl font-bold bg-clip-text text-primary-500 from-primary-600 to-secondary-500">
              congresson.ai
            </span>
          </Link>
          <div className="separator"></div>
          <Link to="/faq" className="text-primary-500 hover:text-primary-700 transition-colors font-bold">
              FAQ
            </Link>
            <div className="separator"></div>
            {import.meta.env.VITE_TOKEN_CA && <Link to={`https://dexscreener.com/solana/${import.meta.env.VITE_TOKEN_CA}`} className="text-primary-500 hover:text-primary-700 transition-colors font-bold">
                $CONGRESS
              </Link>}
              {/* <div className="separator"></div>
              {import.meta.env.VITE_TOKEN_CA && <Link to={`https://dexscreener.com/solana/${import.meta.env.VITE_TOKEN_CA}`} className="text-primary-500 hover:text-primary-700 transition-colors font-bold">
                CA: {import.meta.env.VITE_TOKEN_CA}
              </Link>} */}
          </div>
        

          <div className="flex items-center space-x-1">
          <div className="flex items-center space-x-4 mr-4">
            <a
              href="https://x.com/congressonai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-primary-500 transition-colors"
            >
              <Twitter className="w-5 h-5" />
            </a>
            <a
              href="https://github.com/congressonai/congressonai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-primary-500 transition-colors"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="https://t.me/congressai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-primary-500 transition-colors"
            >
              <Send className="w-5 h-5" />
            </a>
          </div>
            <WalletConnect />
          </div>
        </div>
      </div>
    </header>
  );
}