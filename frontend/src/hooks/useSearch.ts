import { useState, useEffect } from 'react';
import { Bill } from '../types';
import { billsService } from '../services/bills';

export function useSearch(query: string) {
  const [searchResults, setSearchResults] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);    
    const search = async () => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      try {
        setLoading(true);
        const results = await billsService.searchBills(query);
        setSearchResults(results);
        setLoading(false);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
        setLoading(false);
      } 
    };

    const timeoutId = setTimeout(search, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  return { searchResults, loading };
}