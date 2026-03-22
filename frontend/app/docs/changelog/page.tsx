"use client";

export default function ChangelogPage() {
  const versions = [
    {
      version: "v2.0.0",
      date: "March 2026",
      changes: [
        "Multi-channel CRM: Email, WhatsApp, Web Form unified",
        "CEO Briefing generator (weekly autonomous business audit)",
        "Real-time dashboard with sentiment trend charts",
        "Groq LLaMA-3.3-70B integration (free tier, OpenAI-compatible)",
        "Confluent Kafka event streaming with 7 topic channels",
        "Auto-escalation with Human-in-the-Loop vault approval system",
        "Deployed: Koyeb (backend) + Vercel (frontend) + Neon PostgreSQL",
      ],
    },
    {
      version: "v1.5.0",
      date: "February 2026",
      changes: [
        "WhatsApp integration via Twilio Sandbox",
        "Sentiment analysis on every incoming message (0.0–1.0 scale)",
        "Ralph Wiggum autonomous retry loop (self-healing agent)",
        "Gmail OAuth watcher with 120s polling interval",
      ],
    },
    {
      version: "v1.0.0",
      date: "January 2026",
      changes: [
        "Initial release: Web Form support channel",
        "FastAPI backend with Pydantic v2 validation",
        "PostgreSQL schema (9 tables) on Neon cloud",
        "Basic Groq agent with 5 tool definitions",
      ],
    },
  ];

  return (
    <div className="prose prose-stone max-w-[800px]">
      <h1
        className="text-[2.5rem] font-black text-[#1A1612] leading-tight mb-2"
        style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900 }}
      >
        Changelog
      </h1>
      <p
        className="text-[#6B6459] text-[1.125rem] leading-relaxed mb-12"
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      >
        All notable changes to the ARIA platform.
      </p>

      <div className="relative border-l-2 border-[#DDD8CF] ml-4 pl-8 space-y-12">
        {versions.map((ver, idx) => (
          <div key={idx} className="relative">
            <div className="absolute -left-[42px] top-1 w-[10px] h-[10px] bg-[#CC5500] rounded-full border-2 border-[#F5F0E8]" />
            <div className="flex items-center gap-4 mb-4">
              <span
                className="bg-[#EDE8DF] border border-[#DDD8CF] text-[#CC5500] rounded-[4px] px-[10px] py-[2px]"
                style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.8rem", fontWeight: 600 }}
              >
                {ver.version}
              </span>
              <span
                className="text-[#9E948A] text-[0.85rem] uppercase tracking-wide font-bold"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {ver.date}
              </span>
            </div>
            <ul className="space-y-3 m-0 pl-2">
              {ver.changes.map((change, cIdx) => (
                <li
                  key={cIdx}
                  className="flex items-start gap-3 text-[#1A1612]"
                  style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.95rem", fontWeight: 400 }}
                >
                  <span className="text-[#CC5500] select-none text-xs translate-y-1">●</span>
                  <span className="flex-1">{change}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
