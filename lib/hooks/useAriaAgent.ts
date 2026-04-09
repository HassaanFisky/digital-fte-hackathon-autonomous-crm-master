'use client';

import { useState, useCallback } from 'react';

interface ClassificationResponse {
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'billing' | 'technical' | 'account' | 'feature-request' | 'general';
  sentiment: 'positive' | 'neutral' | 'frustrated' | 'angry';
  urgencyScore: number;
  suggestedResponseOpener: string;
  estimatedResolutionMinutes: number;
}

interface AnalysisResponse {
  topIssueCategory: string;
  resolutionRatePercent: number;
  avgResponseTimeMinutes: number;
  agentPerformanceScore: number;
  weeklyTrend: 'improving' | 'stable' | 'declining';
  criticalInsight: string;
  recommendedAction: string;
}

export const useAriaAgent = () => {
  const [isLoadingSupport, setIsLoadingSupport] = useState(false);
  const [isLoadingClassifier, setIsLoadingClassifier] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [isLoadingEscalation, setIsLoadingEscalation] = useState(false);

  const [supportResponse, setSupportResponse] = useState<string>('');
  const [classification, setClassification] = useState<ClassificationResponse | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [escalationNote, setEscalationNote] = useState<string>('');
  const [activeModel, setActiveModel] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const callAgent = async (message: string, agentType: string, context?: any) => {
    const res = await fetch('/api/agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, agentType, context }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || `Failed to call ${agentType} agent`);
    return data;
  };

  const submitTicket = useCallback(async (name: string, email: string, message: string) => {
    setIsLoadingSupport(true);
    setIsLoadingClassifier(true);
    setError(null);

    try {
      const [classifierRes, supportRes] = await Promise.all([
        callAgent(message, 'classifier'),
        callAgent(`Customer Name: ${name}. Email: ${email}. Message: ${message}`, 'support'),
      ]);

      setClassification(classifierRes.data);
      setSupportResponse(supportRes.data);
      setActiveModel(supportRes.model);

      // Automatic escalation if urgency is high
      if (classifierRes.data.urgencyScore >= 8) {
        setIsLoadingEscalation(true);
        try {
          const escalationRes = await callAgent(`Customer: ${name}. Issue: ${message}. Priority: ${classifierRes.data.priority}`, 'escalation');
          setEscalationNote(escalationRes.data);
        } catch (escErr) {
          console.error('Escalation failed:', escErr);
        } finally {
          setIsLoadingEscalation(false);
        }
      }
    } catch (err: any) {
      console.error('Submit ticket error:', err);
      setError(err.message || 'Failed to process ticket with ARIA intelligence.');
    } finally {
      setIsLoadingSupport(false);
      setIsLoadingClassifier(false);
    }
  }, []);

  const getSuggestions = useCallback(async (name: string) => {
    setIsLoadingSuggestions(true);
    setError(null);
    try {
      const res = await callAgent(`Customer name: ${name}. Platform: ARIA Digital CRM support system.`, 'suggester');
      setSuggestions(res.data);
    } catch (err: any) {
      console.error('Get suggestions error:', err);
      setError(err.message || 'Failed to fetch smart suggestions.');
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, []);

  const runAnalysis = useCallback(async () => {
    setIsLoadingAnalysis(true);
    setError(null);
    try {
      const res = await callAgent('Generate current support operations intelligence report.', 'analyst');
      setAnalysis(res.data);
    } catch (err: any) {
      console.error('Run analysis error:', err);
      setError(err.message || 'Failed to generate intelligence report.');
    } finally {
      setIsLoadingAnalysis(false);
    }
  }, []);

  const runAgentCommand = useCallback(async (agentType: string, message: string) => {
    setError(null);
    try {
      const res = await callAgent(message, agentType);
      return res;
    } catch (err: any) {
      console.error(`Run command for ${agentType} failed:`, err);
      setError(err.message || `Failed to execute command for ${agentType}.`);
      throw err;
    }
  }, []);

  const resetState = () => {
    setSupportResponse('');
    setClassification(null);
    setSuggestions([]);
    setAnalysis(null);
    setEscalationNote('');
    setActiveModel('');
    setError(null);
  };

  return {
    isLoadingSupport,
    isLoadingClassifier,
    isLoadingSuggestions,
    isLoadingAnalysis,
    isLoadingEscalation,
    supportResponse,
    classification,
    suggestions,
    analysis,
    escalationNote,
    activeModel,
    error,
    submitTicket,
    getSuggestions,
    runAnalysis,
    runAgentCommand,
    resetState,
  };
};
