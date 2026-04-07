"use client";

import { useState } from "react";

export type AgentType = "architect" | "marketing";

interface UseAiraAgentResult {
  isLoading: boolean;
  error: string | null;
  result: string | null;
  runAgent: (prompt: string, type: AgentType) => Promise<void>;
}

export function useAiraAgent(): UseAiraAgentResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const runAgent = async (prompt: string, type: AgentType) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, type }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to execute agent");
      }

      setResult(data.result);
    } catch (err: any) {
      setError(err?.message || "Something went wrong execution the AIRA agent.");
      console.error("Agent Execution Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, error, result, runAgent };
}
