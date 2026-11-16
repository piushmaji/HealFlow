import crypto from 'crypto';
import { supabase } from '../server/config/supabase.js';

const hashPassword = (password) => {
  return crypto.createHash('sha256').update(`healflow_salt_${password}`).digest('hex');
};

const doctorsData = [
  {
    name: 'Dr. Ananya Roy',
    email: 'ananya.roy@healflow.in',
    password: 'Doctor@123',
    phone: '9876543201',
    title: 'MBBS, MD (Cardiology)',
    specialty: 'Cardiology',
    experience_years: 12,
    hospital: 'HealFlow Heart Institute (Room 102)',
    rating: 4.95,
    review_count: 88,
    consultation_fee: 600,
    room_number: 'Room 102',
    languages: ['English', 'Hindi', 'Bengali'],
    consultation_mode: ['In-person', 'Video'],
    bio: 'Senior Interventional Cardiologist specializing in preventive cardiology, coronary artery disease, and hypertension telemetry.',
    avatar_color: '%230284C7'
  },
  {
    name: 'Dr. Rajesh K. Varma',
    email: 'rajesh.varma@healflow.in',
    password: 'Doctor@123',
    phone: '9876543202',
    title: 'MBBS, MD, DNB (General Medicine)',
    specialty: 'General Medicine',
    experience_years: 15,
    hospital: 'HealFlow Central Clinic (Room 103)',
    rating: 4.88,
    review_count: 142,
    consultation_fee: 400,
    room_number: 'Room 103',
    languages: ['English', 'Hindi'],
    consultation_mode: ['In-person', 'Video'],
    bio: 'Chief Consultant Physician with extensive expertise in chronic disease management, fever triage, diabetes, and metabolic health.',
    avatar_color: '%2310B981'
  },
  {
    name: 'Dr. Sneha Patel',
    email: 'sneha.patel@healflow.in',
    password: 'Doctor@123',
    phone: '9876543203',
    title: 'MBBS, MD (Dermatology, Venereology & Leprosy)',
    specialty: 'Dermatology',
    experience_years: 8,
    hospital: 'HealFlow Aesthetics & Skin Center (Room 201)',
    rating: 4.92,
    review_count: 96,
    consultation_fee: 550,
    room_number: 'Room 201',
    languages: ['English', 'Hindi', 'Gujarati'],
    consultation_mode: ['In-person', 'Video'],
    bio: 'Consultant Dermatologist and Trichologist specializing in clinical dermatology, acne, psoriasis, allergic eczema, and laser skin care.',
    avatar_color: '%23EC4899'
  },
  {
    name: 'Dr. Vikram Malhotra',
    email: 'vikram.malhotra@healflow.in',
    password: 'Doctor@123',
    phone: '9876543204',
    title: 'MBBS, MS (Orthopedics), M.Ch',
    specialty: 'Orthopedics',
    experience_years: 14,
    hospital: 'HealFlow Bone & Joint Center (Room 202)',
    rating: 4.89,
    review_count: 110,
    consultation_fee: 650,
    room_number: 'Room 202',
    languages: ['English', 'Hindi', 'Punjabi'],
    consultation_mode: ['In-person', 'Video'],
    bio: 'Orthopedic Surgeon with expertise in joint replacement, sports injury rehabilitation, arthroscopy, and spine disorders.',
    avatar_color: '%23F59E0B'
  },
  {
    name: 'Dr. Meera Nambiar',
    email: 'meera.nambiar@healflow.in',
    password: 'Doctor@123',
    phone: '9876543205',
    title: 'MBBS, MD (Pediatrics), DCH',
    specialty: 'Pediatrics',
    experience_years: 10,
    hospital: 'HealFlow Child Health & OPD (Room 104)',
    rating: 4.96,
    review_count: 125,
    consultation_fee: 450,
    room_number: 'Room 104',
    languages: ['English', 'Hindi', 'Malayalam'],
    consultation_mode: ['In-person', 'Video'],
    bio: 'Compassionate Pediatric Specialist dedicated to child nutrition, neonatal triage, routine vaccinations, and developmental milestones.',
    avatar_color: '%238B5CF6'
  },
  {
    name: 'Dr. Rohan Sengupta',
    email: 'rohan.sengupta@healflow.in',
    password: 'Doctor@123',
    phone: '9876543206',
    title: 'MBBS, MD, DM (Neurology)',
    specialty: 'Neurology',
    experience_years: 11,
    hospital: 'HealFlow Neuro Sciences Clinic (Room 205)',
    rating: 4.94,
    review_count: 79,
    consultation_fee: 700,
    room_number: 'Room 205',
    languages: ['English', 'Hindi', 'Bengali'],
    consultation_mode: ['In-person', 'Video'],
    bio: 'Consultant Neurologist focusing on migraines, stroke management, peripheral neuropathies, sleep disorders, and seizure evaluations.',
    avatar_color: '%236366F1'
  },
  {
    name: 'Dr. Kavita Deshmukh',
    email: 'kavita.deshmukh@healflow.in',
    password: 'Doctor@123',
    phone: '9876543207',
    title: 'MBBS, DNB (Internal Medicine)',
    specialty: 'General Medicine',
    experience_years: 9,
    hospital: 'HealFlow Family Care OPD (Room 105)',
    rating: 4.87,
    review_count: 64,
    consultation_fee: 400,
    room_number: 'Room 105',
    languages: ['English', 'Hindi', 'Marathi'],
    consultation_mode: ['In-person', 'Video'],
    bio: 'General Physician focusing on preventive health checkups, geriatric medicine, seasonal viral infections, and lifestyle diseases.',
    avatar_color: '%2314B8A6'
  },
  {
    name: 'Dr. Aditya Joshi',
    email: 'aditya.joshi@healflow.in',
    password: 'Doctor@123',
    phone: '9876543208',
    title: 'MBBS, MD (Dermatology)',
    specialty: 'Dermatology',
    experience_years: 7,
    hospital: 'HealFlow Skin Care Center (Room 203)',
    rating: 4.91,
    review_count: 58,
    consultation_fee: 500,
    room_number: 'Room 203',
    languages: ['English', 'Hindi'],
    consultation_mode: ['In-person', 'Video'],
    bio: 'Specialist in inflammatory skin diseases, allergic dermatitis, scalp disorders, and modern non-invasive dermatological therapies.',
    avatar_color: '%23F43F5E'
  },
  {
    name: 'Dr. Sanjay Nair',
    email: 'sanjay.nair@healflow.in',
    password: 'Doctor@123',
    phone: '9876543209',
    title: 'MBBS, MS (Ortho), Fellowship in Arthroplasty',
    specialty: 'Orthopedics',
    experience_years: 13,
    hospital: 'HealFlow Joint Health (Room 204)',
    rating: 4.90,
    review_count: 83,
    consultation_fee: 600,
    room_number: 'Room 204',
    languages: ['English', 'Hindi', 'Malayalam'],
    consultation_mode: ['In-person', 'Video'],
    bio: 'Senior Orthopedic Surgeon focusing on knee and hip reconstruction, ligament repair, arthritis, and geriatric mobility care.',
    avatar_color: '%23D97706'
  },
  {
    name: 'Dr. Sunita Bansal',
    email: 'sunita.bansal@healflow.in',
    password: 'Doctor@123',
    phone: '9876543210',
    title: 'MBBS, MD (Pediatrics)',
    specialty: 'Pediatrics',
    experience_years: 16,
    hospital: 'HealFlow Childrens Wellness Wing (Room 106)',
    rating: 4.97,
    review_count: 175,
    consultation_fee: 500,
    room_number: 'Room 106',
    languages: ['English', 'Hindi'],
    consultation_mode: ['In-person', 'Video'],
    bio: 'Senior Pediatrician and Child Specialist with extensive clinical experience in adolescent health, pediatric allergies, and infectious illnesses.',
    avatar_color: '%23A855F7'
  }
];

