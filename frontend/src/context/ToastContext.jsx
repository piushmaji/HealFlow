import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    if (!message) return;

    setToasts((prev) => {
      // Deduplicate: If an identical toast is already active, do not spawn another one
      const isDuplicate = prev.some(
        (t) => t.message.trim().toLowerCase() === message.trim().toLowerCase()
      );
      if (isDuplicate) return prev;

      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

      setTimeout(() => {
        removeToast(id);
      }, duration);

      return [...prev, { id, message, type }];
    });
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast, removeToast, toasts }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
