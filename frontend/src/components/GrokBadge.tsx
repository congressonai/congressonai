import React from 'react';
import { Sparkles } from 'lucide-react';

export function GrokBadge() {
  return (
    <div className="fixed bottom-4 right-4 flex items-center space-x-2 bg-black/80 text-white px-3 py-2 rounded-full shadow-lg backdrop-blur-sm">
      <Sparkles className="w-4 h-4 text-primary-400" />
      <span className="text-sm font-medium">Powered by Grok</span>
    </div>
  );
}