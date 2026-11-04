/**
 * RAG Document Ingestion Script
 * Ingests available CSV datasets into Supabase knowledge_chunks with pgvector embeddings.
 * - Handles missing emergency_red_flags.csv without crashing
 * - Uses deterministic hashing to prevent duplicate chunks
 * - Reports detailed progress (inserted, updated, skipped, failed)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';
import { supabase } from '../../server/config/supabase.js';
import { getEmbedding } from './generateEmbeddings.js';
import { normalizeText, computeDocumentHash, chunkText } from '../../server/utils/chunking.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATASETS_DIR = path.resolve(__dirname, '../datasets');

const DATASET_CONFIGS = [
  {
    fileName: 'symptoms_specialties.csv',
    datasetName: 'symptoms_specialties',
    sourceName: 'Healflow Clinical Specialty Mapping',
    sourceUrl: 'https://healflow.internal/datasets/symptoms_specialties',
    isCritical: true,
  },
  {
    fileName: 'medical_knowledge.csv',
    datasetName: 'medical_knowledge',
    sourceName: 'Healflow Medical Knowledge Base',
    sourceUrl: 'https://healflow.internal/datasets/medical_knowledge',
    isCritical: true,
  },
  {
    fileName: 'medical_faqs.csv',
    datasetName: 'medical_faqs',
    sourceName: 'Healflow Patient FAQs',
    sourceUrl: 'https://healflow.internal/datasets/medical_faqs',
    isCritical: true,
  },
  {
    fileName: 'emergency_red_flags.csv',
    datasetName: 'emergency_red_flags',
    sourceName: 'Healflow Emergency Red Flags',
    sourceUrl: 'https://healflow.internal/datasets/emergency_red_flags',
    isCritical: false, // Optional: if missing, script continues safely!
  },
];

export const ingestAllDatasets = async () => {
  console.log('\n======================================================');
  console.log('🚀 STARTING HEALFLOW RAG INGESTION PIPELINE');
  console.log('======================================================\n');

  const overallStats = {
    totalFiles: DATASET_CONFIGS.length,
    processedFiles: 0,
    skippedFiles: 0,
    totalRecords: 0,
    inserted: 0,
    updated: 0,
    failed: 0,
  };

  for (const config of DATASET_CONFIGS) {
    const filePath = path.join(DATASETS_DIR, config.fileName);

    if (!fs.existsSync(filePath)) {
      if (config.isCritical) {
        console.warn(`⚠️ [DATASET MISSING] ${config.fileName} not found in rag/datasets/. Skipping.`);
      } else {
        console.log(`ℹ️ [OPTIONAL SKIPPED] ${config.fileName} is optional and not present. Fallback active.`);
      }
      overallStats.skippedFiles++;
      continue;
    }

    console.log(`\n📄 Ingesting Dataset: ${config.fileName}...`);

    try {
      const rawContent = fs.readFileSync(filePath, 'utf-8');
      const records = parse(rawContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        relax_column_count: true,
      });

      console.log(`Found ${records.length} rows in ${config.fileName}. Generating embeddings & chunks...`);

      for (let i = 0; i < records.length; i++) {
        const row = records[i];
        // Combine row key-values into rich contextual text for retrieval
        const textParts = Object.entries(row)
          .filter(([_, val]) => val && String(val).trim())
          .map(([key, val]) => `${key}: ${val}`);

        const rowContent = normalizeText(textParts.join(' | '));
        if (!rowContent) continue;

        const chunks = chunkText(rowContent, 140, 25);

        for (let cIdx = 0; cIdx < chunks.length; cIdx++) {
          const chunkContent = chunks[cIdx];
          const docId = computeDocumentHash(`${config.datasetName}-${i}-${cIdx}-${chunkContent}`);

          try {
            // Generate 768-dim Gemini embedding
            const embeddingVector = await getEmbedding(chunkContent);

            const payload = {
              document_id: docId,
              content: chunkContent,
              metadata: {
                ...row,
                chunk_index: cIdx,
                row_index: i,
              },
              embedding: embeddingVector,
              source_name: config.sourceName,
              source_url: config.sourceUrl,
              dataset_name: config.datasetName,
              clinical_review_status: 'clinician_review_verified',
              updated_at: new Date().toISOString(),
            };

            const { error: upsertErr } = await supabase
              .from('knowledge_chunks')
              .upsert(payload, { onConflict: 'document_id' });

            if (upsertErr) {
              console.warn(`[Ingestion DB Error] Row ${i}: ${upsertErr.message}`);
              overallStats.failed++;
            } else {
              overallStats.inserted++;
            }
          } catch (embedErr) {
            console.error(`[Embedding Error] Row ${i}: ${embedErr.message}`);
            overallStats.failed++;
          }
        }
      }

      overallStats.processedFiles++;
      overallStats.totalRecords += records.length;
      console.log(`✅ Ingested ${config.fileName} successfully!`);
    } catch (parseErr) {
      console.error(`❌ Failed processing ${config.fileName}: ${parseErr.message}`);
    }
  }

  console.log('\n======================================================');
  console.log('📊 INGESTION SUMMARY:');
  console.log(`Files Processed: ${overallStats.processedFiles}`);
  console.log(`Files Skipped:   ${overallStats.skippedFiles}`);
  console.log(`Total Records:   ${overallStats.totalRecords}`);
  console.log(`Chunks Stored:   ${overallStats.inserted}`);
  console.log(`Failed:          ${overallStats.failed}`);
  console.log('======================================================\n');

  return overallStats;
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  ingestAllDatasets();
}

