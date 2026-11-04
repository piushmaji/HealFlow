/**
 * HealFlow Official Self-Contained SVG Avatar Library & Generator
 * Completely offline, zero external HTTP dependencies (guaranteed to render 100% of the time).
 */

const createSvgDataUri = (bg, skin, hair, clothes, glasses = false) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
    <rect width="120" height="120" rx="32" fill="${bg}"/>
    <!-- Torso / Clothes -->
    <path d="M26 112c0-22 15-36 34-36s34 14 34 36" fill="${clothes}"/>
    <path d="M50 76h20v14c0 5.5-4.5 10-10 10s-10-4.5-10-10V76z" fill="${skin}"/>
    <!-- Neck Shadow -->
    <path d="M52 76h16v6a8 8 0 0 1-16 0V76z" fill="rgba(0,0,0,0.08)"/>
    <!-- Head -->
    <ellipse cx="60" cy="50" rx="22" ry="25" fill="${skin}"/>
    <!-- Hair -->
    <path d="${hair}" fill="#1F2937"/>
    <!-- Eyes -->
    <circle cx="51" cy="52" r="2.8" fill="#1F2937"/>
    <circle cx="69" cy="52" r="2.8" fill="#1F2937"/>
    <circle cx="52" cy="51" r="0.9" fill="#FFFFFF"/>
    <circle cx="70" cy="51" r="0.9" fill="#FFFFFF"/>
    <!-- Cheeks -->
    <circle cx="47" cy="57" r="3.5" fill="rgba(244,114,182,0.3)"/>
    <circle cx="73" cy="57" r="3.5" fill="rgba(244,114,182,0.3)"/>
    <!-- Smile -->
    <path d="M54 62c2.5 3 9.5 3 12 0" stroke="#1F2937" stroke-width="2" stroke-linecap="round" fill="none"/>
    ${glasses ? `
    <!-- Glasses -->
    <circle cx="51" cy="52" r="7" stroke="#4C5BBD" stroke-width="2" fill="none"/>
    <circle cx="69" cy="52" r="7" stroke="#4C5BBD" stroke-width="2" fill="none"/>
    <path d="M58 52h4" stroke="#4C5BBD" stroke-width="2"/>
    ` : ''}
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

// 1. Curated Patient Avatars (Self-Contained SVGs)
export const PATIENT_AVATAR_COLLECTION = [
  {
    id: 'patient-1',
    label: 'Modern Blue',
    gender: 'neutral',
    url: createSvgDataUri('#EEF2FF', '#FBD38D', 'M38 46c0-14 10-24 22-24s22 10 22 24c-5-6-14-9-22-9s-17 3-22 9z', '#4C5BBD', false),
  },
  {
    id: 'patient-2',
    label: 'Warm Peach',
    gender: 'female',
    url: createSvgDataUri('#FFF1F2', '#FED7AA', 'M36 50c0-16 11-28 24-28s24 12 24 28c0 14-4 22-7 26-2-12-1-20-1-20s-8-4-16-4-16 4-16 4-1 8-1 20c-3-4-7-12-7-26z', '#FB7185', false),
  },
  {
    id: 'patient-3',
    label: 'Emerald Mint',
    gender: 'male',
    url: createSvgDataUri('#ECFDF5', '#FCD34D', 'M37 45c2-15 11-23 23-23s21 8 23 23c-4-4-12-8-23-8s-19 4-23 8z', '#059669', true),
  },
  {
    id: 'patient-4',
    label: 'Soft Lavender',
    gender: 'female',
    url: createSvgDataUri('#F5F3FF', '#FDE047', 'M35 52c-2-18 11-28 25-28s27 10 25 28c3 14 5 22 7 28-5-8-6-18-6-18s-10-4-26-4-26 4-26 4-1 10-6 18c2-6 4-14 7-28z', '#8B5CF6', false),
  },
  {
    id: 'patient-5',
    label: 'Indigo Wave',
    gender: 'male',
    url: createSvgDataUri('#E0E7FF', '#FBCFE8', 'M38 44c1-16 10-24 22-24s21 8 22 24c-6-7-14-9-22-9s-16 2-22 9z', '#3730A3', false),
  },
  {
    id: 'patient-6',
    label: 'Sunny Amber',
    gender: 'neutral',
    url: createSvgDataUri('#FEF3C7', '#FDE68A', 'M36 48c0-15 11-26 24-26s24 11 24 26c-5-5-13-8-24-8s-19 3-24 8z', '#D97706', true),
  },
  {
    id: 'patient-7',
    label: 'Rose Chic',
    gender: 'female',
    url: createSvgDataUri('#FCE7F3', '#FED7AA', 'M36 50c-1-17 10-27 24-27s25 10 24 27c2 12 5 20 7 26-4-6-6-16-6-16s-9-4-25-4-25 4-25 4-2 10-6 16c2-6 5-14 7-26z', '#DB2777', false),
  },
  {
    id: 'patient-8',
    label: 'Teal Focus',
    gender: 'male',
    url: createSvgDataUri('#CCFBF1', '#FCD34D', 'M39 42c0-13 9-22 21-22s21 9 21 22c-5-4-12-7-21-7s-16 3-21 7z', '#0D9488', false),
  },
];

// 2. Curated Doctor Avatars (Self-Contained SVGs)
export const DOCTOR_AVATAR_COLLECTION = [
  {
    id: 'doc-1',
    label: 'Lead Cardiologist',
    url: createSvgDataUri('#EEF2FF', '#FED7AA', 'M38 44c0-14 10-24 22-24s22 10 22 24c-5-6-14-9-22-9s-17 3-22 9z', '#4C5BBD', true),
  },
  {
    id: 'doc-2',
    label: 'Consultant Physician',
    url: createSvgDataUri('#F0FDF4', '#FCD34D', 'M36 48c0-16 11-27 24-27s24 11 24 27c-5-5-13-8-24-8s-19 3-24 8z', '#16A34A', false),
  },
  {
    id: 'doc-3',
    label: 'Senior Pediatrician',
    url: createSvgDataUri('#FFF7ED', '#FDE047', 'M35 50c-1-16 11-26 25-26s25 10 25 26c1 12 4 18 6 24-4-6-6-14-6-14s-9-4-25-4-25 4-25 4-2 8-6 14c2-6 5-12 7-24z', '#EA580C', false),
  },
  {
    id: 'doc-4',
    label: 'Orthopedic Surgeon',
    url: createSvgDataUri('#F8FAFC', '#FBD38D', 'M39 42c0-13 9-22 21-22s21 9 21 22c-5-4-12-7-21-7s-16 3-21 7z', '#0284C7', true),
  },
];

/**
 * Generate a consistent, professional, non-blank default avatar URL based on user's name and role
 */
export const getDefaultAvatar = (name = '', role = 'patient') => {
  const cleanName = (name || 'HealFlow Patient').trim();
  const collection = role === 'doctor' ? DOCTOR_AVATAR_COLLECTION : PATIENT_AVATAR_COLLECTION;
  const hash = cleanName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return collection[hash % collection.length].url;
};
