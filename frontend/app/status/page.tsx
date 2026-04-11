"use client";
import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type StatusType = "operational" | "degraded" | "down" | "unknown";

interface Service {
  name: string;
  status: StatusType;
  time: string | number;
}

export default function StatusPage() {
  const [loading, setLoading] = useState(true);
  const [responseTime, setResponseTime] = useState<number>(0);
  const [services, setServices] = useState<Service[]>([]);
  const [lastUpdated, setLastUpdated] = useState<number>(0);
  const [countdown, setCountdown] = useState<number>(30);

  const fetchHealth = useCallback(async () => {
    const startTime = Date.now();
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 5000);

    try {
      const res = await fetch("https://spotty-agneta-hassaanfisky-2a742a92.koyeb.app/api/v1/health", {
        signal: controller.signal,
      });

      const rt = Date.now() - startTime;
      setResponseTime(rt);

      if (res.ok) {
        const data = await res.json();
        
        const mapStatus = (s: string): StatusType => {
          if (!s) return "unknown";
          // Backend returns: "healthy" | "connected" | "active" for OK states
          if (s === "ok" || s === "healthy" || s === "connected" || s === "active")
            return "operational";
          if (s === "degraded") return "degraded";
          if (s === "down" || s === "disconnected" || s === "inactive") return "down";
          return "unknown";
        };

        const newServices: Service[] = [
          { name: "Backend API", status: mapStatus(data.status), time: rt },
          { name: "Database (Neon)", status: mapStatus(data.db), time: "-" },
          { name: "Web Form Channel", status: mapStatus(data.channels?.webform), time: "-" },
          { name: "WhatsApp Channel", status: mapStatus(data.channels?.whatsapp), time: "-" },
          { name: "Email Channel", status: mapStatus(data.channels?.gmail), time: "-" },
        ];

        setServices(newServices);
      } else {
        throw new Error("HTTP error");
      }
    } catch (err) {
      const rt = Date.now() - startTime;
      setResponseTime(rt);
      setServices([
        { name: "Backend API", status: "unknown", time: "-" },
        { name: "Database (Neon)", status: "unknown", time: "-" },
        { name: "Email Channel", status: "unknown", time: "-" },
        { name: "WhatsApp Channel", status: "unknown", time: "-" },
        { name: "Web Form Channel", status: "unknown", time: "-" },
      ]);
    } finally {
      clearTimeout(id);
      setLoading(false);
      setLastUpdated(0);
      setCountdown(30);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    const fetchInterval = setInterval(fetchHealth, 30000);
    const tickInterval = setInterval(() => {
      setLastUpdated((prev) => prev + 1);
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      clearInterval(fetchInterval);
      clearInterval(tickInterval);
    };
  }, [fetchHealth]);

  const allOperational = services.length > 0 && services.every(s => s.status === "operational");
  const anyDown = services.some(s => s.status === "down" || s.status === "unknown");
  const anyDegraded = services.some(s => s.status === "degraded");

  let overallStatus = "● All Systems Operational";
  let overallColor = "text-[#4A7C59] bg-[#4A7C59]/10 border-[#4A7C59]";
  if (anyDown) {
    overallStatus = "● Service Disruption";
    overallColor = "text-[#CC5500] bg-[#CC5500]/10 border-[#CC5500]";
  } else if (anyDegraded) {
    overallStatus = "● Partial Degradation";
    overallColor = "text-[#D97757] bg-[#D97757]/10 border-[#D97757]";
  }

  const getStatusDisplay = (s: StatusType) => {
    switch (s) {
      case "operational": return <span className="text-[#4A7C59] font-bold flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#4A7C59] shadow-[0_0_8px_#4A7C59] animate-pulse"></div> Operational</span>;
      case "degraded": return <span className="text-[#D97757] font-bold flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#D97757]"></div> Degraded</span>;
      case "down": return <span className="text-[#CC5500] font-bold flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#CC5500]"></div> Disrupted</span>;
      default: return <span className="text-[#9E948A] font-bold flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#9E948A]"></div> Unknown</span>;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F0E8] text-[#1A1612]">
      <Navbar />

      <main className="flex-1 w-full max-w-[900px] mx-auto px-6 py-32 md:py-40">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-8">
          <div>
            <div
              className="text-[0.8rem] font-bold tracking-[0.1em] text-[#9E948A] uppercase mb-4"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              SYSTEM STATUS
            </div>
            <h1
              className="text-[2.5rem] md:text-[3rem] font-black text-[#1A1612] leading-tight mb-6"
              style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900 }}
            >
              ARIA Platform Status
            </h1>
            <div
              className={`inline-block border px-4 py-2 rounded-full text-[1.125rem] font-bold ${overallColor}`}
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {loading ? "..." : overallStatus}
            </div>
          </div>
          
          <div className="bg-[#EDE8DF] border border-[#DDD8CF] rounded-lg p-6 min-w-[200px] shadow-sm">
            <div className="text-[0.85rem] font-bold tracking-wide text-[#6B6459] mb-2 uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              API Response Time
            </div>
            <div
              className={`text-[1.75rem] font-bold ${responseTime < 500 ? "text-[#4A7C59]" : responseTime < 2000 ? "text-[#D97757]" : "text-[#CC5500]"}`}
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {loading ? "---" : `${responseTime}ms`}
            </div>
          </div>
        </div>

        <div className="bg-[#EDE8DF] border border-[#DDD8CF] rounded-xl overflow-hidden shadow-sm mb-12">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              <thead>
                <tr className="border-b border-[#DDD8CF] text-[#6B6459]">
                  <th className="px-6 py-4 font-bold uppercase text-[0.8rem] tracking-wide">Component</th>
                  <th className="px-6 py-4 font-bold uppercase text-[0.8rem] tracking-wide">Status</th>
                  <th className="px-6 py-4 font-bold uppercase text-[0.8rem] tracking-wide text-right">Response Time</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service, idx) => (
                  <tr key={idx} className="border-b border-[#DDD8CF] last:border-b-0">
                    <td className="px-6 py-5 font-semibold text-[#1A1612] text-[1.05rem]">{service.name}</td>
                    <td className="px-6 py-5 text-[1rem]">{getStatusDisplay(service.status)}</td>
                    <td className="px-6 py-5 text-right text-[#6B6459]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{service.time}{service.time !== "-" ? "ms" : ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center bg-[#EDE8DF] p-6 rounded-lg border border-[#DDD8CF] text-[#6B6459] text-[0.95rem]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          <div className="mb-4 md:mb-0">
            Last updated <span className="font-bold">{lastUpdated}</span> seconds ago
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <span className="whitespace-nowrap">Auto-refreshes every 30 seconds</span>
            <div className="w-full md:w-[100px] h-2 bg-[#DDD8CF] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#CC5500] transition-all duration-1000 ease-linear"
                style={{ width: `${(countdown / 30) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mt-16 pt-16 border-t border-[#DDD8CF]">
          <h2 className="text-[1.75rem] font-bold text-[#1A1612] mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            Incident History
          </h2>
          <p className="text-[#6B6459] text-[1.125rem]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            No incidents reported in the last 90 days.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
