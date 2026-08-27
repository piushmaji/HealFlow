import React from 'react';
import { DoctorCard } from './DoctorCard';
import { Loader } from '../../components/ui/Loader';
import { EmptyState } from '../../components/ui/EmptyState';
import { UserX } from 'lucide-react';

export const DoctorList = ({ doctors, isLoading, onBookClick, onViewDetails, onClearFilter }) => {
  if (isLoading) {
    return <Loader message="Searching verified specialist doctors..." size="lg" className="py-16" />;
  }

  if (!doctors || doctors.length === 0) {
    return (
      <EmptyState
        icon={UserX}
        title="No doctors found"
        description="We couldn't find any specialist doctors matching your selected filters or search terms."
        actionLabel="Reset All Filters"
        onAction={onClearFilter}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {doctors.map((doc) => (
        <DoctorCard
          key={doc.id}
          doctor={doc}
          onBookClick={onBookClick}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
};
