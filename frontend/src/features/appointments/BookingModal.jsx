import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { DoctorSchedule } from '../doctors/DoctorSchedule';
import { useQueue } from '../../context/QueueContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatters';
import { Calendar, User, Phone, FileText, CheckCircle2, Ticket } from 'lucide-react';

export const BookingModal = ({ doctor, isOpen, onClose }) => {
  const navigate = useNavigate();
  const { addAppointment } = useQueue();
  const { patientUser } = useAuth();

  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState(doctor?.slots?.[0] || '09:00 AM');
  const [isInstantDemo, setIsInstantDemo] = useState(false);
  const [reason, setReason] = useState('');
  const [patientName, setPatientName] = useState(patientUser.name);
  const [patientPhone, setPatientPhone] = useState(patientUser.phone);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!doctor) return null;

  const handleToggleInstantDemo = () => {
    const nextState = !isInstantDemo;
    setIsInstantDemo(nextState);
    if (nextState) {
      setSelectedDate(new Date().toISOString().split('T')[0]);
      setSelectedSlot('Instant Demo (Immediate)');
      if (!reason) setReason('Instant Presentation / Live Demonstration');
    } else {
      setSelectedSlot(doctor?.slots?.[0] || '09:00 AM');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const newApt = addAppointment({
        doctor_id: doctor.id,
        doctor_name: doctor.name,
        doctor_avatar: doctor.avatar_url,
        specialty: doctor.specialty,
        room_number: doctor.room_number,
        patient_name: patientName,
        patient_email: patientUser.email,
        patient_phone: patientPhone,
        date: selectedDate,
        time: isInstantDemo ? 'Instant Demo (Immediate)' : selectedSlot,
        is_demo: isInstantDemo,
        is_instant: isInstantDemo,
        reason: reason || (isInstantDemo ? 'Instant Presentation Demo' : 'General Health Consultation'),
        consultation_fee: doctor.consultation_fee,
      });

      setIsSubmitting(false);
      onClose();
      // Redirect directly to the Live Queue page to track position
      navigate('/live-queue');
    }, 600);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Book Doctor Appointment"
      subtitle={`Reserve your consultation slot with ${doctor.name}`}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Doctor Banner */}
        <div className="flex items-center gap-3 p-3.5 bg-brand-50/70 rounded-xl border border-brand-200">
          <img
            src={doctor.avatar_url}
            alt={doctor.name}
            className="w-12 h-12 rounded-full object-cover border-2 border-brand-500 shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-slate-900">{doctor.name}</h4>
            <p className="text-xs text-brand-700 font-semibold">{doctor.specialty} • {doctor.room_number}</p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Consultation Fee</span>
            <p className="text-base font-extrabold text-slate-900">{formatCurrency(doctor.consultation_fee)}</p>
          </div>
        </div>

        {/* Schedule Selector */}
        <DoctorSchedule
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          selectedSlot={selectedSlot}
          onSelectSlot={setSelectedSlot}
          availableSlots={doctor.slots}
          isInstantDemo={isInstantDemo}
          onToggleInstantDemo={handleToggleInstantDemo}
        />

        {/* Patient Details */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Patient Contact Details</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Patient Full Name"
              icon={User}
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              required
            />
            <Input
              label="Phone Number"
              icon={Phone}
              value={patientPhone}
              onChange={(e) => setPatientPhone(e.target.value)}
              required
            />
          </div>
          <Input
            label="Chief Medical Concern / Reason for Visit"
            icon={FileText}
            placeholder="e.g. Skin rash on left arm, persistent headache, checkup"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        {/* Live Queue Token Notice */}
        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center gap-2.5">
          <Ticket className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            Upon confirmation, a <strong>Live Queue Token</strong> will be assigned automatically. You can track your turn in real time on the Live Queue tracker.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" icon={CheckCircle2} isLoading={isSubmitting}>
            Confirm & Issue Queue Token
          </Button>
        </div>
      </form>
    </Modal>
  );
};
