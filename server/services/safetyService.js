/**
 * Deterministic Clinical Safety & Emergency Detection Engine
 * Works completely independently of Gemini and pgvector so emergency alerts
 * function reliably even when emergency_red_flags.csv is not present.
 */

// Critical Emergency Triggers (Chest pain, severe breathing, stroke, anaphylaxis, etc.)
const EMERGENCY_PATTERNS = [
  // Cardiovascular & Chest Pressure
  /\b(chest\s*pain|chest\s*pressure|heart\s*attack|crushing\s*chest|radiating\s*(to\s*)?(left\s*arm|jaw))\b/i,
  /\b(chhati\s*me\s*dard|seene\s*me\s*dard|chhati\s*bhari|chhati\s*mein\s*dabav)\b/i,
  /\b(छाती\s*में\s*दर्द|सीने\s*में\s*दर्द|दिल\s*का\s*दौरा)\b/i,

  // Respiratory Failure / Severe Dyspnea
  /\b(cannot\s*breathe|severe\s*shortness\s*of\s*breath|gasping|suffocating|choking|blue\s*lips)\b/i,
  /\b(saas\s*(nahi\s*aa\s*rahi|ruk\s*rahi|lene\s*me\s*dikkat)|dum\s*ghut\s*raha)\b/i,
  /\b(सांस\s*फूलना|सांस\s*रुकना|दम\s*घुटना)\b/i,

  // Neurological Emergencies & Stroke (FAST rules)
  /\b(stroke|face\s*droop|arm\s*weakness|slurred\s*speech|sudden\s*paralysis|loss\s*of\s*vision)\b/i,
  /\b(lakwa|muh\s*tedha|bol\s*nahi\s*pa\s*rahe|fainting|unconscious|behosh)\b/i,
  /\b(लकवा|बेहोश|बेहोशी|दौरा\s*पड़ना|अचानक\s*कमजोरी)\b/i,

  // Severe Bleeding & Trauma
  /\b(severe\s*bleeding|coughing\s*up\s*blood|vomiting\s*blood|hemorrhage|uncontrolled\s*bleeding)\b/i,
  /\b(khoon\s*(ki\s*ulti|beh\s*raha|ruk\s*nahi\s*raha))\b/i,
  /\b(खून\s*की\s*उल्टी|अधिक\s*खून\s*बहना)\b/i,

  // Anaphylaxis & Severe Allergies
  /\b(anaphylaxis|throat\s*closing|swollen\s*tongue|severe\s*allergic\s*reaction)\b/i,
  /\b(gala\s*band\s*ho\s*raha|jeebh\s*sooj\s*gayi)\b/i,

  // Seizures, Poisoning, Self-Harm
  /\b(seizure|convulsions|epileptic\s*fit|overdose|swallowed\s*poison|suicide|self[- ]harm)\b/i,
  /\b(mirgi\s*ka\s*daura|zehar|aatmhatya)\b/i,
  /\b(दौरा|ज़हर|आत्महत्या)\b/i,
];

export const assessEmergency = (text) => {
  if (!text || typeof text !== 'string') {
    return { isEmergency: false, reason: null };
  }

  for (const pattern of EMERGENCY_PATTERNS) {
    if (pattern.test(text)) {
      return {
        isEmergency: true,
        reason: 'Potential critical life-safety emergency condition detected.',
        emergencyContact: '112',
        instructions: [
          'Immediate emergency medical attention is required.',
          'Please dial 112 (National Emergency Number in India) or call your nearest ambulance immediately.',
          'Do not wait for a scheduled routine OPD consultation.',
          'If possible, notify a family member, colleague, or bystander immediately to assist you.',
        ],
      };
    }
  }

  return { isEmergency: false, reason: null };
};

