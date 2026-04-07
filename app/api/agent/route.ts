import { HfInference } from "@huggingface/inference";
import { NextResponse } from "next/server";

// Using Edge Runtime for ultra-low latency and no cold starts on Vercel
export const runtime = "edge";

const hf = new HfInference(process.env.HF_TOKEN);

const SYSTEM_PROMPTS = {
  architect: `You are the Senior Code Architect at AIRA Digital. 
Expertise: Next.js, TypeScript, Scalable Cloud Architectures.
Style: Professional, concise, technical. 
Deliverables: Production-ready code, architectural diagrams (text-based), or strategic technical debt analysis.
Constraint: Provide direct solutions. Do not use generic pleasantries.`,
  
  marketing: `You are the Chief Digital Marketing Officer at AIRA Digital. 
Expertise: High-conversion copy, performance marketing, viral growth loops, and brand storytelling.
Style: Persuasive, premium, sharp, and results-oriented.
Deliverables: Creative campaign hooks, SEO-optimized content, and social media strategy.
Constraint: Maintain a "High-Fidelity Humanist" tone that feels elite and authentic.`
};

const MODELS = {
  architect: "Qwen/Qwen2.5-Coder-32B-Instruct",
  marketing: "meta-llama/Llama-3.3-70B-Instruct"
};

export async function POST(req: Request) {
  try {
    const { prompt, type } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const agentType = type === "architect" ? "architect" : "marketing";
    const systemPrompt = SYSTEM_PROMPTS[agentType];
    const model = MODELS[agentType];

    if (!process.env.HF_TOKEN) {
      return NextResponse.json({ error: "HF_TOKEN not configured" }, { status: 500 });
    }

    const response = await hf.chatCompletion({
      model: model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      max_tokens: 1500,
      temperature: 0.7,
    });

    const result = response.choices[0]?.message?.content || "No response generated.";

    return NextResponse.json({ result });

  } catch (error: any) {
    console.error("Agent Error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
