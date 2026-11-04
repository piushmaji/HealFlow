# Healflow – Doctor Appointment Platform & AI Specialist Guide (RAG)

Healflow is a modern healthcare OPD appointment management and AI-guided specialist discovery platform built with React, Node.js/Express, Google Gemini API, and Supabase PostgreSQL with pgvector.

---

## 🏗️ System Architecture & Technology Stack

- **Frontend**: React + Vite + Tailwind CSS + Lucide Icons
- **Backend**: Node.js + Express (REST API)
- **Database & Vectors**: Supabase PostgreSQL with `pgvector`
- **AI Models**: Google Gemini `text-embedding-004` (768-dim embeddings) & `gemini-1.5-flash` / `gemini-1.5-pro` (Generative Chat)
- **Languages**: Multilingual triage supporting **English**, **Hindi (Devanagari)**, and **Hinglish**.

---

## 📁 Project Structure

```text
healflow/
│
├── frontend/                     # React Frontend Application
│   ├── src/
│   │   ├── components/chatbot/   # RAG Chatbot UI Components
│   │   │   ├── ChatbotWidget.jsx
│   │   │   ├── ChatHeader.jsx
│   │   │   ├── ChatMessage.jsx
│   │   │   ├── ChatInput.jsx
│   │   │   ├── TypingIndicator.jsx
│   │   │   ├── DoctorRecommendation.jsx
│   │   │   └── EmergencyAlert.jsx
│   │   └── services/
│   │       └── chatbotService.js # API client for /api/chat/message
│
├── server/                       # Node.js + Express Backend
│   ├── config/                   # Gemini & Supabase SDK configuration
│   ├── controllers/              # Chat endpoint logic & sessions
│   ├── routes/                   # /api/chat routes
│   ├── services/                 # RAG orchestrator, safety, vector retrieval, doctor matcher
│   ├── utils/                    # Language detector, chunking, prompt builder
│   ├── middleware/               # Auth, rate limiting (30 req/min), error handler
│   └── server.js                 # Express server startup
│
├── rag/                          # RAG Pipeline & Ingestion
│   ├── datasets/                 # Place CSV datasets here
│   │   ├── symptoms_specialties.csv
│   │   ├── medical_knowledge.csv
│   │   ├── medical_faqs.csv
│   │   └── emergency_red_flags.csv (Optional)
│   └── scripts/
│       ├── validateDatasets.js   # npm run rag:validate
│       ├── generateEmbeddings.js # Gemini embedding generator
│       └── ingestDocuments.js    # npm run rag:ingest
│
├── supabase/migrations/
│   └── create_rag_tables.sql     # pgvector, knowledge_chunks, & match_knowledge_chunks RPC
│
├── .env.example
└── README.md
```

---

## 🚀 Setup & Execution Guide

### 1. Environment Configuration
Copy `.env.example` to `.env` in the root directory:
```bash
cp .env.example .env
```
Fill in your credentials:
```env
PORT=5000
GEMINI_API_KEY=your_gemini_api_key
GEMINI_CHAT_MODEL=gemini-1.5-flash
GEMINI_EMBEDDING_MODEL=text-embedding-004

SUPABASE_URL=https://<your-project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Database Migration (Supabase pgvector)
In your Supabase Dashboard, open the **SQL Editor** and run:
`supabase/migrations/create_rag_tables.sql`

This creates:
- `vector` extension
- `public.knowledge_chunks` table with 768-dimensional vector column
- HNSW cosine vector index
- `match_knowledge_chunks` similarity search RPC function
- `chat_sessions` and `chat_messages` tables with RLS policies

### 3. CSV Dataset Placement & Ingestion
Place your CSV files inside `rag/datasets/`:
- `rag/datasets/symptoms_specialties.csv`
- `rag/datasets/medical_knowledge.csv`
- `rag/datasets/medical_faqs.csv`

> **Note**: `emergency_red_flags.csv` is optional. If missing, ingestion continues smoothly without crashing. Critical red flags (chest pain, stroke, severe bleeding, etc.) are safeguarded through a deterministic emergency safety engine (`server/services/safetyService.js`).

**Validate datasets:**
```bash
npm run rag:validate
```

**Ingest & embed documents into pgvector:**
```bash
npm run rag:ingest
```

### 4. Start the Backend Server
```bash
npm start
```
The server starts at `http://localhost:5000`. Test endpoint:
```bash
curl -X POST http://localhost:5000/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message": "I have severe chest pain and breathlessness"}'
```

### 5. Start the Frontend
In another terminal:
```bash
cd frontend
npm run dev
```
Open `http://localhost:3000`. You will see the **AI Specialist Guide** floating button on the dashboard and profile pages.

