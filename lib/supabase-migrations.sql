-- ═══════════════════════════════════════════════════════════════════════════
-- H4 Autonomous Assistant Ecosystem — Supabase pgvector Schema
-- Run this once in your Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- ── Knowledge vectors (semantic search base) ─────────────────────────────────
-- Uses all-MiniLM-L6-v2 embeddings = 384 dimensions
CREATE TABLE IF NOT EXISTS knowledge_vectors (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content    TEXT NOT NULL,
  embedding  VECTOR(384),
  metadata   JSONB DEFAULT '{}',
  category   TEXT,           -- 'crm', 'escalation', 'product', 'playbook'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- IVFFlat cosine index for fast approximate nearest-neighbor search
CREATE INDEX IF NOT EXISTS knowledge_vectors_embedding_idx
  ON knowledge_vectors USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Semantic search function (called by Technical Agent)
CREATE OR REPLACE FUNCTION match_knowledge(
  query_embedding VECTOR(384),
  match_threshold FLOAT DEFAULT 0.7,
  match_count     INT   DEFAULT 5
)
RETURNS TABLE (
  id         UUID,
  content    TEXT,
  metadata   JSONB,
  similarity FLOAT
)
LANGUAGE SQL STABLE AS $$
  SELECT
    id,
    content,
    metadata,
    1 - (embedding <=> query_embedding) AS similarity
  FROM knowledge_vectors
  WHERE 1 - (embedding <=> query_embedding) > match_threshold
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$;

-- ── CRM Tickets (promotes localStorage to persistent DB) ──────────────────────
CREATE TABLE IF NOT EXISTS crm_tickets (
  id          TEXT PRIMARY KEY,
  customer    TEXT NOT NULL,
  email       TEXT,
  channel     TEXT DEFAULT 'Aira Support',
  status      TEXT DEFAULT 'Needs Review',
  priority    TEXT DEFAULT 'medium',    -- low | medium | high | critical
  message     TEXT,
  category    TEXT,
  sentiment   TEXT,
  urgency     INT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER crm_tickets_updated_at
  BEFORE UPDATE ON crm_tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Row-level security: all authenticated users can read; service role can write
ALTER TABLE crm_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_vectors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_read_tickets" ON crm_tickets FOR SELECT USING (true);
CREATE POLICY "anon_read_knowledge" ON knowledge_vectors FOR SELECT USING (true);
