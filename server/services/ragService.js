/**
 * Full RAG Orchestration Service
 * Integrates Safety Checks, Vector Retrieval, Gemini Generation, and Real Doctor Matching.
 */
import { genAI, GEMINI_CHAT_MODEL } from '../config/gemini.js';
import { assessEmergency } from './safetyService.js';
import { retrieveRelevantContext } from './retrievalService.js';
import { getMatchingDoctors } from './doctorMatchingService.js';
import { detectLanguage } from '../utils/languageDetector.js';
import { buildRAGPrompt } from '../utils/promptBuilder.js';

// Regex patterns for conversational greetings, gratitude, and small talk
const GREETING_PATTERNS = [
  /^(hi|hello|hey|hiya|howdy|hola|yo)(\s+there|\s+bot|\s+doc|\s+doctor|\s+healflow)?[\s!.,?]*$/i,
  /^(namaste|namaskar|pranam|ram\s*ram|salaam|sasrikal)[\s!.,?]*$/i,
  /^(good\s+(morning|afternoon|evening|night|day))[\s!.,?]*$/i,
  /^(kaise\s+ho|kaisa\s+hai|kya\s+haal\s+hai|sab\s+theek|aap\s+kaise\s+hain)[\s!.,?]*$/i,
  /^(how\s+are\s+you|how\s+do\s+you\s+do|how\'s\s+it\s+going|what\'s\s+up|sup)[\s!.,?]*$/i,
  /^(who\s+are\s+you|what\s+can\s+you\s+do|help\s*me|tell\s+me\s+about\s+yourself)[\s!.,?]*$/i,
  /^(thanks|thank\s+you|dhanyawad|shukriya|thx|ty)[\s!.,?]*$/i,
  /^(bye|goodbye|see\s+you|alvida|tata)[\s!.,?]*$/i,
  /^(ok|okay|theek\s+hai|thik\s+h|accha|acha)[\s!.,?]*$/i,
];

export const isCasualGreeting = (text) => {
  const trimmed = text.trim();
  if (trimmed.length === 0) return true;
  return GREETING_PATTERNS.some((pattern) => pattern.test(trimmed));
};

export const getGreetingResponse = (lang) => {
  if (lang === 'hi') {
    return {
      message: 'नमस्ते! मैं आपका हीलफ्लो एआई स्पेशलिस्ट गाइड हूँ। आज मैं आपके स्वास्थ्य से जुड़ी क्या सहायता कर सकता हूँ? आप अपनी परेशानी या लक्षण साझा कर सकते हैं।',
      language: 'hi',
      suggested_specialty: null,
      specialty_reason: null,
      emergency: false,
      emergency_message: null,
      emergency_contact: null,
      show_doctors: false,
      doctors: [],
    };
  }

  if (lang === 'hinglish') {
    return {
      message: 'Hello! Main aapka Healflow AI Specialist Guide hoon. Aaj main aapki health se judi kya madad kar sakta hoon? Aap apne symptoms ya queries mere saath share kar sakte hain.',
      language: 'hinglish',
      suggested_specialty: null,
      specialty_reason: null,
      emergency: false,
      emergency_message: null,
      emergency_contact: null,
      show_doctors: false,
      doctors: [],
    };
  }

  return {
    message: 'Hello! I am your Healflow AI Specialist Guide. How can I assist you with your health today? Feel free to describe any symptoms or ask about our medical specialties.',
    language: 'en',
    suggested_specialty: null,
    specialty_reason: null,
    emergency: false,
    emergency_message: null,
    emergency_contact: null,
    show_doctors: false,
    doctors: [],
  };
};

export const processChatMessage = async (userMessage) => {
  const query = (userMessage || '').trim();
  if (!query) {
    return {
      message: 'Please describe your symptoms or ask a medical query.',
      language: 'en',
      suggested_specialty: null,
      emergency: false,
      show_doctors: false,
      doctors: [],
    };
  }

  // 1. Language Detection
  const lang = detectLanguage(query);

  // 2. CASUAL GREETING & CONVERSATION CHECK:
  // If the user says "hey", "hello", "kaise ho", "thank you", don't triage as medical condition
  if (isCasualGreeting(query)) {
    return getGreetingResponse(lang);
  }

  // 3. CRITICAL SAFETY CHECK: Deterministic Emergency Detection
  const emergencyCheck = assessEmergency(query);
  if (emergencyCheck.isEmergency) {
    const emergencyMsg = lang === 'hi'
      ? 'आपातकालीन चेतावनी: आपके लक्षण संभावित रूप से गंभीर हो सकते हैं। कृपया तुरंत 112 (राष्ट्रीय आपातकालीन नंबर) पर कॉल करें या नजदीकी आपातकालीन अस्पताल जाएं।'
      : lang === 'hinglish'
      ? 'Emergency Alert: Aapke symptoms serious ho sakte hain. Kripya turant 112 par call karein ya paas ke emergency hospital mein jaayein.'
      : 'EMERGENCY ALERT: Your described symptoms indicate a potentially critical medical condition. Please immediately call 112 (India National Emergency Number) or proceed to the nearest emergency room.';

    return {
      message: emergencyMsg,
      language: lang,
      suggested_specialty: null,
      specialty_reason: emergencyCheck.reason,
      emergency: true,
      emergency_message: emergencyCheck.instructions.join('\n'),
      emergency_contact: '112',
      show_doctors: false,
      doctors: [],
    };
  }

  // 4. RETRIEVAL: Query Supabase pgvector for top knowledge chunks
  let retrievedChunks = [];
  try {
    retrievedChunks = await retrieveRelevantContext(query, { matchCount: 4, threshold: 0.35 });
  } catch (e) {
    console.warn('[RAG Service] Retrieval notice:', e.message);
  }

  // 5. GEMINI GENERATION
  const prompt = buildRAGPrompt({ query, retrievedChunks, language: lang });

  let structuredResponse = {
    message: 'Based on your symptoms, a medical consultation is advised.',
    language: lang,
    suggested_specialty: null,
    specialty_reason: null,
    emergency: false,
    emergency_message: null,
    show_doctors: false,
  };

  try {
    const model = genAI.getGenerativeModel({
      model: GEMINI_CHAT_MODEL,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const parsed = JSON.parse(responseText);

    structuredResponse = {
      ...structuredResponse,
      ...parsed,
    };
  } catch (err) {
    console.warn('[RAG Service] Gemini Generation fallback:', err.message);
    // Intelligent heuristic fallback if Gemini API key is missing or quota exceeded
    const lowerQ = query.toLowerCase();
    if (lowerQ.includes('heart') || lowerQ.includes('chest') || lowerQ.includes('bp')) {
      structuredResponse.suggested_specialty = 'Cardiology';
      structuredResponse.specialty_reason = 'Cardiologists specialize in cardiovascular health, blood pressure, and heart telemetry.';
      structuredResponse.show_doctors = true;
    } else if (lowerQ.includes('skin') || lowerQ.includes('rash') || lowerQ.includes('acne') || lowerQ.includes('itching') || lowerQ.includes('khujli')) {
      structuredResponse.suggested_specialty = 'Dermatology';
      structuredResponse.specialty_reason = 'Dermatologists diagnose skin reactions, rashes, and cutaneous conditions.';
      structuredResponse.show_doctors = true;
    } else if (lowerQ.includes('bone') || lowerQ.includes('joint') || lowerQ.includes('knee') || lowerQ.includes('fracture') || lowerQ.includes('pain in leg') || lowerQ.includes('dard')) {
      structuredResponse.suggested_specialty = 'Orthopedics';
      structuredResponse.specialty_reason = 'Orthopedists evaluate musculoskeletal conditions, joints, and sports injuries.';
      structuredResponse.show_doctors = true;
    } else if (lowerQ.includes('headache') || lowerQ.includes('nerve') || lowerQ.includes('migraine') || lowerQ.includes('chakkar') || lowerQ.includes('dizziness')) {
      structuredResponse.suggested_specialty = 'Neurology';
      structuredResponse.specialty_reason = 'Neurologists treat brain, spinal, and nervous system symptoms.';
      structuredResponse.show_doctors = true;
    } else if (lowerQ.includes('child') || lowerQ.includes('baby') || lowerQ.includes('bachha') || lowerQ.includes('pediatric')) {
      structuredResponse.suggested_specialty = 'Pediatrics';
      structuredResponse.specialty_reason = 'Pediatricians specialize in child and infant wellness.';
      structuredResponse.show_doctors = true;
    } else if (lowerQ.includes('cough') || lowerQ.includes('khasi') || lowerQ.includes('fever') || lowerQ.includes('bukhar') || lowerQ.includes('cold') || lowerQ.includes('flu') || lowerQ.includes('vomit') || lowerQ.includes('stomach') || lowerQ.includes('pet')) {
      structuredResponse.suggested_specialty = 'General Medicine';
      structuredResponse.specialty_reason = 'A General Physician can conduct initial triage and refer you to appropriate specialist care if needed.';
      structuredResponse.show_doctors = true;
    } else {
      // General conversational fallback if no known symptom matched
      structuredResponse.message = lang === 'hi'
        ? 'मैं आपकी स्वास्थ्य संबंधी प्राथमिक जानकारी और सही विशेषज्ञ खोजने में मदद कर सकता हूँ। कृपया अपने लक्षण या समस्या विस्तार से बताएं।'
        : lang === 'hinglish'
        ? 'Main aapki health se judi information aur right specialist doctor dhoondhne mein help kar sakta hoon. Kripya apne symptoms thoda detail mein share karein.'
        : 'I can assist you in finding the right medical specialist on HealFlow. Could you please share a few more details about any symptoms or discomfort you are experiencing?';
      structuredResponse.suggested_specialty = null;
      structuredResponse.specialty_reason = null;
      structuredResponse.show_doctors = false;
    }
  }

  // 6. REAL DOCTOR MATCHING: Fetch verified doctors from Supabase
  let doctorsList = [];
  if (structuredResponse.suggested_specialty && structuredResponse.show_doctors) {
    const matchResult = await getMatchingDoctors(structuredResponse.suggested_specialty, 3);
    if (!matchResult.isSupported && matchResult.message) {
      structuredResponse.message += `\n\nNotice: ${matchResult.message}`;
      structuredResponse.show_doctors = false;
    } else {
      doctorsList = matchResult.doctors || [];
    }
  }

  return {
    ...structuredResponse,
    doctors: doctorsList,
  };
};

