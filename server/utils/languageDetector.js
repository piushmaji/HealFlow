/**
 * Language detector for English, Hindi, and Hinglish queries
 */

const DEVANAGARI_REGEX = /[\u0900-\u097F]/;

const HINGLISH_WORDS = [
  'dard', 'bukhar', 'khansi', 'chhati', 'seena', 'pet', 'gala', 'khoon',
  'saas', 'thakan', 'chashma', 'aankh', 'dawa', 'doctor', 'dikkat', 'takleef',
  'kya', 'hai', 'mujhe', 'mera', 'meri', 'mere', 'hota', 'hoti', 'raha', 'rahi',
  'ho', 'gaya', 'karoon', 'batao', 'ilaaj', 'samasya', 'kab', 'se'
];

export const detectLanguage = (text) => {
  if (!text || typeof text !== 'string') return 'en';

  if (DEVANAGARI_REGEX.test(text)) {
    return 'hi'; // Hindi (Devanagari script)
  }

  const words = text.toLowerCase().split(/\s+/);
  const hinglishMatchCount = words.filter(w => HINGLISH_WORDS.includes(w)).length;

  if (hinglishMatchCount >= 2 || (words.length <= 4 && hinglishMatchCount >= 1)) {
    return 'hinglish';
  }

  return 'en';
};

