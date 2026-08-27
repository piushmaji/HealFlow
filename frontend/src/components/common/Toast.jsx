import React from 'react';
import { useToast } from '../../context/ToastContext';
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react';

export const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  if (!toasts || toasts.length === 0) return null;

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />,
    warning: <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />,
    error: <XCircle className="w-4 h-4 text-rose-500 shrink-0" />,
    info: <Info className="w-4 h-4 text-[#4C5BBD] shrink-0" />,
  };

  // Limit to max 4 visible notifications stacked one under another below topbar
  const maxVisible = 4;
  const recentToasts = toasts.slice(-maxVisible);

  return (
    <div className="fixed top-20 right-6 z-[9999999] flex flex-col items-end gap-2.5 max-w-sm sm:w-96 w-full pointer-events-none font-sans">
      {recentToasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto w-full bg-white/95 backdrop-blur-md text-[#1F1F1F] p-3.5 px-4 rounded-2xl border-0 shadow-xl flex items-center justify-between gap-3 animate-slide-in-right transition-all duration-300 ease-in-out"
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="p-1.5 rounded-xl bg-slate-50 shrink-0">
              {icons[toast.type] || icons.info}
            </div>
            <p className="text-xs font-semibold font-secondary leading-snug text-[#1F1F1F] truncate">
              {toast.message}
            </p>
          </div>

          <button
            type="button"
            onClick={() => removeToast(toast.id)}
            style={{ outline: 'none' }}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0 border-0"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
