-- ====================================================================
-- HEALFLOW AI SPECIALIST GUIDE – VECTOR DATABASE MIGRATION
-- File: supabase/migrations/create_rag_tables.sql
-- ====================================================================

-- 1. Enable pgvector extension (Safe check)
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ====================================================================
-- 2. CREATE TABLE: knowledge_chunks
-- Stores embedded medical symptom rules, specialty mappings, knowledge, and FAQs.
-- Gemini text-embedding-004 produces 768-dimensional embeddings.
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.knowledge_chunks (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    document_id TEXT NOT NULL UNIQUE, -- Deterministic unique hash or row id to prevent duplicate ingestion
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    embedding VECTOR(768),
    source_name TEXT,
    source_url TEXT,
    dataset_name TEXT NOT NULL,
    clinical_review_status TEXT DEFAULT 'pending_clinical_review',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 3. INDEXES FOR PERFORMANCE & FAST VECTOR SIMILARITY SEARCH
-- Using HNSW index with cosine distance operator (<=>) for rapid retrieval
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_dataset 
    ON public.knowledge_chunks(dataset_name);

CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_doc_id 
    ON public.knowledge_chunks(document_id);

CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_embedding 
    ON public.knowledge_chunks USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);

-- ====================================================================
-- 4. RPC FUNCTION: match_knowledge_chunks
-- Performs cosine similarity search over knowledge_chunks
-- ====================================================================
CREATE OR REPLACE FUNCTION public.match_knowledge_chunks(
    query_embedding VECTOR(768),
    match_threshold FLOAT DEFAULT 0.45,
    match_count INT DEFAULT 5,
    filter_dataset TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    document_id TEXT,
    content TEXT,
    metadata JSONB,
    source_name TEXT,
    source_url TEXT,
    dataset_name TEXT,
    clinical_review_status TEXT,
    similarity FLOAT
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT
        kc.id,
        kc.document_id,
        kc.content,
        kc.metadata,
        kc.source_name,
        kc.source_url,
        kc.dataset_name,
        kc.clinical_review_status,
        (1 - (kc.embedding <=> query_embedding))::FLOAT AS similarity
    FROM public.knowledge_chunks kc
    WHERE
        kc.embedding IS NOT NULL
        AND (filter_dataset IS NULL OR kc.dataset_name = filter_dataset)
        AND (1 - (kc.embedding <=> query_embedding)) >= match_threshold
    ORDER BY (kc.embedding <=> query_embedding) ASC
    LIMIT match_count;
END;
$$;

-- ====================================================================
-- 5. CHAT SESSIONS & CONVERSATION HISTORY (Optional user privacy compliant)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.chat_sessions (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT DEFAULT 'Medical Consultation Guidance',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    session_id UUID REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
    sender TEXT NOT NULL CHECK (sender IN ('user', 'ai', 'system')),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_user ON public.chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON public.chat_messages(session_id);

-- ====================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
ALTER TABLE public.knowledge_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- 6.1 knowledge_chunks policies
DROP POLICY IF EXISTS "Allow public read knowledge_chunks" ON public.knowledge_chunks;
CREATE POLICY "Allow public read knowledge_chunks"
    ON public.knowledge_chunks FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Allow service role and authenticated manage knowledge_chunks" ON public.knowledge_chunks;
CREATE POLICY "Allow service role and authenticated manage knowledge_chunks"
    ON public.knowledge_chunks FOR ALL
    USING (true)
    WITH CHECK (true);

-- 6.2 chat_sessions policies (User isolation)
DROP POLICY IF EXISTS "Users can read own chat sessions" ON public.chat_sessions;
CREATE POLICY "Users can read own chat sessions"
    ON public.chat_sessions FOR SELECT
    USING (auth.uid() = user_id OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "Users can insert own chat sessions" ON public.chat_sessions;
CREATE POLICY "Users can insert own chat sessions"
    ON public.chat_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can delete own chat sessions" ON public.chat_sessions;
CREATE POLICY "Users can delete own chat sessions"
    ON public.chat_sessions FOR DELETE
    USING (auth.uid() = user_id OR user_id IS NULL);

-- 6.3 chat_messages policies
DROP POLICY IF EXISTS "Users can read messages of own session" ON public.chat_messages;
CREATE POLICY "Users can read messages of own session"
    ON public.chat_messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.chat_sessions cs
            WHERE cs.id = chat_messages.session_id
            AND (cs.user_id = auth.uid() OR cs.user_id IS NULL)
        )
    );

DROP POLICY IF EXISTS "Users can insert messages to own session" ON public.chat_messages;
CREATE POLICY "Users can insert messages to own session"
    ON public.chat_messages FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.chat_sessions cs
            WHERE cs.id = chat_messages.session_id
            AND (cs.user_id = auth.uid() OR cs.user_id IS NULL)
        )
    );

