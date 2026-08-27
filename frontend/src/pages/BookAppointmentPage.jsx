import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDoctorById } from '../services/supabase/doctorService';
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
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export const BookAppointmentPage = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const { createAppointment } = useQueue();
  const { patientUser } = useAuth();
  const { showToast } = useToast();

  const [doctor, setDoctor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [patientName, setPatientName] = useState(patientUser?.name || 'Rahul Sharma');
  const [contactNumber, setContactNumber] = useState('+91 98765 43210');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('10:30 AM');
  const [reason, setReason] = useState('Routine Cardiology Follow-up & Health Checkup');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  useEffect(() => {
    getDoctorById(doctorId).then((doc) => {
      setDoctor(doc);
      setIsLoading(false);
    });
  }, [doctorId]);

  if (isLoading) return <Loader message="Loading appointment booking workspace..." size="lg" className="py-20" />;
  if (!doctor) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center font-sans">
        <h2 className="text-xl font-bold text-[#1F1F1F]">Doctor Not Found</h2>
        <button
          onClick={() => navigate('/doctors')}
          className="mt-4 px-5 py-2.5 rounded-full bg-[#4C5BBD] text-white text-xs font-bold shadow-xs border-0"
        >
          Return to Doctor Directory
        </button>
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const newApt = createAppointment({
        doctor_id: doctor.id,
        doctor_name: doctor.name,
        specialty: doctor.specialty,
        hospital: doctor.hospital || 'Apollo Super Speciality Hospital',
        room_number: doctor.room_number || 'Room 302',
        patient_name: patientName,
        date: selectedDate,
        time: selectedTimeSlot,
        notes: reason,
      });

      showToast(`Appointment Confirmed! Token ${newApt.token_number} Issued.`, 'success');
      setTimeout(() => {
        navigate('/live-queue');
      }, 600);
    } catch (err) {
      showToast('Failed to schedule appointment. Please try again.', 'error');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10 font-sans">
      
      {/* Navigation Back Button & Status Badge (Optimized Mobile Layout) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate(`/doctors/${doctor.id}`)}
          style={{ outline: 'none' }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-[#6B6E84] hover:text-[#4C5BBD] hover:bg-[#F2F5FF] text-xs font-bold shadow-xs border-0 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Doctor Profile</span>
        </button>

        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 shadow-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Dedicated Slot Booking Page</span>
        </span>
      </div>

      {/* Main 2-Column Booking Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column: Doctor Summary & Telemetry Card (1/3 width) */}
        <div className="bg-white rounded-3xl p-6 border-0 shadow-xs space-y-6">
          <div className="flex items-start gap-4 pb-4 border-b border-slate-100">
            <img
              src={doctor.avatar_url}
              alt={doctor.name}
              className="w-20 h-20 rounded-2xl object-cover border-0 shadow-xs shrink-0"
            />
            <div className="flex-1 min-w-0">
              <span className="inline-block px-2.5 py-0.5 text-[10px] font-black uppercase text-[#4C5BBD] bg-[#F2F5FF] rounded-full mb-1">
                {doctor.specialty}
              </span>
              <h2 className="text-lg font-black text-[#1F1F1F] font-heading truncate">
                {doctor.name}
              </h2>
              <p className="text-xs text-[#6B6E84] font-semibold truncate">{doctor.title}</p>

              <div className="flex items-center gap-1 mt-1 text-xs">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="font-extrabold text-[#1F1F1F]">{doctor.rating}</span>
                <span className="text-[#6B6E84]">({doctor.review_count} ratings)</span>
              </div>
            </div>
          </div>

          {/* Doctor Telemetry Details */}
          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-[#F8FAFE] border-0 shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-[#6B6E84] uppercase tracking-wider">Clinic Name</span>
              <p className="font-black text-[#1F1F1F] text-xs">{doctor.hospital || 'Apollo Super Speciality Hospital'}</p>
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
          <div className="pb-4 border-b border-slate-100">
            <h2 className="text-xl font-black text-[#1F1F1F] font-heading tracking-wide">
              Select Appointment Slot & Details
            </h2>
            <p className="text-xs text-[#6B6E84] mt-0.5 font-medium">
              Fill in your consultation details to confirm your slot and receive a live OPD queue token.
            </p>
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

            {/* Custom Themed DatePicker Component */}
            <DatePicker
              selectedDate={selectedDate}
              onChange={setSelectedDate}
              label="Select Preferred Date"
            />

            {/* Time Slot Picker Grid */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#1F1F1F] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#4C5BBD]" />
                <span>Select Available Time Slot</span>
              </label>

              <div className="grid grid-cols-3 sm:grid-cols-3 gap-2.5">
                {availableTimeSlots.map((slot) => {
                  const isSelected = selectedTimeSlot === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedTimeSlot(slot)}
                      style={{ outline: 'none' }}
                      className={`py-3 px-3 rounded-2xl text-xs font-bold transition-all shadow-xs border-0 ${
                        isSelected
                          ? 'bg-[#4C5BBD] text-white font-black shadow-xs'
                          : 'bg-[#F8FAFE] text-[#1F1F1F] hover:bg-[#F2F5FF] hover:text-[#4C5BBD]'
                      }`}
                    >
                      {slot}
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
                className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-full bg-[#4C5BBD] text-white text-sm font-black shadow-xs hover:bg-[#3B489E] transition-all border-0 disabled:opacity-50"
              >
                <Ticket className="w-4 h-4" />
                <span>{isSubmitting ? 'Issuing Token...' : 'Confirm Slot & Get OPD Queue Token'}</span>
              </button>
            </div>

          </form>
        </div>

      </div>

    </div>
  );
};
