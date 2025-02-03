import React from 'react';
import { Bill } from '../types';

interface SearchResultsProps {
  isSearching: boolean;
  results: Bill[];
  loading: boolean;
  query: string;
  onSelect: (result: Bill) => void;
}

export function SearchResults({isSearching, results, loading, query, onSelect }: SearchResultsProps) {
  if (results.length > 0) {
    return (
      <div className="max-h-96 overflow-y-auto p-2 absolute top-20 left-0 w-full bg-white z-50 rounded-lg">
        <div className="space-y-1">
          {results.map((result) => (
            <button
              key={result.id}
              onClick={() => onSelect(result)}
              className="w-full text-left px-4 py-3 rounded-lg hover:bg-primary-50"
            >
              <div className="font-medium">{result.title}</div>
              <div className="text-sm text-gray-500">{result.status}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }
  else if (isSearching) {
    if (loading) {
      return <div className="p-4 text-center text-gray-500 absolute top-20 left-0 w-full bg-white z-50 rounded-lg">Loading...</div>;
    }
    else {
      return <div className="p-4 text-center text-gray-500 absolute top-20 left-0 w-full bg-white z-50 rounded-lg">No results found</div>;
    }
  }
  else {
    return null;
  }
}