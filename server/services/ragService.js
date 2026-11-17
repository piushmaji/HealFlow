/**
 * Full RAG Orchestration Service
 * Integrates Safety Checks, Vector/Knowledge Retrieval, Grounded Clinical Explanations, and Real Doctor Matching.
 * Provides thorough, empathetic medical context and explanation grounded in verified knowledge chunks.
 */
import { genAI, GEMINI_CHAT_MODEL } from '../config/gemini.js';
import { assessEmergency } from './safetyService.js';
import { retrieveRelevantContext } from './retrievalService.js';
import { getMatchingDoctors } from './doctorMatchingService.js';
import { detectLanguage } from '../utils/languageDetector.js';
import { buildRAGPrompt } from '../utils/promptBuilder.js';
import { supabase } from '../config/supabase.js';

// Regex patterns for conversational greetings, gratitude, small talk, and bot capability queries
const GREETING_PATTERNS = [
  /^(hi+|hello+|hey+|heyy+|hiya|howdy|hola|yo+)(\s+(there|bot|doc|doctor|healflow|sir|bhai|mam|team))?[\s!.,?]*$/i,
  /^(namaste|namaskar|pranam|ram\s*ram|salaam|sasrikal)[\s!.,?]*$/i,
  /^(good\s+(morning|afternoon|evening|night|day))[\s!.,?]*$/i,
  /^(kaise\s+ho|kaisa\s+hai|kya\s+haal\s+hai|sab\s+theek|aap\s+kaise\s+hain)[\s!.,?]*$/i,
  /^(how\s+are\s+you|how\s+do\s+you\s+do|how\'s\s+it\s+going|what\'s\s+up|sup)[\s!.,?]*$/i,
  /^(who\s+are\s+you|what\s+can\s+you\s+do|what\s+do\s+you\s+do|help\s*me|tell\s+me\s+about\s+yourself|who\s+are\s+you\s+and\s+what\s+do\s+you\s+do)[\s!.,?]*$/i,
  /^(kya\s+karte\s+ho|tum\s+kaun\s+ho|aap\s+kaun\s+hain|ye\s+kya\s+hai|kya\s+kaam\s+hai)[\s!.,?]*$/i,
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
      message:
        'नमस्ते! मैं आपका हीलफ्लो एआई स्पेशलिस्ट गाइड हूँ।\n\nमैं आपके स्वास्थ्य लक्षणों को समझने, उनके संभावित कारणों की मेडिकल जानकारी साझा करने और सही विशेषज्ञ डॉक्टर (Cardiology, Dermatology, Pediatrics, Neurology, Orthopedics, General Medicine) से कनेक्ट करने में सहायता करता हूँ।\n\nआज आप कैसा महसूस कर रहे हैं? कृपया अपने लक्षण या स्वास्थ्य चिंता विस्तार से साझा करें।',
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
      message:
        'Hello! Main aapka HealFlow AI Specialist Guide hoon.\n\nMain aapke health symptoms ko samajhne, verified clinical knowledge ke mutabik context samjhane aur sahi specialist doctor (Cardiology, Dermatology, Pediatrics, Neurology, Orthopedics, General Medicine) suggest karne mein help karta hoon.\n\nAap aaj kaisa feel kar rahe hain? Kripya apne symptoms ya health query share karein.',
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
    message:
      'Hello! I am your HealFlow AI Specialist Guide.\n\nI help you understand your symptoms, provide evidence-based educational health context, and guide you to the right medical specialist (Cardiology, Dermatology, Pediatrics, Neurology, Orthopedics, General Medicine).\n\nHow are you feeling today? Please describe your symptoms or ask your health concern.',
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

/**
 * Builds a clean, friendly, and concise patient-friendly clinical summary.
 * No raw database strings, no developer instructions, no system policies.
 */
const buildGroundedClinicalResponse = ({
  query,
  lang,
  suggestedSpecialty,
  symptomChunk,
  knowledgeChunk,
}) => {
  const isHi = lang === 'hi';
  const isHinglish = lang === 'hinglish';

  const symMeta = symptomChunk?.metadata || {};
  const knwMeta = knowledgeChunk?.metadata || {};

  const symptomName = isHi
    ? symMeta.symptom_hi || symMeta.symptom_en || 'लक्षण'
    : isHinglish
    ? symMeta.symptom_hinglish || symMeta.symptom_en || 'symptoms'
    : symMeta.symptom_en || 'reported symptoms';

  // Filter out any internal system text
  const cleanClinicalText = (text) => {
    if (!text) return '';
    if (
      text.includes('RAG answer') ||
      text.includes('system_policy') ||
      text.includes('source-backed content') ||
      text.includes('Store source title') ||
      text.includes('chatbot must not diagnose')
    ) {
      return '';
    }
    return text.trim();
  };

  let clinicalContext = cleanClinicalText(
    isHi ? knwMeta.content_hi : isHinglish ? knwMeta.content_hinglish : knwMeta.content_en
  );

  let escalation = cleanClinicalText(knwMeta.safety_or_escalation_note);

  // Friendly concise fallbacks if no clinical chunk or if text was internal policy
  if (!clinicalContext) {
    if (suggestedSpecialty === 'Orthopedics') {
      clinicalContext = isHi
        ? 'घुटने, जोड़ों या हड्डियों में दर्द का समय पर परीक्षण करवाना जरूरी है ताकि किसी लिगामेंट या कार्टिलेज समस्या को समय रहते ठीक किया जा सके।'
        : isHinglish
        ? 'Joints, knee ya bones ke pain ka timely evaluation zaroori hai taaki ligament ya joint stress ko identify karke proper relief mil sake.'
        : 'Joint and musculoskeletal discomfort requires clinical evaluation to assess ligament health and mobility.';
    } else if (suggestedSpecialty === 'General Medicine') {
      clinicalContext = isHi
        ? 'खांसी, बुखार या उल्टी/मतली जैसे लक्षण संक्रमण या पाचन संबंधी कारणों से हो सकते हैं। पर्याप्त आराम और हाइड्रेशन रखें।'
        : isHinglish
        ? 'Khasi, bukhar ya ulti/vomiting ke lakshan common infection ya digestive imbalance se ho sakte hain. Proper hydration aur rest zaroori hai.'
        : 'Symptoms like cough, fever, or nausea are often associated with respiratory or digestive concerns. Hydration and rest are advised.';
    } else if (suggestedSpecialty === 'Dermatology') {
      clinicalContext = isHi
        ? 'त्वचा की एलर्जी, रैशेस या खुजली के लिए सही विशेषज्ञ जांच जरूरी है।'
        : isHinglish
        ? 'Skin rashes ya allergy ke liye specialist consultation se accurate skin treatment milta hai.'
        : 'Skin rashes or allergies are best evaluated by a dermatologist for targeted topical care.';
    } else if (suggestedSpecialty === 'Neurology') {
      clinicalContext = isHi
        ? 'लगातार सिरदर्द या चक्कर आने पर न्यूरोलॉजिकल जांच की सलाह दी जाती है।'
        : isHinglish
        ? 'Persistent headache ya dizziness ke liye neurological evaluation helpful rehti hai.'
        : 'Persistent headaches or dizziness warrant professional neurological assessment.';
    } else if (suggestedSpecialty === 'Cardiology') {
      clinicalContext = isHi
        ? 'सीने में तकलीफ या असामान्य धड़कन के लिए कार्डियोलॉजी परीक्षण की आवश्यकता होती है।'
        : isHinglish
        ? 'Chest discomfort ya irregular heartbeat ke liye cardiology evaluation zaroori hai.'
        : 'Cardiac symptoms warrant comprehensive evaluation by a specialist.';
    } else if (suggestedSpecialty === 'Pediatrics') {
      clinicalContext = isHi
        ? 'बच्चों के लक्षणों के लिए हमेशा बाल रोग विशेषज्ञ (Pediatrician) से परामर्श लें।'
        : isHinglish
        ? 'Bachhon ke symptoms ke liye hamesha pediatrician se consult karein.'
        : 'Pediatric symptoms require gentle and specialized care by a pediatrician.';
    }
  }

  if (isHi) {
    return [
      `### 🩺 स्वास्थ्य सारांश (${symptomName})`,
      clinicalContext,
      escalation ? `> ⚠️ **महत्वपूर्ण सूचना**: ${escalation}` : '',
      `### 👨‍⚕️ अनुशंसित विशेषज्ञ: **${suggestedSpecialty}**`,
      `आपके बताए गए लक्षणों के सटीक मूल्यांकन और उपचार के लिए **${suggestedSpecialty}** डॉक्टर से परामर्श करने की सलाह दी जाती है।`,
      `--- \n**उपलब्ध सत्यापित ${suggestedSpecialty} डॉक्टर्स:**`
    ].filter(Boolean).join('\n\n');
  }

  if (isHinglish) {
    return [
      `### 🩺 Health Summary (${symptomName})`,
      clinicalContext,
      escalation ? `> ⚠️ **Important Note**: ${escalation}` : '',
      `### 👨‍⚕️ Recommended Specialist: **${suggestedSpecialty}**`,
      `Aapke bataye gaye symptoms ke clinical context ke mutabik, **${suggestedSpecialty}** doctor se consult karna sabse sahi step hai.`,
      `--- \n**Available Verified ${suggestedSpecialty} Doctors on HealFlow:**`
    ].filter(Boolean).join('\n\n');
  }

  return [
    `### 🩺 Health Summary (${symptomName})`,
    clinicalContext,
    escalation ? `> ⚠️ **Clinical Note**: ${escalation}` : '',
    `### 👨‍⚕️ Recommended Specialist: **${suggestedSpecialty}**`,
    `Based on your described symptoms, consulting a **${suggestedSpecialty}** specialist is recommended for evaluation and proper guidance.`,
    `--- \n**Available Verified ${suggestedSpecialty} Doctors on HealFlow:**`
  ].filter(Boolean).join('\n\n');
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

  // 2. CASUAL GREETING & CAPABILITY QUERY CHECK:
  if (isCasualGreeting(query)) {
    return getGreetingResponse(lang);
  }

  // 3. CRITICAL SAFETY CHECK: Deterministic Emergency Detection
  const emergencyCheck = assessEmergency(query);
  if (emergencyCheck.isEmergency) {
    const emergencyMsg =
      lang === 'hi'
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

  // 4. RETRIEVAL: Query Supabase Hybrid RAG (pgvector + verified knowledge chunks)
  let retrievedChunks = [];
  try {
    retrievedChunks = await retrieveRelevantContext(query, { matchCount: 5, threshold: 0.35 });
  } catch (e) {
    console.warn('[RAG Service] Retrieval notice:', e.message);
  }

  // Separate symptom chunk and broader medical educational chunk
  const symptomChunk = retrievedChunks.find(
    (c) => c.metadata?.suggested_specialty && c.metadata.suggested_specialty !== 'UNSUPPORTED'
  );
  let knowledgeChunk = retrievedChunks.find(
    (c) => c.dataset_name === 'medical_knowledge' && (c.metadata?.content_en || c.metadata?.content_hi || c.metadata?.content_hinglish)
  );

  let ragSuggestedSpecialty =
    symptomChunk?.metadata?.suggested_specialty ||
    knowledgeChunk?.metadata?.related_specialty ||
    null;

  // Fallback specialty determination if retrieval had low direct score
  const lowerQ = query.toLowerCase();
  const isChildQuery = lowerQ.includes('child') || lowerQ.includes('baby') || lowerQ.includes('bachha') || lowerQ.includes('baccha') || lowerQ.includes('pediatric') || lowerQ.includes('infant');

  if (!ragSuggestedSpecialty || (ragSuggestedSpecialty === 'Pediatrics' && !isChildQuery)) {
    if (lowerQ.includes('pet') || lowerQ.includes('stomach') || lowerQ.includes('abdomen') || lowerQ.includes('digestive') || lowerQ.includes('vomit') || lowerQ.includes('ulti') || lowerQ.includes('nausea') || lowerQ.includes('gas') || lowerQ.includes('acidity') || lowerQ.includes('khasi') || lowerQ.includes('khansi') || lowerQ.includes('cough') || lowerQ.includes('cold') || lowerQ.includes('sardi') || lowerQ.includes('fever') || lowerQ.includes('bukhar')) {
      ragSuggestedSpecialty = isChildQuery ? 'Pediatrics' : 'General Medicine';
    } else if (lowerQ.includes('bone') || lowerQ.includes('joint') || lowerQ.includes('knee') || lowerQ.includes('fracture') || lowerQ.includes('back pain') || lowerQ.includes('neck pain') || lowerQ.includes('ligament')) {
      ragSuggestedSpecialty = 'Orthopedics';
    } else if (lowerQ.includes('skin') || lowerQ.includes('rash') || lowerQ.includes('acne') || lowerQ.includes('itching') || lowerQ.includes('khujli') || lowerQ.includes('eczema')) {
      ragSuggestedSpecialty = 'Dermatology';
    } else if (lowerQ.includes('headache') || lowerQ.includes('nerve') || lowerQ.includes('migraine') || lowerQ.includes('chakkar') || lowerQ.includes('dizziness') || lowerQ.includes('sar dard') || lowerQ.includes('sir dard') || lowerQ.includes('sir me dard')) {
      ragSuggestedSpecialty = 'Neurology';
    } else if (lowerQ.includes('heart') || lowerQ.includes('chest') || lowerQ.includes('bp') || lowerQ.includes('palpitation') || lowerQ.includes('seene')) {
      ragSuggestedSpecialty = 'Cardiology';
    } else if (isChildQuery) {
      ragSuggestedSpecialty = 'Pediatrics';
    } else {
      ragSuggestedSpecialty = 'General Medicine';
    }
  }

  // Ensure matching specific medical knowledge chunk for educational explanation
  if (!knowledgeChunk || knowledgeChunk.metadata?.related_specialty !== ragSuggestedSpecialty) {
    try {
      // Look for symptom-specific topic first (e.g. headache, fever, chest pain, stomach)
      let topicSearch = ragSuggestedSpecialty;
      if (lowerQ.includes('headache') || lowerQ.includes('migraine') || lowerQ.includes('sir') || lowerQ.includes('sar')) {
        topicSearch = 'Headache';
      } else if (lowerQ.includes('chest') || lowerQ.includes('seene') || lowerQ.includes('heart')) {
        topicSearch = 'Chest pain';
      } else if (lowerQ.includes('fever') || lowerQ.includes('bukhar')) {
        topicSearch = lowerQ.includes('child') || lowerQ.includes('baby') || lowerQ.includes('baccha') ? 'Child fever' : 'Fever';
      } else if (lowerQ.includes('pet') || lowerQ.includes('stomach') || lowerQ.includes('abdomen')) {
        topicSearch = 'Stomach pain';
      }

      const { data: specificChunks } = await supabase
        .from('knowledge_chunks')
        .select('id, dataset_name, content, metadata')
        .eq('dataset_name', 'medical_knowledge')
        .ilike('metadata->>topic', `%${topicSearch}%`)
        .limit(1);

      if (specificChunks && specificChunks.length > 0) {
        knowledgeChunk = specificChunks[0];
      } else {
        const { data: scopeChunks } = await supabase
          .from('knowledge_chunks')
          .select('id, dataset_name, content, metadata')
          .eq('dataset_name', 'medical_knowledge')
          .ilike('metadata->>topic', `%${ragSuggestedSpecialty}%`)
          .limit(1);

        if (scopeChunks && scopeChunks.length > 0) {
          knowledgeChunk = scopeChunks[0];
        }
      }
    } catch (err) {
      console.warn('[RAG Service] Scope chunk lookup notice:', err.message);
    }
  }

  // 5. GEMINI GENERATION (With automatic fall-forward to grounded clinical chunk engine)
  const prompt = buildRAGPrompt({ query, retrievedChunks, language: lang });

  let structuredResponse = {
    message: '',
    language: lang,
    suggested_specialty: ragSuggestedSpecialty,
    specialty_reason: symptomChunk?.metadata?.mapping_note || `Clinical guidelines recommend consulting a ${ragSuggestedSpecialty} specialist for this concern.`,
    emergency: false,
    emergency_message: null,
    show_doctors: true,
  };

  let geminiSuccess = false;
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

    if (parsed.message && parsed.message.length > 30) {
      structuredResponse = {
        ...structuredResponse,
        ...parsed,
      };
      geminiSuccess = true;
    }
  } catch (err) {
    // Expected when Gemini API key is placeholder; fall forward to grounded knowledge chunks
  }

  if (!geminiSuccess) {
    // If query is generic "Find a doctor", provide specialty overview
    if (lowerQ.includes('find') && lowerQ.includes('doctor')) {
      structuredResponse.suggested_specialty = 'General Medicine';
      structuredResponse.specialty_reason = 'Explore verified medical specialists across Cardiology, Dermatology, Orthopedics, Pediatrics, and General Medicine.';
      structuredResponse.message =
        lang === 'hi'
          ? 'हीलफ्लो पर आपका स्वागत है। आप अपनी समस्या के अनुसार उपयुक्त विशेषज्ञ (Cardiology, Dermatology, Orthopedics, Pediatrics, General Medicine) चुन सकते हैं। सामान्य शारीरिक स्वास्थ्य जांच या प्राथमिक परामर्श के लिए नीचे जनरल मेडिसिन विशेषज्ञ उपलब्ध हैं:'
          : lang === 'hinglish'
          ? 'HealFlow par aapka swagat hai. Aap apne health symptoms ke hisaab se suitable specialist (Cardiology, Dermatology, Orthopedics, Pediatrics, General Medicine) choose kar sakte hain. Primary health checkup ke liye neeche verified doctors listed hain:'
          : 'Welcome to HealFlow. You can explore verified specialists across Cardiology, Dermatology, Orthopedics, Pediatrics, and General Medicine. For general health assessment, here are our active physicians:';
    } else {
      structuredResponse.message = buildGroundedClinicalResponse({
        query,
        lang,
        suggestedSpecialty: ragSuggestedSpecialty,
        symptomChunk,
        knowledgeChunk,
      });
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
