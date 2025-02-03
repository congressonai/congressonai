import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { BillDetail } from './pages/BillDetail';
import { FAQ } from './pages/FAQ';
import { GrokBadge } from './components/GrokBadge';
import { MobileHeader } from './components/MobileHeader';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <MobileHeader />
        <main className="flex-1 pt-24 px-4 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/bills/:congress/:bill_type/:bill_id" element={<BillDetail />} />
            <Route path="/faq" element={<FAQ />} />
          </Routes>
        </main>
        <Footer />
        <GrokBadge />
      </div>
    </Router>
  );
}