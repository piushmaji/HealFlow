import React, { useState } from 'react';
import { AppointmentCard } from './AppointmentCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { CalendarX, Clock, CheckCircle2, PlayCircle, Calendar } from 'lucide-react';

export const AppointmentList = ({ appointments = [], onBookNew }) => {
  const [filterTab, setFilterTab] = useState('upcoming'); // 'upcoming', 'in_progress', 'completed', 'all'

  if (appointments.length === 0) {
    return (
      <EmptyState
        icon={CalendarX}
        title="No appointments scheduled"
        description="You have no active or previous appointment bookings at HealFlow."
        actionLabel="Find & Book a Doctor"
        onAction={onBookNew}
      />
    );
  }

  // Sanitize appointment status according to real date: future appointments cannot be 'In Session'
  const todayIso = new Date().toISOString().split('T')[0];
  const normalizedAppointments = appointments.map((apt) => {
    const aptDate = apt.date || apt.slot_date;
    let status = apt.status || 'Scheduled';
    if (status === 'In Session' && aptDate && aptDate > todayIso) {
      status = 'Scheduled'; // Guard against future date marked In Session
    }
    return { ...apt, status };
  });

  const inProgressApts = normalizedAppointments.filter((a) => a.status === 'In Session');
  const upcomingApts = normalizedAppointments.filter((a) => a.status === 'Scheduled' || a.status === 'Checked In');
  const completedApts = normalizedAppointments.filter((a) => a.status === 'Completed');

  let displayedAppointments = normalizedAppointments;
  if (filterTab === 'in_progress') {
    displayedAppointments = inProgressApts;
  } else if (filterTab === 'upcoming') {
    displayedAppointments = upcomingApts;
  } else if (filterTab === 'completed') {
    displayedAppointments = completedApts;
  }

  return (
    <div className="space-y-4 font-sans">
      {/* Category Tabs: Upcoming, In Progress, Completed, All */}
      <div className="flex items-center gap-1.5 p-1 bg-[#F8FAFE] rounded-2xl border border-slate-200/80 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setFilterTab('upcoming')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border-0 shrink-0 ${
            filterTab === 'upcoming'
              ? 'bg-[#4C5BBD] text-white shadow-xs font-black'
              : 'text-[#6B6E84] hover:text-[#1F1F1F] bg-transparent'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Upcoming ({upcomingApts.length})</span>
        </button>

        {inProgressApts.length > 0 && (
          <button
            type="button"
            onClick={() => setFilterTab('in_progress')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border-0 shrink-0 ${
              filterTab === 'in_progress'
                ? 'bg-emerald-600 text-white shadow-xs font-black'
                : 'text-emerald-700 hover:text-emerald-900 bg-emerald-50'
            }`}
          >
            <PlayCircle className="w-3.5 h-3.5 animate-pulse" />
            <span>In Progress ({inProgressApts.length})</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setFilterTab('completed')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border-0 shrink-0 ${
            filterTab === 'completed'
              ? 'bg-[#4C5BBD] text-white shadow-xs font-black'
              : 'text-[#6B6E84] hover:text-[#1F1F1F] bg-transparent'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Completed ({completedApts.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setFilterTab('all')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border-0 shrink-0 ${
            filterTab === 'all'
              ? 'bg-[#4C5BBD] text-white shadow-xs font-black'
              : 'text-[#6B6E84] hover:text-[#1F1F1F] bg-transparent'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>All ({normalizedAppointments.length})</span>
        </button>
      </div>

      {/* Appointment Cards */}
      {displayedAppointments.length > 0 ? (
        <div className="flex flex-col gap-3">
          {displayedAppointments.map((apt) => (
            <AppointmentCard key={apt.id} appointment={apt} />
          ))}
        </div>
      ) : (
        <div className="py-8 text-center bg-[#F8FAFE] rounded-2xl border border-slate-200/70 p-4">
          <p className="text-xs font-semibold text-[#6B6E84]">
            {filterTab === 'upcoming'
              ? 'No upcoming appointments scheduled.'
              : filterTab === 'in_progress'
              ? 'No consultations currently in progress.'
              : 'No completed appointments found.'}
          </p>
        </div>
      )}
    </div>
  );
};
