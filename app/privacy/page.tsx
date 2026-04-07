"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F5F0E8] text-[#1A1612]">
      <Navbar />

      <main className="flex-1 w-full max-w-[720px] mx-auto px-6 py-32 md:py-40">
        <div className="text-center mb-16">
          <div
            className="text-[0.8rem] font-bold tracking-[0.1em] text-[#9E948A] uppercase mb-4"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            DATA GOVERNANCE
          </div>
          <h1
            className="text-[2.5rem] md:text-[3.5rem] font-black text-[#1A1612] leading-tight mb-4"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900 }}
          >
            Privacy Policy
          </h1>
          <div
            className="text-[0.8rem] text-[#6B6459]"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            Last updated: March 2026 · Version 2.0
          </div>
        </div>

        <div className="prose prose-stone max-w-none">
          <h2
            className="text-[1.75rem] font-bold text-[#1A1612] mt-12 mb-6"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            1. Data We Collect
          </h2>
          <div className="overflow-x-auto mb-10">
            <table
              className="w-full text-left border-collapse"
              style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 400 }}
            >
              <thead>
                <tr className="bg-[#EDE8DF] text-[#1A1612]">
                  <th className="p-3 font-semibold border-b border-[#DDD8CF]">Data Type</th>
                  <th className="p-3 font-semibold border-b border-[#DDD8CF]">Purpose</th>
                  <th className="p-3 font-semibold border-b border-[#DDD8CF]">Channel</th>
                </tr>
              </thead>
              <tbody className="text-[#6B6459]">
                {[
                  { type: "Name, Email", purpose: "Customer identification", channel: "All channels" },
                  { type: "Phone number", purpose: "WhatsApp routing", channel: "WhatsApp only" },
                  { type: "Message content", purpose: "Support resolution", channel: "All channels" },
                  { type: "Sentiment score", purpose: "Quality monitoring", channel: "Internal only" },
                  { type: "IP address", purpose: "Rate limiting", channel: "Web Form only" },
                  { type: "Timestamps", purpose: "Audit trail", channel: "All channels" },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-[#DDD8CF] hover:bg-[#EDE8DF]/50 transition-colors">
                    <td className="p-3 font-bold text-[#1A1612]">{row.type}</td>
                    <td className="p-3">{row.purpose}</td>
                    <td className="p-3">{row.channel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2
            className="text-[1.75rem] font-bold text-[#1A1612] mt-12 mb-6"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            2. Data Retention
          </h2>
          <div className="space-y-6 text-[#6B6459] text-[1.05rem]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            <div>
              <strong className="text-[#1A1612] block mb-2">Hot Storage (0-90 days):</strong>
              Full message content, all metadata, audit logs. Stored in Neon PostgreSQL with encryption at rest.
            </div>
            <div>
              <strong className="text-[#1A1612] block mb-2">Archive (90 days - 1 year):</strong>
              Anonymized interaction data for model improvement. PII removed. Retained for compliance purposes.
            </div>
            <div>
              <strong className="text-[#1A1612] block mb-2">Deletion:</strong>
              All data permanently deleted after 1 year. Deletion requests honored within 30 days.
            </div>
          </div>

          <h2
            className="text-[1.75rem] font-bold text-[#1A1612] mt-12 mb-6"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            3. Third-Party Processors
          </h2>
          <div className="overflow-x-auto mb-10">
            <table
              className="w-full text-left border-collapse"
              style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 400 }}
            >
              <thead>
                <tr className="bg-[#EDE8DF] text-[#1A1612]">
                  <th className="p-3 font-semibold border-b border-[#DDD8CF]">Processor</th>
                  <th className="p-3 font-semibold border-b border-[#DDD8CF]">Purpose</th>
                  <th className="p-3 font-semibold border-b border-[#DDD8CF]">Data Shared</th>
                  <th className="p-3 font-semibold border-b border-[#DDD8CF]">Region</th>
                </tr>
              </thead>
              <tbody className="text-[#6B6459]">
                {[
                  { proc: "Groq API", purp: "AI inference", data: "Message content (not stored)", reg: "US" },
                  { proc: "Confluent Kafka", purp: "Event routing", data: "Message metadata", reg: "US-East" },
                  { proc: "Twilio", purp: "WhatsApp comms", data: "Phone numbers, messages", reg: "US" },
                  { proc: "Neon PostgreSQL", purp: "Data storage", data: "All PII", reg: "US-East" },
                  { proc: "Vercel", purp: "Frontend host", data: "Request logs (anonymized)", reg: "Global" },
                  { proc: "Koyeb", purp: "Backend host", data: "Compute only, no data storage", reg: "EU/US" },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-[#DDD8CF] hover:bg-[#EDE8DF]/50 transition-colors">
                    <td className="p-3 font-bold text-[#1A1612]">{row.proc}</td>
                    <td className="p-3">{row.purp}</td>
                    <td className="p-3">{row.data}</td>
                    <td className="p-3">{row.reg}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2
            className="text-[1.75rem] font-bold text-[#1A1612] mt-12 mb-6"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            4. Your Rights
          </h2>
          <ul
            className="list-none pl-0 space-y-3 mb-8 text-[#6B6459] text-[1.05rem]"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            <li><strong className="text-[#CC5500]">●</strong> <strong className="text-[#1A1612]">Access:</strong> Request a copy of all data we hold about you</li>
            <li><strong className="text-[#CC5500]">●</strong> <strong className="text-[#1A1612]">Erasure:</strong> Request deletion of all personal data</li>
            <li><strong className="text-[#CC5500]">●</strong> <strong className="text-[#1A1612]">Portability:</strong> Receive your data in machine-readable format</li>
            <li><strong className="text-[#CC5500]">●</strong> <strong className="text-[#1A1612]">Correction:</strong> Request correction of inaccurate data</li>
            <li><strong className="text-[#CC5500]">●</strong> <strong className="text-[#1A1612]">Objection:</strong> Opt out of processing for specific purposes</li>
          </ul>
          <p
            className="text-[#6B6459] text-[1rem] bg-[#EDE8DF] p-4 rounded-md border-l-[4px] border-[#CC5500]"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Submit requests to <a href="mailto:privacy@yourcompany.com" className="font-bold text-[#1A1612] underline">privacy@yourcompany.com</a>. We respond within 30 days.
          </p>

          <h2
            className="text-[1.75rem] font-bold text-[#1A1612] mt-12 mb-6"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            5. Contact
          </h2>
          <div
            className="bg-[#EDE8DF] border border-[#DDD8CF] rounded-[8px] p-6 text-[1.05rem]"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            <div className="text-[#1A1612] font-bold mb-2">Data Controller: <span className="text-[#6B6459] font-normal">ARIA Platform</span></div>
            <div className="text-[#1A1612] font-bold mb-4">Email: <a href="mailto:privacy@yourcompany.com" className="text-[#CC5500] font-normal underline">privacy@yourcompany.com</a></div>
            <div className="text-[#6B6459] text-[0.95rem]">
              For DPA requests, include &quot;DPA Request&quot; in subject line.
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
