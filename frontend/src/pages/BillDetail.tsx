import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { ChatInterface } from '../components/ChatInterface';
import { BillHighlights } from '../components/BillHighlights';
import { CommonQuestions } from '../components/CommonQuestions';
import { BackButton } from '../components/BackButton';
import { Bill } from '../types';
import { billsService } from '../services/bills';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

export function BillDetail() {
  const { congress, bill_type, bill_id } = useParams<{ congress: string, bill_type: string, bill_id: string }>();
  const [bill, setBill] = useState<Bill | null>(null);
  const chatRef = useRef<{ sendMessage: (message: string) => Promise<void> } | null>(null);

  useEffect(() => {
    const fetchBillDetails = async () => {
      if (congress && bill_type && bill_id) {
        try {
          const billData = await billsService.getBillDetails(Number(congress), bill_type, bill_id);
          setBill(billData);
        } catch (error) {
          console.error("Failed to fetch bill details:", error);
        }
      }
    };

    fetchBillDetails();
  }, [congress, bill_type, bill_id]);

  const handleQuestionSelect = async (question: string) => {
    if (chatRef.current) {
      await chatRef.current.sendMessage(question);
    }
  };

  if (!bill) return null;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <BackButton />
      </div>
      <h1 className="text-3xl font-bold mb-6">{bill.title}</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-1">
        <div className="lg:col-span-2 space-y-4">
          <BillHighlights bill={bill} />
          <CommonQuestions 
            bill={bill} 
            onSelectQuestion={handleQuestionSelect} 
          />
          <ChatInterface 
            selectedBill={bill} 
            ref={chatRef}
          />
        </div>
        <div className="lg:col-span-1 sidebar">
          <div className="relative h-[1400px] overflow-hidden">
            <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`}>
              <Viewer fileUrl={`https://congresson.ai/api/bills/${congress}/${bill_type}/${bill_id}/pdf`} />
            </Worker>
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white to-transparent flex items-end justify-center">
              <button 
                className="mb-6 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-lg"
                onClick={() => window.open(`https://congresson.ai/api/bills/${congress}/${bill_type}/${bill_id}/pdf`, '_blank')}
              >
                View Full PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}          