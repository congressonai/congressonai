import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { WalletConnect } from './WalletConnect';
import logo from "../assets/betterCat.png"
import { Twitter, Github, Send, Menu } from 'lucide-react';

export function MobileHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-b border-neutral-200/50 z-40 mobile p-3">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3 group">
            <Link to="/" className="flex items-center space-x-3 group">
              <img src={logo} alt="CongressBills.ai" className="w-6 h-6" style={{ width: "40px", height: "auto" }} />
              <span className="text-xl font-bold bg-clip-text text-primary-500 from-primary-600 to-secondary-500">
                congresson.ai
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-1">

            {menuOpen && (
              <div className="absolute top-16 right-0 bg-white shadow-lg rounded-lg w-full p-8 break-all mobileMenu">
                  <Link to="/faq" className="block text-gray-500 hover:text-primary-500 transition-colors">
                  FAQ
                </Link>
               <Link to={`https://dexscreener.com/solana/AYw7wmGTeUQjFuE8kiqtmNpT8awFAsJQ45cwfMztpump`} className="block text-gray-500 hover:text-primary-500 transition-colors mt-4">
                  $CONGRESS
                </Link>
                <Link to={`https://dexscreener.com/solana/AYw7wmGTeUQjFuE8kiqtmNpT8awFAsJQ45cwfMztpump`} className="block text-gray-500 hover:text-primary-500 transition-colors mt-4">
                  CA: AYw7wmGTeUQjFuE8kiqtmNpT8awFAsJQ45cwfMztpump
                </Link>
                <div className="flex items-center space-x-2 mt-4">
                  <a
                    href="https://x.com/congressonai"
                    target="_blank"
                  rel="noopener noreferrer"
                  className="block text-gray-400 hover:text-primary-500 transition-colors"
                >
                  <Twitter className="w-5 h-5" />
                </a>
                <a
                  href="https://github.com/congressonai/congressonai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-gray-400 hover:text-primary-500 transition-colors"
                >
                  <Github className="w-5 h-5" />
                </a>
                <a
                  href="https://t.me/congressai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-gray-400 hover:text-primary-500 transition-colors"
                >
                    <Send className="w-5 h-5" />
                  </a>
                </div>
              </div>
            )}

            <WalletConnect />
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-gray-500 hover:text-primary-500 transition-colors"
            >
              <Menu className="w-8 h-8 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}