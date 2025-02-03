import { useState, useEffect } from 'react';
import { Bill } from '../types';
import { billsService } from '../services/bills';

export function useBills() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const data = await billsService.getLatestBills();
        setBills(data);
      } catch (err) {
        setError('Failed to fetch bills');
      } finally {
        setLoading(false);
      }
    };

    fetchBills();
  }, []);

  return { bills, loading, error };
}