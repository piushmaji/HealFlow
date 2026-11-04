import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { QueueProvider } from './context/QueueContext';
import { AppRoutes } from './routes/AppRoutes';

export function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <ToastProvider>
        <AuthProvider>
          <QueueProvider>
            <AppRoutes />
          </QueueProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
