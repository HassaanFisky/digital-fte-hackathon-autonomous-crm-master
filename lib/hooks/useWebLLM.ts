"use client";
/**
 * useWebLLM — React hook for the WebLLM on-device engine.
 * Detects hardware on mount, loads the engine if supported.
 * Progress is driven by window 'webllm:progress' events.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import type { WebLLMStatus, ChatMessage } from '@/lib/webllm';

export interface UseWebLLMReturn {
  status: WebLLMStatus;
  progress: number;         // 0–100
  progressText: string;
  memoryGB: number | null;
  generate: (messages: ChatMessage[]) => AsyncGenerator<string>;
}

export function useWebLLM(): UseWebLLMReturn {
  const [status, setStatus] = useState<WebLLMStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [memoryGB, setMemoryGB] = useState<number | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const run = async () => {
      setStatus('detecting');

      // Dynamic import — stays client-only, never bundled on server
      const { detectWebGPU, getWebLLMEngine } = await import('@/lib/webllm');
      const hw = await detectWebGPU();
      setMemoryGB(hw.memory);

      if (!hw.supported) {
        setStatus('unsupported');
        return;
      }

      // Listen to progress events from the engine
      const onProgress = (e: Event) => {
        const { progress: pct, text } = (e as CustomEvent<{ progress: number; text: string }>).detail;
        setProgress(pct);
        setProgressText(text);
      };
      window.addEventListener('webllm:progress', onProgress);
      setStatus('loading');

      try {
        await getWebLLMEngine();
        setStatus('ready');
        setProgress(100);
        setProgressText('On-device engine ready');
      } catch (err) {
        console.error('[WebLLM] Engine load failed:', err);
        setStatus('unsupported');
      } finally {
        window.removeEventListener('webllm:progress', onProgress);
      }
    };

    run();
  }, []);

  const generate = useCallback(async function* (messages: ChatMessage[]) {
    if (status !== 'ready') return;
    const { generateWebLLM } = await import('@/lib/webllm');
    yield* generateWebLLM(messages);
  }, [status]);

  return { status, progress, progressText, memoryGB, generate };
}
