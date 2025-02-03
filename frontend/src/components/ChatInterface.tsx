import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { Send } from 'lucide-react';
import { Message, Bill } from '../types';
import { cn } from '../utils/cn';
import { chatService } from '../services/api';
import { MessageBubble } from './MessageBubble';
import { ErrorMessage } from './ErrorMessage';

interface ChatInterfaceProps {
  selectedBill?: Bill | null;
}

export const ChatInterface = forwardRef<
  { sendMessage: (message: string) => Promise<void> },
  ChatInterfaceProps
>(({ selectedBill }, ref) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (content: string) => {
    if (!selectedBill) {
      setError("Please select a bill first");
      return;
    }

    if (!content.trim()) {
      return;
    }

    setError(null);
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatService.sendMessage(content, selectedBill.id, selectedBill.type, String(selectedBill.congress));
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.message,
        role: 'assistant',
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      // Remove the user message if the API call failed
      setMessages((prev) => prev.filter(msg => msg.id !== newMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    await sendMessage(input);
  };

  useImperativeHandle(ref, () => ({
    sendMessage: async (content: string) => {
      if (!selectedBill) {
        setError("Please select a bill first");
        return;
      }
      await sendMessage(content);
    }
  }));

  return (
    <div className="flex flex-col h-[600px] w-full bg-white rounded-lg shadow-lg">
      {selectedBill && (
        <div className="px-4 py-3 bg-primary-50 border-b border-primary-100 rounded-t-lg">
          <h3 className="font-medium text-primary-800">Selected Bill:</h3>
          <p className="text-sm text-primary-600">{selectedBill.title}</p>
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {isLoading && (
          <div className="flex space-x-2 p-4">
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100" />
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200" />
          </div>
        )}
        {error && <ErrorMessage message={error} />}
      </div>
      
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={selectedBill 
              ? `Ask about "${selectedBill.title}"...` 
              : "Ask about any congressional bill..."}
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
});