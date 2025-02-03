import React, { useEffect, useState, useRef } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '../hooks/useSearch';
import { SearchResults } from './SearchResults';
import { SearchButton } from './SearchButton';
import { Bill } from '../types';

interface SearchResult extends Bill {
  type: 'bill';
}

export function SearchCommand() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const { searchResults, loading } = useSearch(query);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', down);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', down);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (result: Bill) => {
    setIsOpen(false);
    setQuery('');
    navigate(`/bills/${result.congress}/${result.type}/${result.id}`);
  };

  useEffect(() => {
    if (searchResults.length > 0 || !query) {
      setIsSearching(false);
    }
  }, [searchResults, query]);

  return (
    <div ref={searchRef} className="relative max-w-sm w-full lg:max-w-xl">      
        <div className="top-24 w-full max-w-xl z-50">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden w-full">
            <div className="flex items-center border-b p-4 w-full">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setIsSearching(true)
                }}
                placeholder="Search bills..."
                className="flex-1 px-4 py-2 focus:outline-none"
                autoFocus
              />
            </div>
            <SearchResults 
              isSearching={isSearching}
              results={searchResults}
              loading={loading}
              query={query}
              onSelect={handleSelect}
            />
          </div>
        </div>
    </div>
  );
}