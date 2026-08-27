/**
 * AI Medical Specialist Recommendation Engine & Clinical Conversational Assistant
 * Analyzes patient symptom descriptions and maps them to appropriate specialist categories.
 * 
 * IMPORTANT: This feature provides triage category suggestions for guidance only.
 * It strictly DOES NOT provide medical diagnoses, treatment plans, or emergency services.
 */

const SYMPTOM_RULES = [
  {
    specialty: 'Cardiology',
    keywords: ['chest pain', 'palpitations', 'heartbeat', 'shortness of breath', 'high blood pressure', 'hypertension', 'angina', 'chest tightness', 'dizziness', 'lightheaded'],
    title: 'Cardiologist (Heart & Vascular Specialist)',
    explanation: 'Cardiologists specialize in evaluating symptoms related to heart rhythm, blood circulation, chest pressure, and cardiovascular health.',
    urgencyLevel: 'High',
  },
  {
    specialty: 'Dermatology',
    keywords: ['rash', 'skin', 'itching', 'acne', 'eczema', 'psoriasis', 'mole', 'hives', 'hair loss', 'scaling', 'redness', 'spots', 'lesion', 'bump'],
    title: 'Dermatologist (Skin, Hair & Nail Specialist)',
    explanation: 'Dermatologists assess cutaneous conditions, inflammatory skin reactions, rashes, moles, and scalp concerns.',
    urgencyLevel: 'Normal',
  },
  {
    specialty: 'Pediatrics',
    keywords: ['child', 'baby', 'infant', 'toddler', 'kid', 'pediatric', 'vaccination', 'growth', 'school checkup'],
    title: 'Pediatrician (Child & Adolescent Specialist)',
    explanation: 'Pediatricians specialize in early physical, emotional, and social health for children from infancy through adolescence.',
    urgencyLevel: 'Normal',
  },
  {
    specialty: 'Neurology',
    keywords: ['headache', 'migraine', 'seizure', 'numbness', 'tingling', 'tremor', 'memory loss', 'nerve pain', 'dizziness', 'paralysis', 'fainting'],
    title: 'Neurologist (Brain & Nervous System Specialist)',
    explanation: 'Neurologists treat conditions affecting the brain, spinal cord, nerves, and neuromuscular functions like severe migraines or persistent numbness.',
    urgencyLevel: 'Normal-High',
  },
  {
    specialty: 'Orthopedics',
    keywords: ['bone', 'joint', 'knee', 'back pain', 'fracture', 'sprain', 'shoulder', 'arthritis', 'ligament', 'swollen knee', 'posture', 'spine'],
    title: 'Orthopedic Specialist (Bones, Joints & Musculoskeletal)',
    explanation: 'Orthopedists manage structural musculoskeletal issues, joint stiffness, bone injuries, and sports trauma.',
    urgencyLevel: 'Normal',
  },
  {
    specialty: 'Psychiatry',
    keywords: ['anxiety', 'depression', 'stress', 'panic attack', 'insomnia', 'sleep problem', 'mood swings', 'grief', 'burnout', 'mental health'],
    title: 'Psychiatrist / Mental Wellness Specialist',
    explanation: 'Psychiatrists provide clinical support for emotional well-being, mood disturbances, panic states, anxiety, and sleep disorders.',
    urgencyLevel: 'Normal',
  },
  {
    specialty: 'ENT',
    keywords: ['ear', 'nose', 'throat', 'sinus', 'hearing loss', 'ringing ear', 'tinnitus', 'sore throat', 'tonsils', 'blocked nose', 'vertigo'],
    title: 'ENT Specialist (Ear, Nose & Throat)',
    explanation: 'ENT specialists diagnose conditions affecting the upper auditory pathways, nasal passages, sinuses, larynx, and balance organs.',
    urgencyLevel: 'Normal',
  },
];

export const analyzeSymptoms = async (description, ageGroup = 'adult', duration = 'recent') => {
  // Simulate intelligent response delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  const descLower = description.toLowerCase();

  // Search for matching specialty
  let bestMatch = null;
  let highestScore = 0;

  for (const rule of SYMPTOM_RULES) {
    let score = 0;
    for (const kw of rule.keywords) {
      if (descLower.includes(kw)) {
        score += 1;
      }
    }
    if (score > highestScore) {
      highestScore = score;
      bestMatch = rule;
    }
  }

  // Fallback to General Medicine if vague or no specific match
  if (!bestMatch || highestScore === 0) {
    return {
      specialty: 'General Medicine',
      title: 'General Practitioner / Internal Medicine',
      explanation: 'For general discomfort, fatigue, mild fever, or non-specific symptoms, consulting a General Practitioner is recommended for initial assessment and triage.',
      confidenceScore: 'General Triage',
      disclaimer: 'Based on your description, you may consider consulting a General Practitioner. This suggestion is for guidance only and is not a medical diagnosis.',
      isEmergencyWarning: descLower.includes('severe') || descLower.includes('bleeding'),
    };
  }

  const isEmergency = descLower.includes('severe chest pain') || descLower.includes('cannot breathe') || descLower.includes('unconscious');

  return {
    specialty: bestMatch.specialty,
    title: bestMatch.title,
    explanation: bestMatch.explanation,
    confidenceScore: highestScore > 1 ? 'High Match' : 'Moderate Match',
    disclaimer: `Based on your description, you may consider consulting a ${bestMatch.specialty} specialist. This suggestion is for guidance only and is not a medical diagnosis.`,
    isEmergencyWarning: isEmergency,
  };
};

