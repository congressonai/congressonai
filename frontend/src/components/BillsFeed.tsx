import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Bill } from '../types';
import { useBills } from '../hooks/useBills';

function truncateText(text: string, wordLimit: number): string {
  const words = text.split(' ');
  if (words.length > wordLimit) {
    return words.slice(0, wordLimit).join(' ') + '...';
  }
  return text;
}

export function BillsFeed() {
  const { bills, loading, error } = useBills();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-1 content-start">
      {bills.map((bill) => (
        <button
          key={bill.id}
          onClick={() => navigate(`/bills/${bill.congress}/${bill.type}/${bill.id}`)}
          className="group card p-6 items-start justify-start grid relative"
        >
          <a
            href={`/bills/${bill.congress}/${bill.type}/${bill.id}`}
            className="absolute inset-0"
            onClick={(e) => e.preventDefault()}
          />
          <div className="flex justify-between items-start mb-4">
            <span className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium">
              {bill.status.split(' ')[0]}
            </span>
            <ArrowRight className="w-5 h-5 text-neutral-400 group-hover:text-primary-500 transition-colors" style={{position: 'absolute', right: '10px'}} />
          </div>
          <h3 className="text-xl font-semibold mb-3 group-hover:text-primary-600 transition-colors text-left">
            {truncateText(bill.title, 10)}
          </h3>
          {/* <p className="text-neutral-600 line-clamp-2">{bill.summary}</p> */}
        </button>
      ))}
    </div>
  );
}