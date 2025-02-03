import axios from 'axios';
import { Bill } from '../types';

// Set the base URL for the axios instance
const apiClient = axios.create({
  baseURL: "https://congresson.ai/api", // Adjust the base URL to match your server's address
});

export const billsService = {
  getBillDetails: async (congress: number, bill_type: string, bill_id: string): Promise<Bill> => {
    const response = await apiClient.get(`/bills/${congress}/${bill_type}/${bill_id}`);
    return response.data;
  },
  getLatestBills: async (): Promise<Bill[]> => {
    const response = await apiClient.get('/bills?sort_by=title&order=asc');
    return response.data;
  },
  getTrendingBills: async (): Promise<Bill[]> => {
    const response = await apiClient.get('/trending-bills');
    return response.data;
  },
  searchBills: async (query: string): Promise<Bill[]> => {
    const response = await apiClient.get(`/search?query=${query}`);
    return response.data;
  },
  getSummary: async (congress: number, bill_type: string, bill_id: string): Promise<string> => {
    try {
      interface BillSummaryResponse {
        bill_id: string;
        summary: string;
      }
      const response = await apiClient.get<BillSummaryResponse>(`/summary/${congress}/${bill_type}/${bill_id}`);
      return response.data.summary;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.detail || 'Failed to fetch summary');
      }
      throw error;
    }
  },
  // ... other service methods ...
};