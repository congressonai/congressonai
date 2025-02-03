import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Bill } from '../types';
import { useTrendingBills } from '../hooks/useTrendingBills';

export function TrendingBillsInline() {
  const { bills, loading, error } = useTrendingBills();
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
    <div 
      className="overflow-hidden relative"
      style={{
        position: "absolute", 
        top: "80px", 
        left: "0", 
        width: "100%",
        padding: "16px 0",
        zIndex: 10
      }}
    >
      <div 
        className="flex flex-row gap-4 px-4 overflow-hidden"
        style={{
          width: 'fit-content',
          animation: 'scroll 250s linear infinite',
          paddingTop: '2px',
          paddingBottom: '2px'
        }}
      >
        {[...bills, ...bills, ...bills].map((bill, index) => (
          <a
            key={`${bill.id}-${index}`}
            href={`/bills/${bill.congress}/${bill.type}/${bill.id}`}
            onClick={(e) => {
              e.preventDefault();
              navigate(`/bills/${bill.congress}/${bill.type}/${bill.id}`);
            }}
            className="group relative overflow-hidden rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:translate-y-[-2px] block"
            style={{
              minWidth: '280px',
              background: 'linear-gradient(135deg, #4171F5 0%, #3156D3 100%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              position: 'relative',
              textDecoration: 'none',
            }}
          >
            <div 
              className="absolute top-0 right-0 w-20 h-20 -mr-10 -mt-10 rotate-45"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 171, 64, 0.4) 0%, rgba(255, 171, 64, 0) 60%)',
                borderRadius: '50%',
                filter: 'blur(8px)',
              }}
            />
            
            <div className="flex justify-between items-start mb-3">
              <span 
                className="px-2.5 py-0.5 rounded-full text-xs font-medium"
                style={{
                  background: 'rgba(255, 171, 64, 0.25)',
                  color: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(4px)',
                }}
              >
                {bill.status.split(' ')[0]}
              </span>
              <ArrowRight 
                className="w-4 h-4 transition-transform group-hover:translate-x-1" 
                style={{color: 'rgba(255, 255, 255, 0.7)'}} 
              />
            </div>
            <h5 
              className="text-base font-semibold mb-1 transition-colors text-left line-clamp-2"
              style={{color: 'rgba(255, 255, 255, 0.95)'}}
            >
              {bill.title}
            </h5>
            <div 
              className="absolute top-0 left-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 100%)',
              }}
            />
          </a>
        ))}
      </div>
    </div>
  );
}

