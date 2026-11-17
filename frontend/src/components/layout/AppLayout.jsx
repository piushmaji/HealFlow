import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { ToastContainer } from '../common/Toast';
import { ChatbotWidget } from '../chatbot/ChatbotWidget';
import { IncomingConsultationNotification } from '../../features/dashboard/IncomingConsultationNotification';

export const AppLayout = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="flex flex-col min-h-screen bg-white text-[#1F1F1F] font-sans">
      {!isAuthPage && <Navbar />}
      <main className="flex-grow">
        <Outlet />
      </main>
      <IncomingConsultationNotification />
      <ChatbotWidget />
      <ToastContainer />
      {!isAuthPage && <Footer />}
    </div>
  );
};
