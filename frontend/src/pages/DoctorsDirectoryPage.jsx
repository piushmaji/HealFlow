import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/ui/PageHeader';
import { SearchBar } from '../components/ui/SearchBar';
import { DoctorFilter } from '../features/doctors/DoctorFilter';
import { DoctorList } from '../features/doctors/DoctorList';
import { getDoctors } from '../services/supabase/doctorService';
import { Badge } from '../components/ui/Badge';
import { Stethoscope } from 'lucide-react';

export const DoctorsDirectoryPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialSpecialty = searchParams.get('specialty') || 'all';

  const [specialty, setSpecialty] = useState(initialSpecialty);
  const [searchQuery, setSearchQuery] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    getDoctors({ specialty, searchQuery }).then((res) => {
      if (isMounted) {
        setDoctors(res);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [specialty, searchQuery]);

  const handleSelectSpecialty = (specId) => {
    setSpecialty(specId);
    if (specId !== 'all') {
      setSearchParams({ specialty: specId });
    } else {
      setSearchParams({});
    }
  };

  const handleBookClick = (doctor) => {
    navigate(`/doctors/${doctor.id}/book`);
  };

  const handleViewDetails = (doctor) => {
    navigate(`/doctors/${doctor.id}`);
  };

  const handleClearFilters = () => {
    setSpecialty('all');
    setSearchQuery('');
    setSearchParams({});
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-8 font-sans">
      <PageHeader
        title="Find & Book Doctors"
        subtitle="Search top medical specialists and select your preferred consultation slot."
        badge={
          <Badge variant="brand" size="md" icon={Stethoscope}>
            {doctors.length} Verified Doctors
          </Badge>
        }
      />

      {/* Filters Bar */}
      <div className="space-y-4 mb-6">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onClear={() => setSearchQuery('')}
          placeholder="Search by doctor name, specialty (e.g. Cardiology), or hospital..."
        />

        <DoctorFilter
          selectedSpecialty={specialty}
          onSelectSpecialty={handleSelectSpecialty}
        />
      </div>

      {/* Doctor Cards Grid */}
      <DoctorList
        doctors={doctors}
        isLoading={isLoading}
        onBookClick={handleBookClick}
        onViewDetails={handleViewDetails}
        onClearFilter={handleClearFilters}
      />
    </div>
  );
};
