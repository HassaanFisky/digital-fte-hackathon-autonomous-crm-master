"use client";

export default function GettingStartedPage() {
  return (
    <div className="prose prose-stone max-w-[800px]">
      <h1
        className="text-[2.5rem] font-black text-[#1A1612] leading-tight mb-6"
        style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900 }}
      >
        Getting Started with ARIA
      </h1>

      <p
        className="text-[#1A1612] text-[1.125rem] leading-relaxed mb-8"
        style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 400 }}
      >
        ARIA is an AI customer support agent capable of handling Email, WhatsApp, and
        Web Form interactions 24/7. It combines the power of large language models
        with strict operational guardrails.
      </p>

      <h2
        className="text-[1.75rem] font-bold text-[#1A1612] mt-12 mb-4"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        Prerequisites
      </h2>
      <ul
        className="list-disc pl-6 space-y-2 text-[#6B6459] text-[1rem]"
        style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 400 }}
      >
        <li>A modern browser (Chrome, Firefox, Safari)</li>
        <li>Your support request details</li>
        <li>Optional: WhatsApp or Gmail for multi-channel</li>
      </ul>

      <h2
        className="text-[1.75rem] font-bold text-[#1A1612] mt-12 mb-4"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        Submitting Your First Ticket
      </h2>
      <ol
        className="list-decimal pl-6 space-y-2 text-[#6B6459] text-[1rem]"
        style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 400 }}
      >
        <li>Go to <code>/support</code></li>
        <li>Fill in contact details (Name, Email)</li>
        <li>Describe your issue and set priority</li>
        <li>Submit — you&apos;ll receive a Ticket ID instantly</li>
      </ol>

      <h2
        className="text-[1.75rem] font-bold text-[#1A1612] mt-12 mb-6"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        Ticket Lifecycle
      </h2>
      <div
        className="flex flex-col md:flex-row items-center justify-between bg-transparent gap-4 pt-4 pb-8"
        style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: "0.8rem" }}
      >
        {["Web Form", "Kafka Queue", "Groq LLaMA", "DB Stored", "Auto Reply Sent", "Resolved / Escalated"].map((step, idx, arr) => (
          <div key={idx} className="flex flex-col md:flex-row items-center gap-4">
            <div className="bg-[#EDE8DF] border border-[#DDD8CF] rounded-[6px] px-[16px] py-[10px] text-[#1A1612] whitespace-nowrap">
              {step}
            </div>
            {idx < arr.length - 1 && (
              <div className="text-[#CC5500] font-bold text-lg rotate-90 md:rotate-0">
                →
              </div>
            )}
          </div>
        ))}
      </div>

      <h2
        className="text-[1.75rem] font-bold text-[#1A1612] mt-8 mb-4"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        Live curl Example
      </h2>
      <div className="bg-[#1A1612] rounded-[8px] p-5 overflow-x-auto my-6">
        <pre
          className="text-[#F5F0E8] text-[0.85rem] leading-relaxed"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          {`curl -X POST \\
  https://spotty-agneta-hassaanfisky-2a742a92.koyeb.app/api/v1/channels/webform/submit \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Ahmed Khan",
    "email": "ahmed@example.com",
    "subject": "Login issue",
    "category": "technical",
    "message": "I cannot login to my account since yesterday.",
    "priority": "high"
  }'`}
        </pre>
      </div>
    </div>
  );
}
