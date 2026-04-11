import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { HfInference } from '@huggingface/inference';
import {
  ARIA_SUPPORT_AGENT,
  ARIA_CLASSIFIER_AGENT,
  ARIA_SUGGESTER_AGENT,
  ARIA_ANALYST_AGENT,
  ARIA_ESCALATION_AGENT,
} from '@/lib/agents/systemPrompts';

export const runtime = 'edge';

const AGENT_PROMPTS = {
  support: ARIA_SUPPORT_AGENT,
  classifier: ARIA_CLASSIFIER_AGENT,
  suggester: ARIA_SUGGESTER_AGENT,
  analyst: ARIA_ANALYST_AGENT,
  escalation: ARIA_ESCALATION_AGENT,
};

type AgentType = keyof typeof AGENT_PROMPTS;

interface AgentRequest {
  message: string;
  agentType: AgentType;
  context?: Record<string, unknown>;
}

/**
 * Strips all markdown, code fences, and whitespace from response text for JSON parsing.
 */
function sanitizeJsonResponse(text: string): string {
  // Remove markdown code blocks (e.g., ```json ... ```)
  let clean = text.replace(/```(?:json)?\s*([\s\S]*?)\s*```/g, '$1');
  // Remove remaining markdown indicators and extra whitespace
  clean = clean.trim();
  return clean;
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { message, agentType, context } = (await req.json()) as AgentRequest;
    
    if (!message || !agentType || !AGENT_PROMPTS[agentType]) {
      return NextResponse.json(
        { success: false, error: 'Invalid request parameters.' },
        { status: 400 }
      );
    }

    const systemPrompt = AGENT_PROMPTS[agentType];
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message },
    ];

    let responseText = '';
    let modelUsed: 'groq-primary' | 'groq-secondary' | 'hf-fallback' = 'groq-primary';

    // TIER 1: Groq Primary
    try {
      const apiKey = process.env.GROQ_API_KEY_PRIMARY || process.env.GROQ_API_KEY || '';
      if (!apiKey) throw new Error('GROQ_API_KEY_PRIMARY is missing');
      
      const groqPrimary = new Groq({ apiKey });
      const completion = await groqPrimary.chat.completions.create({
        messages: messages as any,
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 1024,
      });
      responseText = completion.choices[0]?.message?.content || '';
      if (!responseText) throw new Error('Empty response from Groq Primary');
    } catch (err: any) {
      console.error('Groq Primary Error:', err.message);
      
      // TIER 2: Groq Secondary
      modelUsed = 'groq-secondary';
      try {
        const apiKey = process.env.GROQ_API_KEY_SECONDARY || '';
        if (!apiKey) throw new Error('GROQ_API_KEY_SECONDARY is missing');

        const groqSecondary = new Groq({ apiKey });
        const completion = await groqSecondary.chat.completions.create({
          messages: messages as any,
          model: 'llama-3.3-70b-versatile',
          temperature: 0.7,
          max_tokens: 1024,
        });
        responseText = completion.choices[0]?.message?.content || '';
        if (!responseText) throw new Error('Empty response from Groq Secondary');
      } catch (err2: any) {
        console.error('Groq Secondary Error:', err2.message);
        
        // TIER 3: HF Fallback
        modelUsed = 'hf-fallback';
        try {
          const hfToken = process.env.HF_TOKEN || '';
          if (!hfToken) throw new Error('HF_TOKEN is missing');

          const hf = new HfInference(hfToken);
          const response = await hf.chatCompletion({

            model: 'meta-llama/Llama-3.3-70B-Instruct',
            messages: messages as any,
            max_tokens: 1024,
            temperature: 0.7,
          });
          responseText = response.choices[0]?.message?.content || '';
          if (!responseText) throw new Error('Empty response from HF');
        } catch (err3: any) {
          console.error('HF Fallback Error:', err3.message);
          return NextResponse.json(
            { 
              success: false, 
              error: 'All AI providers temporarily unavailable. Please retry in 30 seconds.',
              agentType 
            },
            { status: 503 }
          );
        }
      }
    }

    let parsedResult: any = responseText;
    const needsParsing = ['classifier', 'suggester', 'analyst'].includes(agentType);

    if (needsParsing) {
      try {
        const sanitized = sanitizeJsonResponse(responseText);
        parsedResult = JSON.parse(sanitized);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError, 'Raw response:', responseText);
        // Fallback or retry logic could go here, but per requirements we just return the error
        return NextResponse.json(
          { 
            success: false, 
            error: 'Failed to parse AI response as JSON.',
            agentType 
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: parsedResult,
      model: modelUsed,
      agentType,
      processingMs: Date.now() - startTime,
    });

  } catch (globalError: any) {
    console.error('Global API Error:', globalError.message);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred.', details: globalError.message },
      { status: 500 }
    );
  }
}
