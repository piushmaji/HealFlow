import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Home, AlertCircle } from 'lucide-react';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-extrabold text-slate-900 mb-2">404 - Page Not Found</h1>
      <p className="text-sm text-slate-500 max-w-md mb-6">
        The page you are looking for does not exist or has been moved.
      </p>
      <Button variant="primary" icon={Home} onClick={() => navigate('/')}>
        Back to Smart Clinic Home
      </Button>
    </div>
  );
};
