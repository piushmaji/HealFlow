import React from 'react';
import { AppointmentCard } from './AppointmentCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { CalendarX } from 'lucide-react';

export const AppointmentList = ({ appointments = [], onBookNew }) => {
  if (appointments.length === 0) {
    return (
      <EmptyState
        icon={CalendarX}
        title="No appointments scheduled"
        description="You have no active or previous appointment bookings at Smart Clinic."
        actionLabel="Book a Doctor Slot"
        onAction={onBookNew}
      />
    );
  }

  return (
    <div className="flex flex-col gap-3.5 font-sans">
      {appointments.map((apt) => (
        <AppointmentCard key={apt.id} appointment={apt} />
      ))}
    </div>
  );
};
