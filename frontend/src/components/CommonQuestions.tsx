import React from 'react';
import { HelpCircle } from 'lucide-react';
import { Bill } from '../types';

interface CommonQuestionsProps {
  bill: Bill;
  onSelectQuestion: (question: string) => void;
}

export function CommonQuestions({ bill, onSelectQuestion }: CommonQuestionsProps) {
  const questions = [
    "What are the main provisions of this bill?",
    "Who are the key sponsors?",
    "What's the current status and next steps?",
    "How does this bill impact constituents?",
    "What are the estimated costs?",
  ];

  return (
    <div className="bg-white rounded-xl">
      <div className="flex items-center space-x-2 p-6">
        <HelpCircle className="w-6 h-6 text-primary-500" />
        <h2 className="text-2xl font-semibold">Common Questions</h2>
      </div>
      <div className="px-6 overflow-x-auto">
        <div className="flex space-x-4 pb-6">
          {questions.map((question, index) => (
            <button
              key={index}
              onClick={() => onSelectQuestion(question)}
              className="flex-shrink-0 text-left p-4 rounded-lg border border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-all"
              style={{width: '300px'}}
            >
              {question}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}