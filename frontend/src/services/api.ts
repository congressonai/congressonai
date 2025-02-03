import axios, { AxiosError } from 'axios';

const api = axios.create({
  baseURL: "https://congresson.ai/api",
});

const handleError = (error: unknown) => {
  if (error instanceof AxiosError) {
    throw new Error(error.response?.data?.detail || 'An error occurred');
  }
  throw error;
};

interface ChatRequest {
  message: string;
  bill_id: string;
  bill_type: string;
  congress: string;
}

export const chatService = {
  async sendMessage(message: string, bill_id: string, bill_type: string, congress: string) {
    if (!message || !bill_id || !bill_type || !congress) {
      throw new Error('Message, bill_id, bill_type, and congress are required');
    }

    try {
      console.log('Sending chat request with payload:', { message, bill_id, bill_type, congress });
      const response = await api.post('/chat', {
        message,
        bill_id,
        bill_type,
        congress
      });
      return response.data;
    } catch (error) {
      console.error('Chat request error:', error);
      handleError(error);
    }
  }
};

export const billService = {
  async getBill(billId: string) {
    try {
      const response = await api.get(`/bills/${billId}`);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }
};