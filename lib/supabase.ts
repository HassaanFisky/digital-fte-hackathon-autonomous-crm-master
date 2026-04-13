/**
 * Supabase Client — H4 Autonomous Assistant Ecosystem
 * Separate from better-auth's DATABASE_URL (direct pg pool).
 * This uses the Supabase JS client with the anon/publishable key.
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// ── Browser singleton ─────────────────────────────────────────────────────────
let _browserClient: SupabaseClient | null = null;

export function getSupabaseBrowser(): SupabaseClient {
  if (!_browserClient) {
    _browserClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
  }
  return _browserClient;
}

// ── Server / API route client (fresh per request — no shared state) ───────────
export function createServerSupabaseClient(): SupabaseClient {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// ── Semantic search helper ────────────────────────────────────────────────────
export interface KnowledgeMatch {
  id: string;
  content: string;
  metadata: Record<string, unknown>;
  similarity: number;
}

export async function matchKnowledge(
  embedding: number[],
  matchThreshold = 0.7,
  matchCount = 5
): Promise<KnowledgeMatch[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.rpc('match_knowledge', {
    query_embedding: embedding,
    match_threshold: matchThreshold,
    match_count: matchCount,
  });
  if (error) {
    console.error('[Supabase] matchKnowledge error:', error.message);
    return [];
  }
  return (data as KnowledgeMatch[]) ?? [];
}
