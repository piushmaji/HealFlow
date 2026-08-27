import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueue } from '../context/QueueContext';
import { useAuth } from '../context/AuthContext';
import { LiveQueueTracker } from '../features/queue/LiveQueueTracker';
import { QueueControlPanel } from '../features/queue/QueueControlPanel';
import { calculateEstimatedWaitTime } from '../utils/formatters';
import { Clock, ArrowLeft, Ticket, ArrowRight, MessageSquare, CalendarX, Stethoscope, Calendar, Building2 } from 'lucide-react';

export const LiveQueuePage = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { isDoctor } = useAuth();
  const { appointments, queues, getPatientsAhead } = useQueue();

  const scheduledAppointments = appointments.filter((a) => a.status === 'Scheduled');

  // If specific appointment ID is passed in URL
  const selectedAppointment = appointmentId ? appointments.find((a) => a.id === appointmentId) : null;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-8 font-sans">
      
      {/* 1. Clean Consolidated Header Banner */}
      <div className="bg-white rounded-3xl p-6 border-0 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => (appointmentId ? navigate('/patients/live-queue') : navigate(-1))}
            style={{ outline: 'none' }}
            className="p-2 rounded-full text-[#6B6E84] hover:bg-[#F2F5FF] border-0 transition-colors shadow-xs"
            title="Go Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-[#1F1F1F] font-sans tracking-wide">
                {isDoctor
                  ? 'Doctor OPD Live Queue Control'
                  : selectedAppointment
                  ? `Live Queue — ${selectedAppointment.doctor_name}`
                  : 'Live OPD Queue Telemetry'}
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-emerald-700 bg-emerald-50 border-0 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Live Telemetry Active</span>
              </span>
            </div>
            <p className="text-xs text-[#6B6E84] mt-0.5 font-medium">
              {isDoctor
                ? 'Manage consultation queue flow and call next patient tokens.'
                : selectedAppointment
                ? `Tracking token ${selectedAppointment.token_number} for ${selectedAppointment.hospital || 'Apollo OPD'} (${selectedAppointment.room_number || 'Room 302'}).`
                : 'Select an appointment below to view its dedicated live OPD queue & telemetry.'}
            </p>
          </div>
        </div>

        {/* Header Quick Actions */}
        {!isDoctor && selectedAppointment && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => navigate('/patients/live-queue')}
              style={{ outline: 'none' }}
              className="px-3.5 py-2 rounded-full text-xs font-bold text-[#4C5BBD] bg-[#F2F5FF] hover:bg-[#4C5BBD] hover:text-white transition-colors border-0 shadow-xs"
            >
              View All Appointments
            </button>

            <button
              type="button"
              onClick={() => navigate(`/patients/consultation/${selectedAppointment.id}`)}
              style={{ outline: 'none' }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-500 text-white text-xs font-black hover:bg-emerald-600 transition-all border-0 shadow-xs"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Doctor Chat</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. Main Workspace Body */}
      {isDoctor ? (
        <QueueControlPanel />
      ) : selectedAppointment ? (
        /* If specific appointment is selected: Render clean dedicated tracker */
        <LiveQueueTracker appointment={selectedAppointment} />
      ) : scheduledAppointments.length > 0 ? (
        /* If no specific ID in URL & patient has appointments: Render Selection Cards Grid */
        <div className="space-y-4 font-sans">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-wider text-[#1F1F1F] font-sans">
              Active Consultation Appointments ({scheduledAppointments.length})
            </h3>
            <span className="text-xs text-[#6B6E84] font-medium">Select any card below to track its live queue</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {scheduledAppointments.map((apt) => {
              const docQueue = queues[apt.doctor_id] || { current_token: 'CARD-004' };
              const ahead = getPatientsAhead(apt.doctor_id, apt.token_number);
              const waitTime = calculateEstimatedWaitTime(ahead);

              return (
                <div
                  key={apt.id}
                  className="bg-white rounded-3xl p-6 border-0 shadow-xs space-y-5 hover:bg-[#F8FAFE] transition-all group flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <span className="px-3 py-1 text-xs font-black font-sans bg-[#F2F5FF] text-[#4C5BBD] rounded-xl border-0 shadow-xs flex items-center gap-1.5">
                        <Ticket className="w-3.5 h-3.5 text-[#4C5BBD]" />
                        <span>Token: {apt.token_number}</span>
                      </span>

                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-0.5 rounded-full">
                        Scheduled OPD
                      </span>
                    </div>

                    {/* Doctor Info */}
                    <div className="flex items-start gap-4">
                      <img
                        src={apt.doctor_avatar}
                        alt={apt.doctor_name}
                        className="w-14 h-14 rounded-2xl object-cover border-0 shadow-xs shrink-0 group-hover:scale-105 transition-transform"
                      />

                      <div className="space-y-1 min-w-0 flex-1">
                        <h4 className="text-base font-black text-[#1F1F1F] font-sans truncate">
                          {apt.doctor_name}
                        </h4>
                        <p className="text-xs font-bold text-[#4C5BBD] truncate">{apt.specialty}</p>
                        <p className="text-xs text-[#6B6E84] flex items-center gap-1.5 font-medium truncate">
                          <Building2 className="w-3.5 h-3.5 text-[#4C5BBD] shrink-0" />
                          <span>{apt.hospital || 'Apollo OPD'} • {apt.room_number || 'Room 302'}</span>
                        </p>
                      </div>
                    </div>

                    {/* Telemetry Metrics Box */}
                    <div className="grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-[#F8FAFE] text-center text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-[#6B6E84] uppercase">Room Token</span>
                        <p className="font-black text-[#1F1F1F] text-sm mt-0.5">{docQueue.current_token}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-[#6B6E84] uppercase">People Ahead</span>
                        <p className="font-black text-[#1F1F1F] text-sm mt-0.5">{ahead}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-[#6B6E84] uppercase">Est Wait</span>
                        <p className="font-black text-[#4C5BBD] text-sm mt-0.5">{waitTime}</p>
                      </div>
                    </div>
                  </div>

                  {/* Dual Action Buttons */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => navigate(`/patients/live-queue/${apt.id}`)}
                      style={{ outline: 'none' }}
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-full bg-[#4C5BBD] text-white text-xs font-black shadow-xs hover:bg-[#3B489E] transition-all border-0"
                    >
                      <span>Track Live Queue</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate(`/patients/consultation/${apt.id}`)}
                      style={{ outline: 'none' }}
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-full bg-[#F2F5FF] text-[#4C5BBD] hover:bg-[#4C5BBD] hover:text-white text-xs font-black shadow-xs transition-all border-0"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Doctor Chat</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ZERO APPOINTMENTS EMPTY STATE */
        <div className="bg-white rounded-3xl p-10 text-center border-0 shadow-xs max-w-2xl mx-auto space-y-5 font-sans">
          <div className="w-20 h-20 rounded-full bg-[#F2F5FF] text-[#4C5BBD] flex items-center justify-center mx-auto shadow-xs">
            <CalendarX className="w-10 h-10" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-xl font-black text-[#1F1F1F] font-sans">No Active OPD Appointments</h3>
            <p className="text-xs text-[#6B6E84] leading-relaxed font-medium">
              You currently have 0 active consultation bookings. Search specialist doctors and book a slot to receive your live OPD queue token.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => navigate('/doctors')}
              style={{ outline: 'none' }}
              className="inline-flex items-center gap-2.5 py-3.5 px-7 rounded-full bg-[#4C5BBD] text-white text-xs font-black shadow-xs hover:bg-[#3B489E] transition-all border-0"
            >
              <Calendar className="w-4 h-4" />
              <span>Find & Book Doctor Slot</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
