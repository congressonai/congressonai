import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar, Users, FileText, Bot, Download, Activity } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Bill } from '../types';
import { billsService } from '../services/bills';

interface BillHighlightsProps {
  bill: Bill;
}

export function BillHighlights({ bill }: BillHighlightsProps) {
const [summary, setSummary] = useState<string | null>(null);
const [loadingSummary, setLoadingSummary] = useState(false);
const [errorSummary, setErrorSummary] = useState<string | null>(null);

const fetchSummary = async () => {
  if (loadingSummary) return; // Prevent multiple simultaneous requests
  
  try { 
    setLoadingSummary(true);
    setErrorSummary(null);
    const response = await billsService.getSummary(bill.congress, bill.type, bill.id);
    setSummary(response);
  } catch (error) {
    setErrorSummary('Failed to fetch summary');
    setSummary(null);
  } finally {
    setLoadingSummary(false);
  }
};

useEffect(() => {
  if (bill.summary) {
    setSummary(bill.summary);
  }
}, [bill]);


  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center space-x-2 mb-6 justify-between">
        <div className="flex items-center space-x-2">
        <Sparkles className="w-6 h-6 text-primary-500" />
        <h2 className="text-2xl font-semibold">Key Highlights</h2>
        </div>
        {bill.pdf_link && bill.pdf_link.length > 0 && <a 
          href={bill.pdf_link[0]}
          download={`${bill.title}.pdf`}
          className="ml-auto btn btn-primary flex items-center space-x-2"
          target="_blank"
        >
          <Download className="w-5 h-5 mr-2" />
          Download PDF
        </a>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-primary-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Calendar className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold">Last Action</h3>
          </div>
          <p className="text-gray-700">{bill.latest_action?.actionDate}</p>
        </div>
        <div className="bg-primary-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Activity className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold">Action Taken</h3>
          </div>
          <p className="text-gray-700">{bill.latest_action?.text}</p>
        </div>
        <div className="bg-primary-50 rounded-lg p-4 md:col-span-2">
          <div className="flex items-center space-x-2 mb-2">
            <FileText className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold">Summary</h3>
          </div>
          {summary ? (
            <div className="prose prose-sm max-w-none text-gray-700">
              <ReactMarkdown>{summary}</ReactMarkdown>
            </div>
          ) : !errorSummary ? (
            <button className="inline-flex items-center text-gray-500 hover:text-primary-500 transition-colors bg-primary-100 rounded-lg p-2" onClick={() => {
              fetchSummary();
            }}>
              <Bot className="w-5 h-5 mr-1" /> {loadingSummary ? 'Loading Summary...' : 'Get Summary'}
            </button>
          ) : (
            <p className="text-gray-700">No summary available</p>
          )}
        </div>
      </div>
    </div>
  );
}