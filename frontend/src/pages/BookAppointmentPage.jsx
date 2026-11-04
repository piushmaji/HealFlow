import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDoctorById, getDoctorDaySchedule } from '../services/supabase/doctorService';
import { fetchDoctorWorkloadFromBackend } from '../services/doctorBackendService';
import { useQueue } from '../context/QueueContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Loader } from '../components/ui/Loader';
import { DatePicker } from '../components/ui/DatePicker';
import {
  Calendar,
  Clock,
  MapPin,
  Star,
  Award,
  ArrowLeft,
  CheckCircle2,
  Stethoscope,
  ShieldCheck,
  User,
  Phone,
  FileText,
  Ticket,
  Activity,
  Users,
  AlertTriangle,
  Flame,
  Info,
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export const BookAppointmentPage = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const { createAppointment, refreshAppointments } = useQueue();
  const { patientUser } = useAuth();
  const { showToast } = useToast();

  const [doctor, setDoctor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [patientName, setPatientName] = useState(patientUser?.name || '');
  const [contactNumber, setContactNumber] = useState(patientUser?.phone || '');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('10:30 AM');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic Live Schedule & Queue Telemetry from Supabase DB & Backend
  const [daySchedule, setDaySchedule] = useState({
    totalBookings: 0,
    waitingInQueue: 0,
    servingToken: null,
    isDoctorBusy: false,
    busyLevel: 'Available',
    estimatedWaitMins: 0,
    bookedSlots: [],
    slotQueues: {},
    queueStatus: 'ACTIVE',
    isCurrentlyOnCall: false,
    currentPatientName: null,
    liveStatus: 'Available',
    statusDescription: 'Doctor is ready in OPD chamber.',
  });
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(false);

  const availableTimeSlots = [
    '09:00 AM',
    '09:30 AM',
    '10:00 AM',
    '10:30 AM',
    '11:15 AM',
    '02:00 PM',
    '02:45 PM',
    '03:30 PM',
    '04:15 PM',
  ];

  // 1. Fetch Doctor details
  useEffect(() => {
    getDoctorById(doctorId).then((doc) => {
      setDoctor(doc);
      setIsLoading(false);
    });
  }, [doctorId]);

  // 2. Fetch Dynamic Queue & Day Schedule from Supabase & Backend whenever Date or Doctor changes
  useEffect(() => {
    if (!doctorId) return;
    setIsLoadingSchedule(true);

    const loadWorkload = async () => {
      try {
        // Try backend workload first
        const backendWorkload = await fetchDoctorWorkloadFromBackend(doctorId, selectedDate);
        if (backendWorkload) {
          setDaySchedule((prev) => ({
            ...prev,
            ...backendWorkload,
            isDoctorBusy: backendWorkload.isCurrentlyOnCall || backendWorkload.waitingInQueue >= 3,
            busyLevel: backendWorkload.isCurrentlyOnCall ? 'In Call' : backendWorkload.liveStatus,
          }));
          setIsLoadingSchedule(false);
          return;
        }
      } catch (err) {
        console.warn('Backend workload fetch notice:', err.message);
      }

      // Supabase direct fallback
      getDoctorDaySchedule(doctorId, selectedDate)
        .then((sched) => {
          setDaySchedule(sched);
        })
        .catch((err) => {
          console.warn('Day schedule fetch notice:', err.message);
        })
        .finally(() => {
          setIsLoadingSchedule(false);
        });
    };

    loadWorkload();
    const timer = setInterval(loadWorkload, 5000);
    return () => clearInterval(timer);
  }, [doctorId, selectedDate]);

  if (isLoading) return <Loader message="Loading appointment booking workspace..." size="lg" className="py-20" />;
  if (!doctor) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center font-sans">
        <h2 className="text-xl font-bold text-[#1F1F1F]">Doctor Not Found</h2>
        <button
          onClick={() => navigate('/doctors')}
          className="mt-4 px-5 py-2.5 rounded-full bg-[#4C5BBD] text-white text-xs font-bold shadow-xs border-0 cursor-pointer"
        >
          Return to Doctor Directory
        </button>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const newApt = await createAppointment({
        doctor_id: doctor.id,
        doctor_name: doctor.name,
        specialty: doctor.specialty,
        hospital: doctor.hospital || 'Smart Clinic',
        room_number: doctor.room_number || 'Room 101',
        patient_name: patientName || patientUser?.name || 'Patient',
        patient_email: patientUser?.email || '',
        patient_phone: contactNumber || patientUser?.phone || '',
        date: selectedDate,
        time: selectedTimeSlot,
        reason: reason || null,
        notes: reason || null,
      });

      // Refetch appointments in background so patient dashboard updates immediately
      if (refreshAppointments) {
        refreshAppointments().catch(() => {});
      }

      showToast(`Appointment Confirmed! Token ${newApt.token_number} Issued.`, 'success');
      setTimeout(() => {
        navigate(`/patients/dashboard`);
      }, 700);
    } catch (err) {
      showToast('Booking failed: ' + (err.message || 'Error occurred'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Busy badge colors & on-call indicators
  const getBusyBadge = () => {
    if (daySchedule.isCurrentlyOnCall) {
      return {
        text: 'Doctor is In Call / Consultation',
        bg: 'bg-rose-50 text-rose-700 border-rose-200',
        icon: AlertTriangle,
        detail: daySchedule.statusDescription || 'Attending active patient consultation now.',
      };
    }
    switch (daySchedule.busyLevel) {
      case 'Fully Booked':
        return { text: 'Fully Booked', bg: 'bg-rose-50 text-rose-700 border-rose-200', icon: AlertTriangle, detail: 'Queue is packed for this date.' };
      case 'High Demand':
      case 'High Demand / Busy':
        return { text: 'High Demand / Busy', bg: 'bg-amber-50 text-amber-700 border-amber-200', icon: Flame, detail: 'Multiple patients in waiting queue.' };
      case 'Moderate':
      case 'Attending Queue':
        return { text: 'Attending Queue', bg: 'bg-blue-50 text-blue-700 border-blue-200', icon: Activity, detail: 'Patient consultations underway.' };
      default:
        return { text: 'Available Now', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2, detail: 'Doctor is ready in OPD chamber.' };
    }
  };

  const badgeInfo = getBusyBadge();
  const BadgeIcon = badgeInfo.icon;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 font-sans">
      
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{ outline: 'none' }}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-[#F2F5FF] text-xs font-bold text-[#1F1F1F] shadow-xs border-0 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Doctors</span>
        </button>

        <span className="text-xs text-[#6B6E84] font-medium hidden sm:inline">
          Home / Doctors / <span className="text-[#4C5BBD] font-bold">{doctor.name}</span> / Book Slot
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column: Doctor Profile Card + Dynamic Live Queue Telemetry (1/3 width) */}
        <div className="bg-white rounded-3xl p-6 border-0 shadow-xs space-y-5">
          <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
            <img
              src={doctor.avatar_url || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400'}
              alt={doctor.name}
              className="w-16 h-16 rounded-2xl object-cover shadow-xs border-2 border-white"
            />
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#4C5BBD]/10 text-[#4C5BBD]">
                {doctor.specialty}
              </span>
              <h1 className="text-base font-black text-[#1F1F1F] font-heading">{doctor.name}</h1>
              <div className="flex items-center gap-1.5 text-xs">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="font-extrabold text-[#1F1F1F]">{doctor.rating}</span>
                <span className="text-[#6B6E84]">({doctor.review_count} ratings)</span>
              </div>
            </div>
          </div>

          {/* DYNAMIC LIVE QUEUE & DOCTOR WORKLOAD TELEMETRY (REAL DATA FROM SUPABASE) */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#F8FAFE] to-[#F2F5FF] border border-[#CEDEFF]/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#4C5BBD] flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" />
                <span>Live OPD Telemetry ({selectedDate})</span>
              </span>
              {isLoadingSchedule && (
                <span className="text-[10px] text-[#4C5BBD] animate-pulse font-bold">Syncing...</span>
              )}
            </div>

            {/* Workload Status Badge */}
            <div className={`p-3 rounded-2xl border-0 shadow-xs flex flex-col gap-1 text-xs ${badgeInfo.bg}`}>
              <div className="flex items-center gap-2 font-black">
                <BadgeIcon className="w-4 h-4 shrink-0" />
                <span>{badgeInfo.text}</span>
              </div>
              <p className="text-[11px] font-medium opacity-90 leading-tight">
                {badgeInfo.detail}
              </p>
            </div>

            {/* Real Stats Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-white rounded-2xl shadow-xs">
                <p className="text-[10px] text-[#6B6E84] font-medium">Patients in Queue</p>
                <p className="text-sm font-black text-[#1F1F1F] flex items-center gap-1 mt-0.5">
                  <Users className="w-3.5 h-3.5 text-[#4C5BBD]" />
                  <span>{daySchedule.waitingInQueue} Waiting</span>
                </p>
              </div>

              <div className="p-3 bg-white rounded-2xl shadow-xs">
                <p className="text-[10px] text-[#6B6E84] font-medium">Your Turn In</p>
                <p className="text-sm font-black text-[#1F1F1F] flex items-center gap-1 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>~{daySchedule.estimatedWaitMins} mins</span>
                </p>
              </div>
            </div>

            {daySchedule.currentToken && (
              <div className="p-2.5 rounded-2xl bg-white flex items-center justify-between text-[11px] font-bold text-[#1F1F1F] shadow-xs">
                <span className="text-[#6B6E84]">Now Serving Token:</span>
                <span className="font-mono text-[#4C5BBD] font-black">{daySchedule.currentToken}</span>
              </div>
            )}
          </div>

          {/* Doctor Telemetry Details */}
          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-[#F8FAFE] border-0 shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-[#6B6E84] uppercase tracking-wider">Hospital & OPD Room</span>
              <p className="font-black text-[#1F1F1F] text-xs">
                {doctor.hospital || 'Apollo Super Speciality Hospital'} • {doctor.room_number || 'Room 101'}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F8FAFE] border-0 shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-[#6B6E84] uppercase tracking-wider">Destination Location</span>
              <p className="font-bold text-[#1F1F1F] text-xs flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#4C5BBD] shrink-0" />
                <span>{doctor.location || 'Ameerpet, Hyderabad, Telangana'}</span>
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F8FAFE] border-0 shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-[#6B6E84] uppercase tracking-wider">Clinical Experience</span>
              <p className="font-bold text-[#1F1F1F] text-xs flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-[#4C5BBD] shrink-0" />
                <span>{doctor.experience_years}+ Years Active Medical Practice</span>
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F8FAFE] border-0 shadow-xs flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#6B6E84] uppercase tracking-wider">Consultation Fee</span>
              <span className="text-lg font-black text-[#4C5BBD] font-sans">{formatCurrency(doctor.consultation_fee)}</span>
            </div>
          </div>

        </div>

        {/* Right Column: Dedicated Interactive Booking Form (2/3 width) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border-0 shadow-xs space-y-6">
          <div className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-black text-[#1F1F1F] font-heading tracking-wide">
                Select Appointment Slot & Details
              </h2>
              <p className="text-xs text-[#6B6E84] mt-0.5 font-medium">
                Live queue numbers and doctor availability are dynamically fetched from the database.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Patient Info Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1F1F1F] flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#4C5BBD]" />
                  <span>Patient Full Name</span>
                </label>
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="Enter patient full name"
                  style={{ outline: 'none', boxShadow: 'none' }}
                  className="w-full bg-[#F8FAFE] border-0 rounded-2xl px-4 py-3 text-xs text-[#1F1F1F] font-semibold shadow-xs focus:bg-white transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1F1F1F] flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#4C5BBD]" />
                  <span>Contact Phone Number</span>
                </label>
                <input
                  type="text"
                  required
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="Enter contact number"
                  style={{ outline: 'none', boxShadow: 'none' }}
                  className="w-full bg-[#F8FAFE] border-0 rounded-2xl px-4 py-3 text-xs text-[#1F1F1F] font-semibold shadow-xs focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Custom Themed DatePicker Component with real-time day sync */}
            <DatePicker
              selectedDate={selectedDate}
              onChange={(newDate) => {
                setSelectedDate(newDate);
              }}
              label="Select Preferred Date"
            />

            {/* Time Slot Picker Grid with Dynamic Queue Depths per Slot */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#1F1F1F] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#4C5BBD]" />
                  <span>Select Available Time Slot</span>
                </label>
                <span className="text-[10px] text-[#6B6E84] font-medium">
                  {daySchedule.totalBookings} booked on this date
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {availableTimeSlots.map((slot) => {
                  const isSelected = selectedTimeSlot === slot;
                  const queueInSlot = daySchedule.slotQueues[slot] || 0;
                  const isSlotCrowded = queueInSlot >= 3;

                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedTimeSlot(slot)}
                      style={{ outline: 'none' }}
                      className={`py-3 px-3 rounded-2xl text-xs font-bold transition-all shadow-xs border-0 cursor-pointer flex flex-col items-center justify-center gap-1 ${
                        isSelected
                          ? 'bg-[#4C5BBD] text-white font-black shadow-xs'
                          : 'bg-[#F8FAFE] text-[#1F1F1F] hover:bg-[#F2F5FF] hover:text-[#4C5BBD]'
                      }`}
                    >
                      <span>{slot}</span>
                      <span
                        className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-md ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : isSlotCrowded
                            ? 'bg-amber-100 text-amber-800'
                            : queueInSlot > 0
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {queueInSlot === 0 ? 'No queue' : `${queueInSlot} in line`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Consultation Reason / Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1F1F1F] flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#4C5BBD]" />
                <span>Reason for Visit / Symptoms (Optional)</span>
              </label>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Describe any symptoms or reasons for visit..."
                style={{ outline: 'none', boxShadow: 'none' }}
                className="w-full bg-[#F8FAFE] border-0 rounded-2xl p-4 text-xs text-[#1F1F1F] font-medium shadow-xs focus:bg-white transition-all resize-none"
              ></textarea>
            </div>

            {/* Submit Confirmation Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                style={{ outline: 'none' }}
                className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-full bg-[#4C5BBD] text-white text-sm font-black shadow-xs hover:bg-[#3B489E] transition-all border-0 disabled:opacity-50 cursor-pointer"
              >
                <Ticket className="w-4 h-4" />
                <span>{isSubmitting ? 'Issuing Token in Database...' : 'Confirm Slot & Get OPD Queue Token'}</span>
              </button>
            </div>

          </form>
        </div>

      </div>

    </div>
  );
};
