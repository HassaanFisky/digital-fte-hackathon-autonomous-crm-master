"use client";
import { useState } from "react";

export default function ApiHooksPage() {
  const [formData, setFormData] = useState({
    name: "Test User",
    email: "test@example.com",
    subject: "API test from docs",
    category: "general",
    message: "Testing the ARIA API from the documentation page.",
    priority: "medium",
  });
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponse(null);
    setResponseStatus(null);
    setErrorMessage("");

    try {
      const res = await fetch("https://spotty-agneta-hassaanfisky-2a742a92.koyeb.app/api/v1/channels/webform/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      setResponseStatus(res.status);
      const data = await res.json().catch(() => ({}));
      setResponse(data);

      if (!res.ok) {
        setErrorMessage(data.detail || "Error from the server");
      }
    } catch (err: any) {
      setErrorMessage("Backend may be waking up (cold start). Try again in 30 seconds.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="prose prose-stone max-w-[800px]">
      <h1
        className="text-[2.5rem] font-black text-[#1A1612] leading-tight mb-6"
        style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900 }}
      >
        Developer API
      </h1>

      <h2
        className="text-[1.75rem] font-bold text-[#1A1612] mt-12 mb-4"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        REST Endpoints
      </h2>
      <div className="w-full overflow-x-auto mb-10">
        <table
          className="w-full text-left border-collapse"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          <thead>
            <tr className="bg-[#EDE8DF] text-[#1A1612]">
              <th className="p-3 font-semibold border-b border-[#DDD8CF]">Method</th>
              <th className="p-3 font-semibold border-b border-[#DDD8CF]">Endpoint</th>
              <th className="p-3 font-semibold border-b border-[#DDD8CF]">Description</th>
            </tr>
          </thead>
          <tbody className="text-[#6B6459]">
            {[
              { method: "GET", endpoint: "/", desc: "Health check root" },
              { method: "GET", endpoint: "/api/v1/health", desc: "Full health status" },
              { method: "POST", endpoint: "/api/v1/channels/webform/submit", desc: "Submit support ticket" },
              { method: "GET", endpoint: "/api/v1/tickets/{id}", desc: "Get ticket by ID" },
              { method: "GET", endpoint: "/api/v1/customers/lookup", desc: "Lookup customer by email/phone" },
              { method: "GET", endpoint: "/api/v1/metrics/channels", desc: "Channel performance metrics" },
              { method: "POST", endpoint: "/api/v1/briefing/generate", desc: "Generate CEO briefing" },
            ].map((row, i) => (
              <tr key={i} className="border-b border-[#DDD8CF] hover:bg-[#EDE8DF]/50 transition-colors">
                <td className="p-3 font-bold text-[#1A1612]">{row.method}</td>
                <td className="p-3" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{row.endpoint}</td>
                <td className="p-3">{row.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2
        className="text-[1.75rem] font-bold text-[#1A1612] mt-12 mb-4"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        Rate Limits
      </h2>
      <div
        className="bg-[#EDE8DF] border-l-[4px] border-[#CC5500] p-6 text-[#1A1612] rounded-r-[8px] mb-12"
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      >
        <p className="mb-2 font-bold text-[1.1rem]">100 requests / minute per IP</p>
        <p className="text-[#6B6459]">Webhook endpoints: no rate limit (Twilio / Google verified incoming webhooks only)</p>
      </div>

      <h2
        className="text-[1.75rem] font-bold text-[#1A1612] mt-12 mb-4"
        style={{ fontFamily: "'Playfair Display', serif" }}
        id="try-it-live"
      >
        🧪 Try It Live — Submit a Real Ticket
      </h2>
      <p
        className="text-[#6B6459] text-[1.05rem] leading-relaxed mb-6"
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      >
        Send a real request to the live ARIA backend and see the actual JSON response below.
      </p>

      <form onSubmit={handleSubmit} className="bg-[#EDE8DF] p-6 rounded-[8px] border border-[#DDD8CF] space-y-4 max-w-[600px] mb-12 shadow-sm">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[#6B6459] text-[0.85rem] mb-1 uppercase font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Name</label>
            <input type="text" className="w-full bg-[#F5F0E8] border border-[#DDD8CF] rounded border-b-2 px-3 py-2 text-[#1A1612] outline-none focus:border-b-[#CC5500] focus:ring-0" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required/>
          </div>
          <div>
            <label className="block text-[#6B6459] text-[0.85rem] mb-1 uppercase font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Email</label>
            <input type="email" className="w-full bg-[#F5F0E8] border border-[#DDD8CF] rounded border-b-2 px-3 py-2 text-[#1A1612] outline-none focus:border-b-[#CC5500] focus:ring-0" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required/>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[#6B6459] text-[0.85rem] mb-1 uppercase font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Category</label>
            <select className="w-full bg-[#F5F0E8] border border-[#DDD8CF] rounded px-3 py-2 text-[#1A1612] outline-none focus:border-[#CC5500] focus:ring-0" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
              <option value="general">general</option>
              <option value="technical">technical</option>
              <option value="billing">billing</option>
              <option value="feedback">feedback</option>
              <option value="bug_report">bug_report</option>
            </select>
          </div>
          <div>
            <label className="block text-[#6B6459] text-[0.85rem] mb-1 uppercase font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Priority</label>
            <select className="w-full bg-[#F5F0E8] border border-[#DDD8CF] rounded px-3 py-2 text-[#1A1612] outline-none focus:border-[#CC5500] focus:ring-0" value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})}>
              <option value="low">low</option>
              <option value="medium">medium</option>
              <option value="high">high</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[#6B6459] text-[0.85rem] mb-1 uppercase font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Subject</label>
          <input type="text" className="w-full bg-[#F5F0E8] border border-[#DDD8CF] rounded border-b-2 px-3 py-2 text-[#1A1612] outline-none focus:border-b-[#CC5500] focus:ring-0" value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} required/>
        </div>

        <div>
          <label className="block text-[#6B6459] text-[0.85rem] mb-1 uppercase font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Message</label>
          <textarea className="w-full bg-[#F5F0E8] border border-[#DDD8CF] rounded px-3 py-2 text-[#1A1612] outline-none focus:border-[#CC5500] focus:ring-0" rows={3} value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} required/>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center bg-[#CC5500] text-[#F5F0E8] font-bold rounded-[6px] py-3 uppercase tracking-wide cursor-pointer hover:bg-[#a34400] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.95rem" }}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-[#F5F0E8]/40 border-t-[#F5F0E8] rounded-full animate-spin"></span>
              Sending...
            </span>
          ) : (
            "Send Request →"
          )}
        </button>
      </form>

      {(response || errorMessage) && (
        <div className="mt-8 mb-12">
          <div
            className="text-[0.75rem] uppercase font-bold tracking-[0.08em] pb-2 text-[#6B6459]"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Response
          </div>
          <div
            className={`bg-[#1A1612] rounded-[8px] p-5 overflow-x-auto border-l-[4px] ${
              responseStatus === 200 || responseStatus === 201 ? "border-[#4A7C59]" : "border-[#CC5500]"
            }`}
          >
            {errorMessage ? (
              <div className="text-[#CC5500] font-bold" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.85rem" }}>
                Error: {errorMessage}
              </div>
            ) : (
              <pre
                className="text-[#F5F0E8] leading-relaxed whitespace-pre-wrap break-all"
                style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.85rem" }}
              >
                {JSON.stringify(response, null, 2)}
              </pre>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