export const generateAIChatResponse = async (userMessage) => {
  await new Promise((resolve) => setTimeout(resolve, 600));

  const msgLower = userMessage.toLowerCase();

  if (msgLower.includes('headache') || msgLower.includes('migraine')) {
    return {
      text: "Headaches can stem from tension, dehydration, eye strain, or migraines. If you experience severe throbbing, light sensitivity, or nausea, consulting a Neurologist is recommended.",
      suggestedSpecialty: "Neurology",
      recommendedDoctor: {
        id: 'doc-3',
        name: 'Dr. Ananya Roy',
        specialty: 'Neurology',
        hospital: 'Smart Clinic Central (Suite 401)',
        consultation_fee: 900
      },
      followUpQuestions: [
        "Is the headache localized to one side?",
        "Are you experiencing any vision disturbances?",
        "How long has this headache persisted?"
      ]
    };
  }

  if (msgLower.includes('chest') || msgLower.includes('heart') || msgLower.includes('bp') || msgLower.includes('pressure')) {
    return {
      text: "Chest discomfort or pressure should always be evaluated promptly. If accompanied by shortness of breath or arm pain, please seek immediate emergency care or consult a Senior Cardiologist.",
      suggestedSpecialty: "Cardiology",
      recommendedDoctor: {
        id: 'doc-1',
        name: 'Dr. Rajesh Sharma',
        specialty: 'Cardiology',
        hospital: 'Apollo Super Speciality Hospital (Room 302)',
        consultation_fee: 800
      },
      isEmergency: msgLower.includes('severe') || msgLower.includes('breath'),
      followUpQuestions: [
        "Does the pressure worsen during physical exertion?",
        "Do you have a history of high blood pressure?",
        "Are you feeling dizzy or lightheaded?"
      ]
    };
  }

  if (msgLower.includes('rash') || msgLower.includes('skin') || msgLower.includes('itch')) {
    return {
      text: "Skin rashes can be triggered by allergic reactions, eczema, or cutaneous infections. Avoid scratching the affected area and consult a Dermatologist for a specialized evaluation.",
      suggestedSpecialty: "Dermatology",
      recommendedDoctor: {
        id: 'doc-2',
        name: 'Dr. Priya Patel',
        specialty: 'Dermatology',
        hospital: 'Metro Skin & Cosmetic Center (Suite 105)',
        consultation_fee: 700
      },
      followUpQuestions: [
        "Is there swelling or warmth around the rash?",
        "Have you used any new soaps or medications recently?",
        "Has the rash spread to other body parts?"
      ]
    };
  }

  if (msgLower.includes('knee') || msgLower.includes('joint') || msgLower.includes('back') || msgLower.includes('pain')) {
    return {
      text: "Musculoskeletal pain in joints or back often relates to strain, arthritis, or ligament inflammation. Rest, gentle cold compress, and an Orthopedic consultation will help determine treatment.",
      suggestedSpecialty: "Orthopedics",
      recommendedDoctor: {
        id: 'doc-4',
        name: 'Dr. Vikramaditya Singh',
        specialty: 'Orthopedics',
        hospital: 'Apex Bone & Joint Hospital (Room 210)',
        consultation_fee: 1000
      },
      followUpQuestions: [
        "Did you experience a sudden injury or twist?",
        "Is there visible swelling or inability to bear weight?",
        "Does morning stiffness last more than 30 minutes?"
      ]
    };
  }

  return {
    text: `Thank you for sharing your health query: "${userMessage}". Based on medical triage guidelines, consulting a verified specialist will help assess your symptoms.`,
    suggestedSpecialty: "General Medicine",
    recommendedDoctor: {
      id: 'doc-1',
      name: 'Dr. Rajesh Sharma',
      specialty: 'Cardiology',
      hospital: 'Smart Clinic Central (Room 302)',
      consultation_fee: 800
    },
    followUpQuestions: [
      "Would you like to book an appointment with a specialist?",
      "Can you describe when these symptoms first started?",
      "Are you currently taking any prescription medications?"
    ]
  };
};
