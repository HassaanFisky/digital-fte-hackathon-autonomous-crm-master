/**
 * Groq Round-Robin Pool — H4 Autonomous Assistant Ecosystem
 * Rotates across 3 API keys to distribute load and handle rate limits.
 * All streaming responses are encoded as Server-Sent Events (SSE).
 */
import Groq from 'groq-sdk';

// ── Key Pool ──────────────────────────────────────────────────────────────────
const GROQ_KEYS = [
  process.env.GROQ_API_KEY_1 || process.env.GROQ_API_KEY_PRIMARY || '',
  process.env.GROQ_API_KEY_2 || process.env.GROQ_API_KEY_SECONDARY || '',
  process.env.GROQ_API_KEY_3 || '',
];

/** Selects a key by time-bucket rotation (~1 key per second, even distribution). */
export function getGroqKey(offset = 0): string {
  const idx = ((Math.floor(Date.now() / 1000) + offset) % 3 + 3) % 3;
  return GROQ_KEYS[idx];
}

/** Returns a Groq client using the pooled key at the given rotation offset. */
export function getGroqClient(offset = 0): Groq {
  return new Groq({ apiKey: getGroqKey(offset) });
}

// ── Agent Model & Temp Config ─────────────────────────────────────────────────
export type AgentTier = 'manager' | 'research' | 'sales' | 'technical' | 'support' | 'classifier' | 'escalation' | 'suggester';

interface AgentConfig {
  model: string;
  temperature: number;
  max_tokens: number;
}

export const AGENT_CONFIGS: Record<AgentTier, AgentConfig> = {
  manager:    { model: 'llama-3.1-70b-versatile', temperature: 0.1, max_tokens: 256   },
  research:   { model: 'llama-3.1-70b-versatile', temperature: 0.3, max_tokens: 1024  },
  sales:      { model: 'llama-3.1-70b-versatile', temperature: 0.8, max_tokens: 2048  },
  technical:  { model: 'llama-3.3-70b-versatile', temperature: 0.2, max_tokens: 1024  },
  support:    { model: 'llama-3.3-70b-versatile', temperature: 0.7, max_tokens: 1024  },
  classifier: { model: 'llama-3.3-70b-versatile', temperature: 0.3, max_tokens: 512   },
  escalation: { model: 'llama-3.3-70b-versatile', temperature: 0.4, max_tokens: 512   },
  suggester:  { model: 'llama-3.1-70b-versatile', temperature: 0.6, max_tokens: 256   },
};

// ── SSE Helpers ───────────────────────────────────────────────────────────────
export interface SSEChunk {
  type: 'token' | 'routing' | 'done' | 'error';
  content?: string;
  agent?: string;
  model?: string;
  ms?: number;
  error?: string;
}

export function encodeSSE(chunk: SSEChunk): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(chunk)}\n\n`);
}

// ── Non-streaming completion (for Manager agent fast routing) ─────────────────
export async function groqComplete(
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
  agentTier: AgentTier,
  keyOffset = 0
): Promise<string> {
  const { model, temperature, max_tokens } = AGENT_CONFIGS[agentTier];
  let lastErr: Error | null = null;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const client = getGroqClient(keyOffset + attempt);
      const completion = await client.chat.completions.create({
        messages: messages as Groq.Chat.ChatCompletionMessageParam[],
        model,
        temperature,
        max_tokens,
      });
      return completion.choices[0]?.message?.content || '';
    } catch (err: unknown) {
      const e = err as Error & { status?: number };
      lastErr = e;
      // Retry on rate-limit (429) or server error (503) with next key
      if (e.status === 429 || e.status === 503) continue;
      throw e;
    }
  }
  throw lastErr ?? new Error('All Groq keys exhausted');
}

// ── Streaming completion → ReadableStream (SSE) ───────────────────────────────
export function groqStream(
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
  agentTier: AgentTier,
  keyOffset = 0,
  startMs: number = Date.now()
): ReadableStream<Uint8Array> {
  const { model, temperature, max_tokens } = AGENT_CONFIGS[agentTier];

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      let attempt = 0;
      while (attempt < 3) {
        try {
          const client = getGroqClient(keyOffset + attempt);
          const stream = await client.chat.completions.create({
            messages: messages as Groq.Chat.ChatCompletionMessageParam[],
            model,
            temperature,
            max_tokens,
            stream: true,
          });

          for await (const chunk of stream) {
            const token = chunk.choices[0]?.delta?.content;
            if (token) {
              controller.enqueue(encodeSSE({ type: 'token', content: token }));
            }
          }

          controller.enqueue(
            encodeSSE({ type: 'done', model: `groq-key-${((keyOffset + attempt) % 3) + 1}`, ms: Date.now() - startMs })
          );
          controller.close();
          return;
        } catch (err: unknown) {
          const e = err as Error & { status?: number };
          if ((e.status === 429 || e.status === 503) && attempt < 2) {
            attempt++;
            continue;
          }
          controller.enqueue(encodeSSE({ type: 'error', error: e.message }));
          controller.close();
          return;
        }
      }
    },
  });
}
