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
  const [gender, setGender] = useState('all');
  const [maxFee, setMaxFee] = useState('');
  const [sortBy, setSortBy] = useState('rating_desc');
  const [doctors, setDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    getDoctors({
      specialty,
      searchQuery,
      gender,
      maxFee: maxFee ? Number(maxFee) : null,
      sortBy,
    }).then((res) => {
      if (isMounted) {
        setDoctors(res);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [specialty, searchQuery, gender, maxFee, sortBy]);

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
    setGender('all');
    setMaxFee('');
    setSortBy('rating_desc');
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
      <div className="space-y-3 mb-6">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onClear={() => setSearchQuery('')}
          placeholder="Search by doctor name, specialty (e.g. Cardiology), or hospital..."
        />

        {/* Secondary Filter Controls (Gender, Max Fee, Sort By) */}
        <div className="flex items-center gap-3 flex-wrap text-xs font-bold text-[#6B6E84]">
          <div className="flex items-center gap-1.5 bg-white px-3 py-2 rounded-2xl shadow-xs">
            <span>Gender:</span>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              style={{ outline: 'none' }}
              className="bg-transparent text-[#1F1F1F] font-bold border-0 focus:ring-0 cursor-pointer"
            >
              <option value="all">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-white px-3 py-2 rounded-2xl shadow-xs">
            <span>Max Fee:</span>
            <select
              value={maxFee}
              onChange={(e) => setMaxFee(e.target.value)}
              style={{ outline: 'none' }}
              className="bg-transparent text-[#1F1F1F] font-bold border-0 focus:ring-0 cursor-pointer"
            >
              <option value="">Any Fee</option>
              <option value="600">Under ₹600</option>
              <option value="1000">Under ₹1000</option>
              <option value="1500">Under ₹1500</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-white px-3 py-2 rounded-2xl shadow-xs">
            <span>Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ outline: 'none' }}
              className="bg-transparent text-[#1F1F1F] font-bold border-0 focus:ring-0 cursor-pointer"
            >
              <option value="rating_desc">Highest Rated</option>
              <option value="fee_asc">Fee: Low to High</option>
              <option value="fee_desc">Fee: High to Low</option>
              <option value="experience_desc">Most Experienced</option>
            </select>
          </div>
        </div>

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
