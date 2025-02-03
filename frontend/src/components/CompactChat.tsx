import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { useChat } from '../hooks/useChat';
import { MessageBubble } from './MessageBubble';

interface CompactChatProps {
  selectedBill?: Bill | null;
}

export function CompactChat({ selectedBill }: CompactChatProps) {
  const [input, setInput] = useState('');
  const { messages, loading, error, sendMessage } = useChat(selectedBill?.bill_id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    await sendMessage(input);
    setInput('');
  };

  return (
    <div className="card p-6 h-[600px] flex flex-col">
      {selectedBill && (
        <div className="px-4 py-3 mb-4 bg-purple-50 border border-purple-100 rounded">
          <h3 className="font-medium text-purple-900">{selectedBill.title}</h3>
        </div>
      )}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-neutral-500 mt-8">
            <p className="mb-2">Ask me anything about this bill!</p>
            <p className="text-sm">Example: "What are the main provisions?"</p>
          </div>
        )}
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {error && (
          <div className="text-red-500 text-sm p-2 bg-red-50 rounded">
            {error}
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={selectedBill ? "Ask about this bill..." : "Select a bill first..."}
          className="input flex-1"
          disabled={loading || !selectedBill}
        />
        <button
          type="submit"
          disabled={loading || !selectedBill}
          className="btn-primary !p-2"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </form>
    </div>
  );
}