function generateDoctorAvatarSvg(fullName, colorHex) {
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120"><rect width="120" height="120" rx="32" fill="%23F8FAFC"/><path d="M26 112c0-22 15-36 34-36s34 14 34 36" fill="${colorHex}"/><path d="M50 76h20v14c0 5.5-4.5 10-10 10s-10-4.5-10-10V76z" fill="%23FED7AA"/><path d="M52 76h16v6a8 8 0 0 1-16 0V76z" fill="rgba(0,0,0,0.08)"/><ellipse cx="60" cy="50" rx="22" ry="25" fill="%23FED7AA"/><path d="M38 44c1-16 10-24 22-24s21 8 22 24c-6-7-14-9-22-9s-16 2-22 9z" fill="%231F2937"/><circle cx="51" cy="52" r="2.8" fill="%231F2937"/><circle cx="69" cy="52" r="2.8" fill="%231F2937"/><circle cx="52" cy="51" r="0.9" fill="%23FFFFFF"/><circle cx="70" cy="51" r="0.9" fill="%23FFFFFF"/><path d="M54 62c2.5 3 9.5 3 12 0" stroke="%231F2937" stroke-width="2" stroke-linecap="round" fill="none"/></svg>`;
}

async function seed() {
  console.log('Seeding 10 Verified Doctor Profiles into Supabase Database...');
  let count = 0;

  for (const doc of doctorsData) {
    const pwdHash = hashPassword(doc.password);
    const rawAvatar = generateDoctorAvatarSvg(doc.name, doc.avatar_color);
    const avatarWithHash = `${rawAvatar}<!--AUTH_HASH:${pwdHash}-->`;

    // 1. Check or insert profile
    const { data: existingProf } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', doc.email.toLowerCase())
      .maybeSingle();

    const profileId = existingProf?.id || crypto.randomUUID();

    const { data: prof, error: profErr } = await supabase
      .from('profiles')
      .upsert({
        id: profileId,
        full_name: doc.name,
        email: doc.email.toLowerCase(),
        phone: doc.phone,
        role: 'doctor',
        avatar_url: avatarWithHash
      }, { onConflict: 'id' })
      .select()
      .single();

    if (profErr) {
      console.error(`Error saving profile for ${doc.name}:`, profErr);
      continue;
    }

    const actualProfileId = prof.id;

    // 2. Check or insert doctor record
    const { data: existingDoc } = await supabase
      .from('doctors')
      .select('id')
      .eq('profile_id', actualProfileId)
      .maybeSingle();

    const docId = existingDoc?.id || crypto.randomUUID();

    const { data: docRecord, error: docErr } = await supabase
      .from('doctors')
      .upsert({
        id: docId,
        profile_id: actualProfileId,
        name: doc.name,
        title: doc.title,
        specialty: doc.specialty,
        experience_years: doc.experience_years,
        hospital: doc.hospital,
        rating: doc.rating,
        review_count: doc.review_count,
        consultation_fee: doc.consultation_fee,
        room_number: doc.room_number,
        avatar_url: rawAvatar,
        bio: doc.bio,
        is_active: true,
        languages: doc.languages,
        consultation_mode: doc.consultation_mode,
        accepts_new_patients: true
      }, { onConflict: 'id' })
      .select()
      .single();

    if (docErr) {
      console.error(`Error saving doctor entry for ${doc.name}:`, docErr);
      continue;
    }

    // 3. Create active queue for this doctor
    const { data: existingQ } = await supabase
      .from('queues')
      .select('id')
      .eq('doctor_id', docRecord.id)
      .maybeSingle();

    const qId = existingQ?.id || crypto.randomUUID();

    await supabase.from('queues').upsert({
      id: qId,
      doctor_id: docRecord.id,
      current_token: `${doc.specialty.slice(0, 3).toUpperCase()}-001`,
      serving_patient: 'Chamber Ready',
      total_in_queue: Math.floor(Math.random() * 3) + 1,
      status: 'ACTIVE',
      last_updated: new Date().toISOString()
    }, { onConflict: 'id' });

    count++;
    console.log(`✅ [${count}/10] ${doc.name} (${doc.specialty}) — ${doc.email} saved.`);
  }

  console.log(`\n🎉 Successfully inserted ${count} doctor profiles into the database!`);
}

seed().catch(console.error);
