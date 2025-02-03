import { useState, useEffect } from 'react';
import { Bill } from '../types';
import { billsService } from '../services/bills';

export function useTrendingBills() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrendingBills = async () => {
      try {
        const data = await billsService.getTrendingBills();
        setBills(data);
      } catch (err) {
        setError('Failed to fetch bills');
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingBills();
  }, []);

  return { bills, loading, error };
}