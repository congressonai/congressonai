import React, { useState, useRef, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Bill } from '../types';
import { useDebounce } from '../hooks/useDebounce';
import { billsService } from '../services/bills';

interface BillSearchProps {
  onSelectBill: (bill: Bill) => void;
}

export function BillSearch({ onSelectBill }: BillSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const debouncedQuery = useDebounce(query, 300);
  const containerRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchBills = async () => {
      if (!debouncedQuery.trim()) {
        setResults([]);
        return;
      }
      setIsLoading(true);
      try {
        const searchResults = await billsService.searchBills(debouncedQuery);
        setResults(searchResults);
        setIsOpen(true);
        setSelectedIndex(-1);
      } catch (error) {
        console.error('Failed to search bills:', error);
      } finally {
        setIsLoading(false);
      }
    };
    searchBills();
  }, [debouncedQuery]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => {
          const next = prev + 1 >= results.length ? 0 : prev + 1;
          scrollToItem(next);
          return next;
        });
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => {
          const next = prev - 1 < 0 ? results.length - 1 : prev - 1;
          scrollToItem(next);
          return next;
        });
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  const scrollToItem = (index: number) => {
    if (!resultsRef.current) return;
    const items = resultsRef.current.children;
    if (items[index]) {
      items[index].scrollIntoView({
        block: 'nearest',
      });
    }
  };

  const handleSelect = (bill: Bill) => {
    onSelectBill(bill);
    setQuery('');
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-xl mx-auto mb-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search for bills..."
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
        )}
      </div>
      
      {isOpen && results.length > 0 && (
        <div 
          ref={resultsRef}
          className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-80 overflow-y-auto"
        >
          {results.map((bill, index) => (
            <button
              key={bill.id}
              onClick={() => handleSelect(bill)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`w-full text-left px-4 py-3 transition-colors ${
                index === selectedIndex ? 'bg-primary-50' : 'hover:bg-primary-50'
              }`}
            >
              <div className="font-medium text-gray-900">{bill.title}</div>
              <div className="text-sm text-gray-500">
                {bill.id} • {bill.status}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}