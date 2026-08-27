import React from 'react';
import { Clock, CheckCircle2, AlertCircle, XCircle, PlayCircle, PauseCircle } from 'lucide-react';

export const StatusBadge = ({ status, size = 'md' }) => {
  const statusConfig = {
    Scheduled: {
      color: 'bg-sky-50 text-sky-700 border-sky-200',
      icon: Clock,
      label: 'Scheduled',
    },
    'Checked In': {
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: AlertCircle,
      label: 'Checked In',
    },
    'In Session': {
      color: 'bg-brand-50 text-brand-700 border-brand-300 animate-pulse',
      icon: PlayCircle,
      label: 'In Session',
    },
    Completed: {
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: CheckCircle2,
      label: 'Completed',
    },
    Cancelled: {
      color: 'bg-rose-50 text-rose-700 border-rose-200',
      icon: XCircle,
      label: 'Cancelled',
    },
    ACTIVE: {
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: PlayCircle,
      label: 'Live Queue Active',
    },
    PAUSED: {
      color: 'bg-amber-50 text-amber-800 border-amber-200',
      icon: PauseCircle,
      label: 'Queue Paused',
    },
  };

  const config = statusConfig[status] || {
    color: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: Clock,
    label: status || 'Unknown',
  };

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${config.color}`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{config.label}</span>
    </span>
  );
};
