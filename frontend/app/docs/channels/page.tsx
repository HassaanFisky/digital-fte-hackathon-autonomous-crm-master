"use client";

export default function ChannelsPage() {
  return (
    <div className="prose prose-stone max-w-[800px]">
      <h1
        className="text-[2.5rem] font-black text-[#1A1612] leading-tight mb-6"
        style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900 }}
      >
        Channel Integration
      </h1>

      <h2
        className="text-[1.75rem] font-bold text-[#1A1612] mt-12 mb-4"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        WhatsApp via Twilio
      </h2>
      <p
        className="text-[#6B6459] text-[1.05rem] leading-relaxed mb-6"
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      >
        Connecting Twilio Sandbox for WhatsApp requires:
      </p>
      <ol
        className="list-decimal pl-6 space-y-2 text-[#6B6459] text-[1rem] mb-6"
        style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 400 }}
      >
        <li>Create Twilio account at twilio.com</li>
        <li>Enable WhatsApp Sandbox in Twilio Console</li>
        <li>Set webhook URL to <code>POST /api/v1/webhooks/whatsapp</code></li>
        <li>Set <code>TWILIO_ACCOUNT_SID</code> and <code>TWILIO_AUTH_TOKEN</code> in your <code>.env</code> file</li>
      </ol>
      <p
        className="bg-[#EDE8DF] border-l-[4px] border-[#CC5500] p-4 text-[#1A1612] rounded-r-[6px]"
        style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.95rem" }}
      >
        <strong>Note:</strong> Webhook signature validation occurs for enhanced security via the <code>X-Twilio-Signature</code> header.
      </p>

      <h2
        className="text-[1.75rem] font-bold text-[#1A1612] mt-12 mb-4"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        Gmail via Google API
      </h2>
      <ol
        className="list-decimal pl-6 space-y-2 text-[#6B6459] text-[1rem] mb-6"
        style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 400 }}
      >
        <li>Create project at console.cloud.google.com</li>
        <li>Enable Gmail API</li>
        <li>Create OAuth 2.0 credentials (Web Application)</li>
        <li>Download <code>credentials.json</code> to the <code>credentials/</code> directory</li>
        <li>Run OAuth flow to generate <code>token.json</code></li>
      </ol>
      <p
        className="bg-[#EDE8DF] p-4 text-[#1A1612] rounded-[6px]"
        style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.95rem" }}
      >
        Watcher polls every <strong>120 seconds</strong> for <code>is:unread is:important</code>.
      </p>

      <h2
        className="text-[1.75rem] font-bold text-[#1A1612] mt-12 mb-4"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        Kafka Topic Routing
      </h2>
      <div className="w-full overflow-x-auto mb-10">
        <table
          className="w-full text-left border-collapse"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          <thead>
            <tr className="bg-[#EDE8DF] text-[#1A1612]">
              <th className="p-3 font-semibold border-b border-[#DDD8CF]">Topic Name</th>
              <th className="p-3 font-semibold border-b border-[#DDD8CF]">Channel</th>
              <th className="p-3 font-semibold border-b border-[#DDD8CF]">Direction</th>
            </tr>
          </thead>
          <tbody className="text-[#6B6459]">
            {[
              { name: "fte.tickets.incoming", channel: "All", direction: "Inbound (unified)" },
              { name: "fte.channels.email.inbound", channel: "Email", direction: "Inbound" },
              { name: "fte.channels.whatsapp.inbound", channel: "WhatsApp", direction: "Inbound" },
              { name: "fte.channels.webform.inbound", channel: "Web Form", direction: "Inbound" },
              { name: "fte.escalations", channel: "All", direction: "Escalation events" },
              { name: "fte.metrics", channel: "All", direction: "Performance data" },
              { name: "fte.dlq", channel: "All", direction: "Dead letter queue" },
            ].map((row, i) => (
              <tr key={i} className="border-b border-[#DDD8CF] hover:bg-[#EDE8DF]/50 transition-colors">
                <td className="p-3" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{row.name}</td>
                <td className="p-3">{row.channel}</td>
                <td className="p-3">{row.direction}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2
        className="text-[1.75rem] font-bold text-[#1A1612] mt-12 mb-4"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        Deduplication Strategy
      </h2>
      <ul
        className="list-disc pl-6 space-y-2 text-[#6B6459] text-[1rem]"
        style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 400 }}
      >
        <li>Each ticket is assigned a unique UUID (<code>uuid_generate_v4()</code>) directly upon creation in the DB.</li>
        <li>Kafka consumer group isolation prevents duplicate processing inside microservices.</li>
        <li>Web form submissions reliably generate <code>ticket_id</code> before publishing to Kafka.</li>
      </ul>
    </div>
  );
}
