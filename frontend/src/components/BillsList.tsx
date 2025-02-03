import React from 'react';
import { Clock, ArrowRight } from 'lucide-react';
import { Bill } from '../types';

interface BillsListProps {
  bills: Bill[];
  onSelectBill: (bill: Bill) => void;
}

export function BillsList({ bills, onSelectBill }: BillsListProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <div className="flex items-center space-x-2 mb-4">
        <Clock className="w-5 h-5 text-primary-500" />
        <h2 className="text-xl font-semibold">Latest Bills</h2>
      </div>
      <div className="space-y-3">
        {bills.map((bill) => (
          <button
            key={bill.id}
            onClick={() => onSelectBill(bill)}
            className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-primary-500 transition-colors group"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-medium group-hover:text-primary-600 transition-colors line-clamp-2">
                  {bill.title}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Status: <span className="text-gray-700">{bill.status}</span>
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}