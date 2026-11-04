# Healflow RAG (Retrieval-Augmented Generation) System

The Healflow AI Specialist Guide uses Google Gemini and Supabase pgvector to analyze patient symptoms and recommend appropriate medical specialists listed on Healflow.

## Directory Structure

```text
rag/
├── datasets/
│   ├── symptoms_specialties.csv    (Required - mapping symptoms to medical specialties)
│   ├── medical_knowledge.csv       (Required - clinical knowledge and condition descriptions)
│   ├── medical_faqs.csv            (Required - common patient questions & advice)
│   └── emergency_red_flags.csv     (Optional - if missing, ingestion runs safely)
└── scripts/
    ├── validateDatasets.js         (Validates CSV formatting & multilingual integrity)
    ├── generateEmbeddings.js       (Gemini text-embedding-004 wrapper with batching)
    └── ingestDocuments.js          (Chunks data and upserts into Supabase knowledge_chunks)
```

## Setup & Execution

### 1. Place CSV Datasets
Copy your CSV files to `rag/datasets/`:
- `rag/datasets/symptoms_specialties.csv`
- `rag/datasets/medical_knowledge.csv`
- `rag/datasets/medical_faqs.csv`

> **Note**: `emergency_red_flags.csv` is optional. If absent, the ingestion will notify you and continue smoothly. A deterministic safety engine handles emergency alerts in real-time.

### 2. Run Database Migration
Execute `supabase/migrations/create_rag_tables.sql` in your Supabase SQL Editor.

### 3. Validate Datasets
```bash
npm run rag:validate
```

### 4. Ingest Documents into Supabase pgvector
```bash
npm run rag:ingest
```

