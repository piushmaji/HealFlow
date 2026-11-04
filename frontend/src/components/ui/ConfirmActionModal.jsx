import React from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, LogOut, Trash2, HelpCircle, Check, X } from 'lucide-react';

/**
 * HealFlow Themed Confirm Action Dialog (Popup)
 * Border-free, rich soft shadow, blurred backdrop, smooth pop animation.
 * Ideal for: Sign out, Delete, Appointment cancellation, Profile reset.
 */
export const ConfirmActionModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  description = 'Are you sure you want to proceed with this action?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger', // 'danger' | 'warning' | 'info' | 'logout'
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const typeConfig = {
    danger: {
      iconBg: 'bg-rose-50 text-rose-600',
      icon: Trash2,
      confirmBtn: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/25',
    },
    logout: {
      iconBg: 'bg-indigo-50 text-[#4C5BBD]',
      icon: LogOut,
      confirmBtn: 'bg-[#4C5BBD] hover:bg-[#3B489E] text-white shadow-[#4C5BBD]/25',
    },
    warning: {
      iconBg: 'bg-amber-50 text-amber-600',
      icon: AlertTriangle,
      confirmBtn: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/25',
    },
    info: {
      iconBg: 'bg-blue-50 text-blue-600',
      icon: HelpCircle,
      confirmBtn: 'bg-[#4C5BBD] hover:bg-[#3B489E] text-white shadow-[#4C5BBD]/25',
    },
  };

  const currentType = typeConfig[type] || typeConfig.danger;
  const IconComponent = currentType.icon;

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in font-sans">
      {/* Background click to dismiss */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Modal Card - Completely Border-Free with Deep Elevation Shadow */}
      <div 
        className="relative bg-white text-[#1F1F1F] rounded-[2rem] p-6 sm:p-8 shadow-2xl border-0 w-full max-w-md mx-auto space-y-6 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Icon Top Right */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-[#6B6E84] hover:bg-[#F2F5FF] hover:text-[#1F1F1F] transition-colors border-0 cursor-pointer"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon & Message Body */}
        <div className="flex flex-col items-center text-center space-y-3 pt-2">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xs ${currentType.iconBg}`}>
            <IconComponent className="w-7 h-7" />
          </div>

          <h3 className="text-lg font-black text-[#1F1F1F] font-heading tracking-tight">
            {title}
          </h3>

          <p className="text-xs text-[#6B6E84] font-medium leading-relaxed max-w-xs">
            {description}
          </p>
        </div>

        {/* Dual Actions - Pill Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-full bg-[#F2F5FF] hover:bg-[#E5ECFF] text-[#1F1F1F] text-xs font-black transition-all border-0 shadow-xs cursor-pointer"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-full text-xs font-black transition-all border-0 shadow-md cursor-pointer disabled:opacity-50 ${currentType.confirmBtn}`}
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

