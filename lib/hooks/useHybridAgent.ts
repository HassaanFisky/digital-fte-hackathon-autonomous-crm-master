"use client";
/**
 * useHybridAgent — Orchestrating hook for the H4 AI Engine.
 *
 * Priority:  WebLLM (on-device, free) → Groq SSE (cloud, pooled keys)
 * Sub-agents: manager routes to research | sales | technical | support | escalation
 *
 * Backward compat: useAiraAgent and useAriaAgent are NOT replaced — they
 * still serve the floating assistant's classifier/suggester calls.
 */
import { useState, useCallback } from 'react';
import { useWebLLM } from '@/lib/hooks/useWebLLM';
import type { ChatMessage } from '@/lib/webllm';
import type { AgentTier } from '@/lib/groqPool';

export type AgentSource = 'webllm' | 'groq' | null;

export interface HybridAgentState {
  tokens: string;
  isStreaming: boolean;
  source: AgentSource;
  routedTo: AgentTier | null;
  error: string | null;
}

export interface UseHybridAgentReturn extends HybridAgentState {
  sendMessage: (message: string, agentType?: AgentTier | 'auto') => Promise<void>;
  reset: () => void;
}

const INITIAL_STATE: HybridAgentState = {
  tokens: '',
  isStreaming: false,
  source: null,
  routedTo: null,
  error: null,
};

export function useHybridAgent(): UseHybridAgentReturn {
  const [state, setState] = useState<HybridAgentState>(INITIAL_STATE);
  const { status: webLLMStatus, generate } = useWebLLM();

  const reset = useCallback(() => setState(INITIAL_STATE), []);

  const sendMessage = useCallback(async (
    message: string,
    agentType: AgentTier | 'auto' = 'auto'
  ) => {
    setState({ tokens: '', isStreaming: true, source: null, routedTo: null, error: null });

    // ── PATH A: WebLLM on-device (free, private) ──────────────────────────────
    if (webLLMStatus === 'ready' && agentType !== 'manager') {
      setState(s => ({ ...s, source: 'webllm' }));
      try {
        const messages: ChatMessage[] = [
          { role: 'system', content: 'You are ARIA, a world-class autonomous assistant. Be concise, accurate, and helpful.' },
          { role: 'user', content: message },
        ];
        let accumulated = '';
        for await (const token of generate(messages)) {
          accumulated += token;
          setState(s => ({ ...s, tokens: accumulated }));
        }
        setState(s => ({ ...s, isStreaming: false }));
        return;
      } catch (err) {
        // Fall through to Groq on WebLLM error
        console.warn('[HybridAgent] WebLLM failed, falling back to Groq:', err);
      }
    }

    // ── PATH B: Groq SSE (cloud fallback) ─────────────────────────────────────
    setState(s => ({ ...s, source: 'groq' }));

    try {
      let targetAgent: AgentTier = agentType === 'auto' ? 'support' : agentType as AgentTier;

      // Step 1: Manager routing (only when agentType is 'auto' or 'manager')
      if (agentType === 'auto' || agentType === 'manager') {
        const managerRes = await fetch('/api/agents/manager', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message, stream: false }),
        });

        if (managerRes.ok) {
          const json = await managerRes.json();
          if (json.targetAgent) {
            targetAgent = json.targetAgent as AgentTier;
            setState(s => ({ ...s, routedTo: targetAgent }));
          }
        }
      } else {
        setState(s => ({ ...s, routedTo: targetAgent }));
      }

      // Step 2: Stream from the target sub-agent
      const agentRes = await fetch(`/api/agents/${targetAgent}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, stream: true }),
      });

      if (!agentRes.ok || !agentRes.body) {
        throw new Error(`Agent ${targetAgent} returned ${agentRes.status}`);
      }

      const reader = agentRes.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const chunk = JSON.parse(line.slice(6));
            if (chunk.type === 'token' && chunk.content) {
              accumulated += chunk.content;
              setState(s => ({ ...s, tokens: accumulated }));
            } else if (chunk.type === 'routing' && chunk.agent) {
              setState(s => ({ ...s, routedTo: chunk.agent as AgentTier }));
            } else if (chunk.type === 'done') {
              setState(s => ({ ...s, isStreaming: false }));
            } else if (chunk.type === 'error') {
              throw new Error(chunk.error);
            }
          } catch {
            // Skip malformed SSE lines
          }
        }
      }

      setState(s => ({ ...s, isStreaming: false }));
    } catch (err: unknown) {
      const e = err as Error;
      setState(s => ({ ...s, isStreaming: false, error: e.message }));
    }
  }, [webLLMStatus, generate]);

  return { ...state, sendMessage, reset };
}
