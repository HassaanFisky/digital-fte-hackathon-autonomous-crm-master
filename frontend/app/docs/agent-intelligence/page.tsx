"use client";

export default function AgentIntelligencePage() {
  return (
    <div className="prose prose-stone max-w-[800px]">
      <h1
        className="text-[2.5rem] font-black text-[#1A1612] leading-tight mb-6"
        style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900 }}
      >
        Agent Intelligence
      </h1>

      <h2
        className="text-[1.75rem] font-bold text-[#1A1612] mt-12 mb-4"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        The Groq + LLaMA-3.3 Backbone
      </h2>
      <p
        className="text-[#6B6459] text-[1.05rem] leading-relaxed mb-8"
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      >
        ARIA uses Groq&apos;s <code>llama-3.3-70b-versatile</code> model via an
        OpenAI-compatible API. The temperature is strictly set to <strong>0.3</strong> for
        a balanced mix of creativity (for empathetic responses) and reliability. Output
        tokens are capped at 2048.
      </p>

      <h2
        className="text-[1.75rem] font-bold text-[#1A1612] mt-12 mb-4"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        Prompt Chain Design
      </h2>
      <p
        className="text-[#6B6459] text-[1.05rem] leading-relaxed mb-6"
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      >
        The agent follows a mandatory 5-tool sequence to process inputs and form a response safely:
      </p>

      <div className="space-y-2 mb-12">
        {[
          "1. create_ticket (always first — log every interaction)",
          "2. get_customer_history (cross-channel context)",
          "3. search_knowledge_base (find relevant docs)",
          "4. [formulate response]",
          "5. send_response (always last — never skip)",
        ].map((step, idx) => (
          <div
            key={idx}
            className="border-l-[3px] border-[#CC5500] bg-[#EDE8DF] p-4 rounded-r-[6px] text-[#1A1612]"
            style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500 }}
          >
            {step}
          </div>
        ))}
      </div>

      <h2
        className="text-[1.75rem] font-bold text-[#1A1612] mt-12 mb-4"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        Human-in-the-Loop Approval Gates
      </h2>
      <p
        className="text-[#6B6459] text-[1.05rem] leading-relaxed mb-8"
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      >
        When ARIA detects a sensitive action, it immediately creates a 
        <code>/vault/Pending_Approval/ESCALATE_{'{id}'}.md</code> file and pauses. It
        waits for a human to review the file and move it to <code>/Approved</code>.
        The agent will never act on payments, legal matters, or new sensitive contacts without explicit approval.
      </p>

      <h2
        className="text-[1.75rem] font-bold text-[#1A1612] mt-12 mb-4"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        Auto-Escalation Triggers
      </h2>
      <div className="w-full overflow-x-auto mb-10">
        <table
          className="w-full text-left border-collapse"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          <thead>
            <tr className="bg-[#EDE8DF] text-[#1A1612]">
              <th className="p-3 font-semibold border-b border-[#DDD8CF]">Trigger</th>
              <th className="p-3 font-semibold border-b border-[#DDD8CF]">Reason</th>
            </tr>
          </thead>
          <tbody className="text-[#6B6459]">
            {[
              { trigger: "pricing mention", reason: "pricing_inquiry" },
              { trigger: "legal language", reason: "legal_matter" },
              { trigger: "refund request", reason: "refund_request" },
              { trigger: "sentiment < 0.3", reason: "low_sentiment_auto" },
              { trigger: '"human"/"manager"', reason: "explicit_human_request" },
              { trigger: "profanity detected", reason: "policy_violation" },
            ].map((row, i) => (
              <tr key={i} className="border-b border-[#DDD8CF] hover:bg-[#EDE8DF]/50 transition-colors">
                <td className="p-3"><code>{row.trigger}</code></td>
                <td className="p-3">{row.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2
        className="text-[1.75rem] font-bold text-[#1A1612] mt-12 mb-4"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        Hallucination Prevention
      </h2>
      <ul
        className="list-disc pl-6 space-y-2 text-[#6B6459] text-[1rem]"
        style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 400 }}
      >
        <li>Temperature 0.3 (not 0 — allows empathy, not randomness).</li>
        <li>System prompt explicitly bans promises not found in the knowledge base.</li>
        <li>All AI responses are routed through a <code>send_response</code> tool (never raw output).</li>
        <li>Knowledge base search is strictly required before answering product questions.</li>
      </ul>
    </div>
  );
}
