import React from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Github, Send } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white border-t mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <a
              href="https://x.com/congressonai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-primary-500 transition-colors"
            >
              <Twitter className="w-5 h-5" />
            </a>
            <a
              href="https://github.com/congressbillsai"
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
          <nav className="flex items-center space-x-6">
          <Link to="/" className="text-gray-500 hover:text-primary-500 transition-colors">
              $CONGRESS
            </Link>
            <Link to="/faq" className="text-gray-500 hover:text-primary-500 transition-colors">
              FAQ
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}