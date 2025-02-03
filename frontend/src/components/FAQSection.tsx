import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../utils/cn';

interface FAQSectionProps {
  title: string;
  icon: React.ReactNode;
  questions: Array<{
    question: string;
    answer: React.ReactNode;
  }>;
}

export function FAQSection({ title, icon, questions }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  return (
    <section className="mb-12">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 rounded-xl bg-primary-100">{icon}</div>
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      </div>
      <div className="space-y-4">
        {questions.map((item, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
            >
              <span className="font-medium text-gray-900">{item.question}</span>
              <ChevronDown
                className={cn(
                  "w-5 h-5 text-gray-500 transition-transform",
                  openIndex === index && "transform rotate-180"
                )}
              />
            </button>
            {openIndex === index && (
              <div className="p-4 bg-gray-50 border-t border-gray-200 prose prose-purple max-w-none">
                {item.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}