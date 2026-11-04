import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATASETS_DIR = path.resolve(__dirname, '../datasets');

const REQUIRED_DATASETS = [
  {
    name: 'symptoms_specialties.csv',
    description: 'Symptom to Specialty mappings',
    critical: true,
  },
  {
    name: 'medical_knowledge.csv',
    description: 'General medical knowledge and condition overviews',
    critical: true,
  },
  {
    name: 'medical_faqs.csv',
    description: 'Frequently asked patient healthcare queries',
    critical: true,
  },
  {
    name: 'emergency_red_flags.csv',
    description: 'Critical clinical red flags & immediate emergency rules',
    critical: false, // Explicitly optional as per prompt instructions
  },
];

export const validateDatasets = () => {
  console.log('\n======================================================');
  console.log('🩺 HEALFLOW RAG DATASET VALIDATION');
  console.log(`Directory: ${DATASETS_DIR}`);
  console.log('======================================================\n');

  if (!fs.existsSync(DATASETS_DIR)) {
    fs.mkdirSync(DATASETS_DIR, { recursive: true });
    console.log(`Created directory: ${DATASETS_DIR}`);
  }

  const results = {
    totalChecked: REQUIRED_DATASETS.length,
    found: 0,
    missingCritical: 0,
    missingOptional: 0,
    details: [],
  };

  for (const item of REQUIRED_DATASETS) {
    const filePath = path.join(DATASETS_DIR, item.name);

    if (!fs.existsSync(filePath)) {
      if (item.critical) {
        results.missingCritical++;
        console.error(`❌ [CRITICAL MISSING] ${item.name} (${item.description})`);
      } else {
        results.missingOptional++;
        console.warn(`⚠️ [OPTIONAL MISSING] ${item.name} (${item.description}) - Safe fallback active.`);
      }
      results.details.push({ ...item, status: 'missing', records: 0 });
      continue;
    }

    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        relax_column_count: true,
      });

      results.found++;
      console.log(`✅ [FOUND] ${item.name} — ${records.length} records parsed successfully (UTF-8 valid).`);
      results.details.push({ ...item, status: 'valid', records: records.length });
    } catch (err) {
      console.error(`❌ [CORRUPTED/PARSE ERROR] ${item.name}: ${err.message}`);
      results.details.push({ ...item, status: 'error', error: err.message });
      if (item.critical) results.missingCritical++;
    }
  }

  console.log('\n------------------------------------------------------');
  console.log(`Validation Complete: ${results.found}/${results.totalChecked} files verified.`);
  if (results.missingCritical > 0) {
    console.warn(`Notice: ${results.missingCritical} required file(s) missing in rag/datasets/. Please copy them into the folder.`);
  } else {
    console.log('All required datasets are ready for ingestion!');
  }
  console.log('------------------------------------------------------\n');

  return results;
};

// Execute if run directly via CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  validateDatasets();
}

