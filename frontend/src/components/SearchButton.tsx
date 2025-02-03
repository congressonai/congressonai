import React from 'react';
import { Search } from 'lucide-react';

interface SearchButtonProps {
  onClick: () => void;
}

export function SearchButton({ onClick }: SearchButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center space-x-2 px-4 py-2 text-gray-400 bg-white border rounded-lg shadow-sm hover:border-primary-300 hover:text-primary-500 transition-colors"
    >
      <Search className="w-4 h-4" />
      <span className="hidden sm:inline">Search bills...</span>
      <span className="text-xs text-gray-400">⌘K</span>
    </button>
  );
}