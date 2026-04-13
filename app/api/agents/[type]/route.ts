import { NextRequest, NextResponse } from 'next/server';
import {
  groqComplete,
  groqStream,
  encodeSSE,
  type AgentTier,
} from '@/lib/groqPool';
import {
  ARIA_MANAGER_AGENT,
  ARIA_RESEARCH_AGENT,
  ARIA_SALES_AGENT,
  ARIA_TECHNICAL_AGENT,
  ARIA_SUPPORT_AGENT,
  ARIA_CLASSIFIER_AGENT,
  ARIA_ESCALATION_AGENT,
  ARIA_SUGGESTER_AGENT,
} from '@/lib/agents/systemPrompts';
import { matchKnowledge } from '@/lib/supabase';
import { HfInference } from '@huggingface/inference';

export const runtime = 'edge';

// ── System prompt map ─────────────────────────────────────────────────────────
const SYSTEM_PROMPTS: Record<AgentTier, string> = {
  manager:    ARIA_MANAGER_AGENT,
  research:   ARIA_RESEARCH_AGENT,
  sales:      ARIA_SALES_AGENT,
  technical:  ARIA_TECHNICAL_AGENT,
  support:    ARIA_SUPPORT_AGENT,
  classifier: ARIA_CLASSIFIER_AGENT,
  escalation: ARIA_ESCALATION_AGENT,
  suggester:  ARIA_SUGGESTER_AGENT,
};

// ── Web search helpers ────────────────────────────────────────────────────────
async function tavilySearch(query: string): Promise<string> {
  const keyIdx = Math.floor(Date.now() / 1000) % 2;
  const key = keyIdx === 0
    ? process.env.TAVILY_API_KEY_1
    : process.env.TAVILY_API_KEY_2;

  if (!key) return '';

  try {
    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: key, query, search_depth: 'advanced', max_results: 5 }),
    });
    if (!res.ok) return '';
    const data = await res.json() as { results?: { title: string; content: string; url: string }[] };
    return (data.results ?? [])
      .map((r, i) => `[${i + 1}] ${r.title}\n${r.content}\nSource: ${r.url}`)
      .join('\n\n');
  } catch {
    return '';
  }
}

async function serperSearch(query: string): Promise<string> {
  const key = process.env.SERPER_API_KEY_1;
  if (!key) return '';

  try {
    const res = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-KEY': key },
      body: JSON.stringify({ q: query, num: 5 }),
    });
    if (!res.ok) return '';
    const data = await res.json() as {
      organic?: { title: string; snippet: string; link: string }[];
    };
    return (data.organic ?? [])
      .map((r, i) => `[${i + 1}] ${r.title}\n${r.snippet}\nSource: ${r.link}`)
      .join('\n\n');
  } catch {
    return '';
  }
}

// ── Embedding for Technical Agent pgvector search ─────────────────────────────
async function getEmbedding(text: string): Promise<number[] | null> {
  const hfToken = process.env.HF_TOKEN;
  if (!hfToken) return null;

  try {
    const hf = new HfInference(hfToken);
    const result = await hf.featureExtraction({
      model: 'sentence-transformers/all-MiniLM-L6-v2',
      inputs: text,
    });
    // featureExtraction returns number[] | number[][]
    const arr = Array.isArray(result[0]) ? result[0] as number[] : result as number[];
    return arr;
  } catch {
    return null;
  }
}

// ── Main route handler ────────────────────────────────────────────────────────
export async function POST(
  req: NextRequest,
  { params }: { params: { type: string } }
) {
  const startMs = Date.now();
  const agentType = params.type as AgentTier;

  if (!SYSTEM_PROMPTS[agentType]) {
    return NextResponse.json({ error: `Unknown agent type: ${agentType}` }, { status: 400 });
  }

  const body = await req.json() as { message: string; stream?: boolean; context?: Record<string, unknown> };
  const { message, stream = true } = body;

  if (!message) {
    return NextResponse.json({ error: 'message is required' }, { status: 400 });
  }

  // ── MANAGER: non-streaming, fast routing JSON ─────────────────────────────
  if (agentType === 'manager') {
    try {
      const raw = await groqComplete(
        [{ role: 'system', content: ARIA_MANAGER_AGENT }, { role: 'user', content: message }],
        'manager'
      );
      // Strip markdown fences if present
      const clean = raw.replace(/```(?:json)?\s*([\s\S]*?)\s*```/g, '$1').trim();
      const parsed = JSON.parse(clean);
      return NextResponse.json({ ...parsed, ms: Date.now() - startMs });
    } catch (err: unknown) {
      const e = err as Error;
      return NextResponse.json({ targetAgent: 'support', reasoning: 'Routing fallback', enrichedQuery: message, error: e.message });
    }
  }

  // ── All other agents: SSE streaming ──────────────────────────────────────
  let userContent = message;

  // RESEARCH: parallel Tavily + Serper
  if (agentType === 'research') {
    const [tavily, serper] = await Promise.allSettled([
      tavilySearch(message),
      serperSearch(message),
    ]);
    const tavilyText = tavily.status === 'fulfilled' ? tavily.value : '';
    const serperText = serper.status === 'fulfilled' ? serper.value : '';

    if (tavilyText || serperText) {
      userContent = `Query: ${message}\n\n`;
      if (tavilyText) userContent += `TAVILY RESULTS:\n${tavilyText}\n\n`;
      if (serperText) userContent += `SERPER RESULTS:\n${serperText}`;
    }
  }

  // TECHNICAL: pgvector semantic search
  if (agentType === 'technical') {
    const embedding = await getEmbedding(message);
    if (embedding) {
      const matches = await matchKnowledge(embedding, 0.65, 5);
      if (matches.length > 0) {
        const context = matches
          .map((m, i) => `[${i + 1}] (similarity: ${m.similarity.toFixed(2)})\n${m.content}`)
          .join('\n\n');
        userContent = `Query: ${message}\n\nKNOWLEDGE BASE CONTEXT:\n${context}`;
      }
    }
  }

  const messages = [
    { role: 'system' as const, content: SYSTEM_PROMPTS[agentType] },
    { role: 'user' as const, content: userContent },
  ];

  // Non-streaming path (stream=false)
  if (!stream) {
    try {
      const response = await groqComplete(messages, agentType);
      return NextResponse.json({ success: true, data: response, agentType, ms: Date.now() - startMs });
    } catch (err: unknown) {
      const e = err as Error;
      return NextResponse.json({ success: false, error: e.message }, { status: 503 });
    }
  }

  // Streaming SSE path
  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      // Emit routing event so the client knows which agent is responding
      controller.enqueue(encodeSSE({ type: 'routing', agent: agentType }));

      const agentStream = groqStream(messages, agentType, 0, startMs);
      const reader = agentStream.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          controller.enqueue(value);
        }
      } finally {
        reader.releaseLock();
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
