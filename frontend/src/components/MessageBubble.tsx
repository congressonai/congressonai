import React from 'react';
import { Message } from '../types';
import { cn } from '../utils/cn';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  return (
    <div
      className={cn(
        "p-4 rounded-lg max-w-[80%]",
        message.role === 'user'
          ? "bg-blue-500 ml-auto"
          : "bg-gray-100"
      )}
    >
      <div className={cn("prose prose-sm dark:prose-invert max-w-none text-black", message.role === 'user' ? "text-white" : "text-black")}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
          components={{
            li: ({ node, ...props }) => (
              <li {...props} className="text-black" />
            ),
            strong: ({ node, ...props }) => (
              <strong {...props} className="font-medium text-black" />
            ),
            // Style links
            a: ({ node, ...props }) => (
              <a {...props} className="text-blue-500 hover:text-blue-600 underline text-black" target="_blank" rel="noopener noreferrer" />
            ),
            // Style code blocks
            code: ({ node, inline, ...props }) => (
              <code
                {...props}
                className={cn(
                  "font-mono text-sm text-black",
                  inline
                    ? "bg-gray-200 dark:bg-gray-800 px-1 py-0.5 rounded"
                    : "block bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto"
                )}
              />
            ),
            // Style headings
            h1: ({ node, ...props }) => <h1 {...props} className="text-2xl font-bold mt-6 mb-4 text-black" />,
            h2: ({ node, ...props }) => <h2 {...props} className="text-xl font-bold mt-5 mb-3 text-black" />,
            h3: ({ node, ...props }) => <h3 {...props} className="text-lg font-bold mt-4 mb-2 text-black" />,
            // Style lists
            ul: ({ node, ...props }) => <ul {...props} className="list-disc list-inside my-4 text-black" />,
            ol: ({ node, ...props }) => <ol {...props} className="list-decimal list-inside my-4 text-black" />,
            // Style blockquotes
            blockquote: ({ node, ...props }) => (
              <blockquote {...props} className="border-l-4 border-gray-300 pl-4 my-4 italic text-black" />
            ),
          }}
        >
          {message.content}
        </ReactMarkdown>
      </div>
    </div>
  );
}