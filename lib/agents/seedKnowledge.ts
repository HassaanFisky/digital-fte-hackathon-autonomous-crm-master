/**
 * seedKnowledge — One-time knowledge base seeder for H4 pgvector store.
 * Run via: POST /api/admin/seed (if that route exists) or directly in a script.
 *
 * Uses HuggingFace sentence-transformers/all-MiniLM-L6-v2 (384-dim vectors).
 * Inserts CRM domain knowledge into the knowledge_vectors Supabase table.
 */
import { createServerSupabaseClient } from '@/lib/supabase';
import { HfInference } from '@huggingface/inference';

const KNOWLEDGE_BASE = [
  {
    category: 'escalation',
    content: 'Escalation protocol: Any ticket with urgencyScore >= 8, sentiment "angry", or priority "critical" must be escalated to the senior support team within 15 minutes. Include customer emotional state, risk level, and recommended action in the escalation note.',
  },
  {
    category: 'crm',
    content: 'CRM ticket workflow: New tickets start as "Needs Review". After AI classification, they move to "In Progress". Human agents review and either mark "Resolved" or escalate. Resolution SLA is 2 hours for high priority and 24 hours for standard tickets.',
  },
  {
    category: 'crm',
    content: 'Billing issues are the most common ticket category. Common sub-issues: double charge, payment not processed, subscription renewal failure, refund not received. Resolution pathway: verify transaction ID, check payment gateway logs, initiate refund within 3–5 business days.',
  },
  {
    category: 'playbook',
    content: 'Support response playbook for frustrated customers: Acknowledge the inconvenience first. Never make excuses. Give a clear timeline. Offer a concrete next step. End with your name and direct contact. Tone: warm, calm, authoritative.',
  },
  {
    category: 'playbook',
    content: 'Handling account access issues: Verify identity via email + last 4 digits of payment. Do not share account details over chat. Use the password reset flow. If account is locked after 5 failed attempts, issue a manual unlock with a 24-hour temporary password.',
  },
  {
    category: 'product',
    content: 'Panaversity ecosystem: 5 hackathon modules — H0 (Portfolio Hub), H1 (Physical AI & Robotics), H2 (Evolution of To-Do, auth hub), H3 (LearnFlow Engine), H4 (Digital FTE / Autonomous CRM). Cross-module SSO is handled by H2. All modules share the Better-Auth authentication layer.',
  },
  {
    category: 'product',
    content: 'H4 Digital FTE feature set: Multi-agent AI support system (ARIA), support ticket management, CEO briefing generation, Kafka event monitoring, autonomous ticket classification, escalation intelligence, and dashboard analytics. Backend deployed on Koyeb.',
  },
  {
    category: 'crm',
    content: 'Technical support issues: First check browser compatibility (Chromium-based for WebLLM). Clear cache. Check network connectivity. If dashboard not loading, check NEXT_PUBLIC_API_URL environment variable. Backend cold-start takes 20–40 seconds on free hosting.',
  },
  {
    category: 'escalation',
    content: 'Data privacy escalation: Any customer mentioning GDPR, data deletion, or account data export must be escalated immediately regardless of urgency score. Compliance team must be notified within 1 hour. Do not share any data without legal review.',
  },
  {
    category: 'playbook',
    content: 'Feature request handling: Thank the customer for the suggestion. Log it in the product backlog. Set expectations: "We review feature requests monthly. I have added your request to our backlog and our product team will evaluate it in the next sprint cycle." Do not promise specific timelines.',
  },
];

async function embedText(hf: HfInference, text: string): Promise<number[]> {
  const result = await hf.featureExtraction({
    model: 'sentence-transformers/all-MiniLM-L6-v2',
    inputs: text,
  });
  // Returns number[] | number[][]
  const arr = Array.isArray(result[0]) ? result[0] as number[] : result as number[];
  return arr;
}

export async function seedKnowledgeBase(): Promise<{ seeded: number; errors: string[] }> {
  const hfToken = process.env.HF_TOKEN;
  if (!hfToken) {
    throw new Error('HF_TOKEN is required for embedding generation. Add it to .env.local.');
  }

  const hf = new HfInference(hfToken);
  const supabase = createServerSupabaseClient();
  const errors: string[] = [];
  let seeded = 0;

  for (const entry of KNOWLEDGE_BASE) {
    try {
      const embedding = await embedText(hf, entry.content);

      const { error } = await supabase.from('knowledge_vectors').insert({
        content: entry.content,
        embedding,
        category: entry.category,
        metadata: { source: 'seed', version: '1.0' },
      });

      if (error) {
        errors.push(`[${entry.category}] ${error.message}`);
      } else {
        seeded++;
        console.log(`[Seed] ✓ ${entry.category} (${entry.content.slice(0, 50)}...)`);
      }
    } catch (err: unknown) {
      const e = err as Error;
      errors.push(`[${entry.category}] ${e.message}`);
    }
  }

  return { seeded, errors };
}
