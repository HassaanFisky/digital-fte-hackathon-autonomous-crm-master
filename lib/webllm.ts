/**
 * WebLLM Engine — H4 Autonomous Assistant Ecosystem
 * CLIENT-ONLY. Never import this in server components or API routes.
 * Runs Llama-3-8B-Instruct entirely in the browser via WebGPU.
 *
 * State machine: IDLE → DETECTING → LOADING → READY | UNSUPPORTED
 */

// Dynamic import guard — only use inside browser useEffect
let _engine: import('@mlc-ai/web-llm').MLCEngine | null = null;
let _enginePromise: Promise<import('@mlc-ai/web-llm').MLCEngine> | null = null;

export type WebLLMStatus = 'idle' | 'detecting' | 'loading' | 'ready' | 'unsupported';

export interface HardwareCapability {
  supported: boolean;
  memory: number | null; // GB via navigator.deviceMemory
  gpu: boolean;
}

/** Detects WebGPU support and device memory. Requires >= 4 GB. */
export async function detectWebGPU(): Promise<HardwareCapability> {
  if (typeof window === 'undefined') {
    return { supported: false, memory: null, gpu: false };
  }

  const hasGPU = 'gpu' in navigator && typeof (navigator as Navigator & { gpu?: unknown }).gpu !== 'undefined';
  if (!hasGPU) {
    return { supported: false, memory: null, gpu: false };
  }

  // navigator.deviceMemory is non-standard but available in Chrome 63+
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? null;
  const hasEnoughMemory = memory === null || memory >= 4;

  // Try requesting a GPU adapter to confirm WebGPU actually works
  try {
    const adapter = await (navigator as Navigator & { gpu: { requestAdapter(): Promise<unknown> } }).gpu.requestAdapter();
    if (!adapter) return { supported: false, memory, gpu: false };
  } catch {
    return { supported: false, memory, gpu: false };
  }

  return { supported: hasEnoughMemory, memory, gpu: true };
}

/**
 * Lazy singleton — returns the same engine across calls.
 * Progress events: dispatches window CustomEvent('webllm:progress', { detail: { progress, text } })
 */
export async function getWebLLMEngine(): Promise<import('@mlc-ai/web-llm').MLCEngine> {
  if (_engine) return _engine;
  if (_enginePromise) return _enginePromise;

  _enginePromise = (async () => {
    const { CreateMLCEngine } = await import('@mlc-ai/web-llm');

    const engine = await CreateMLCEngine(
      'Llama-3-8B-Instruct-q4f32_1-MLC',
      {
        initProgressCallback: (progress: { progress: number; text: string }) => {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('webllm:progress', {
                detail: { progress: Math.round(progress.progress * 100), text: progress.text },
              })
            );
          }
        },
      }
    );

    _engine = engine;
    return engine;
  })();

  return _enginePromise;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Token-streaming generator for on-device inference.
 * Usage: for await (const token of generateWebLLM(messages)) { ... }
 */
export async function* generateWebLLM(messages: ChatMessage[]): AsyncGenerator<string> {
  const engine = await getWebLLMEngine();

  const stream = await engine.chat.completions.create({
    messages,
    stream: true,
    temperature: 0.7,
    max_tokens: 1024,
  });

  for await (const chunk of stream) {
    const token = chunk.choices[0]?.delta?.content;
    if (token) yield token;
  }
}

/** Resets the engine singleton (e.g. for testing or memory pressure). */
export function resetWebLLMEngine() {
  _engine = null;
  _enginePromise = null;
}
