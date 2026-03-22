"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { Inbox, BarChart2, AlertCircle, RefreshCw, Clock, WifiOff } from "lucide-react";
import Navbar from "@/components/Navbar";

interface Ticket {
  id: string;
  customer: string;
  channel: string;
  status: string;
  time: string;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [loadingText, setLoadingText] = useState("Connecting to ARIA backend...");
  const [error, setError] = useState<string | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);

  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimers = useCallback(() => {
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
    countdownIntervalRef.current = null;
    loadingTimeoutRef.current = null;
  }, []);

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  useEffect(() => {
    if (countdown === 0) {
      clearTimers();
      const nextCount = retryCount + 1;
      setRetryCount(nextCount);
      fetchData(nextCount);
    }
  }, [countdown, retryCount]); // fetchData omitted from dependency array intentionally

  const fetchData = useCallback(async (currentRetry: number = 0) => {
    clearTimers();
    setLoading(true);
    setError(null);
    setCountdown(null);
    setLoadingText("Connecting to ARIA backend...");

    loadingTimeoutRef.current = setTimeout(() => {
      setLoadingText("Backend is warming up — almost there...");
    }, 10000);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 seconds

    const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || "";

    try {
      // Warm-up ping
      try {
        await fetch(`${NEXT_PUBLIC_API_URL}/`, { signal: controller.signal });
      } catch (pingErr) {
        // Ignore ping error
      }

      const res = await fetch("/api/backend/v1/tickets?limit=10", {
        signal: controller.signal
      });

      if (res.ok) {
        const data = await res.json();
        const items = Array.isArray(data) ? data.map((t: any) => ({
          id: String(t.ticket_id || t.id || "—"),
          customer: String(t.customer_name || t.customer || "Unknown"),
          channel: String(t.channel || "web"),
          status: String(t.status || "open"),
          time: String(t.created_at || "—"),
        })) : [];
        setTickets(items);
        setRetryCount(0);
        clearTimers();
        setLoading(false);
      } else {
        throw new Error("Failed response");
      }
    } catch (e: any) {
      console.error("Dashboard fetch error:", e);
      if (currentRetry >= 3) {
        setError("permanent");
        setLoading(false);
      } else {
        setLoading(false);
        setCountdown(30);
        countdownIntervalRef.current = setInterval(() => {
          setCountdown((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
        }, 1000);
      }
    } finally {
      clearTimeout(timeoutId);
    }
  }, [clearTimers]);

  useEffect(() => {
    fetchData(0);
  }, [fetchData]);

  const handleManualWake = () => {
    clearTimers();
    const nextCount = retryCount + 1;
    setRetryCount(nextCount);
    fetchData(nextCount);
  };

  const handlePermanentRetry = () => {
    setRetryCount(0);
    fetchData(0);
  };

  const getStatusColor = (status: string) => {
    if (status.toLowerCase() === 'resolved') return 'bg-[#EDF2EE] text-[#4A5D4E]';
    if (status.toLowerCase() === 'escalated') return 'bg-[#FDF1E7] text-[#D97757]';
    return 'bg-[#F0EBE1] text-[#4A4541]';
  };

  return (
    <main className="min-h-screen bg-[#FAF9F6] text-[#2D2926] flex flex-col">
      <Navbar />

      <div className="max-w-[1200px] mx-auto w-full px-6 pt-32 pb-20">
        <div className="mb-12">
          <h1 className="text-4xl font-serif text-[#2D2926] mb-3">Dashboard</h1>
          <p className="text-lg text-[#5C564D]">A centralized view of your support operations.</p>
        </div>

        {error === "permanent" ? (
          <div className="document-card p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-[#FDF1E7] rounded-full flex items-center justify-center mb-6">
               <WifiOff className="w-8 h-8 text-[#D97757]" />
            </div>
            <h3 className="text-xl font-serif mb-2">Unable to connect</h3>
            <p className="text-[#8A857D] mb-8">Backend may be down. Check system status.</p>
            <div className="flex gap-4">
              <Link href="/status" className="btn-secondary">Check Status →</Link>
              <button onClick={handlePermanentRetry} className="btn-primary">Try Again</button>
            </div>
          </div>
        ) : countdown !== null ? (
          <div className="document-card p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-[#FDF1E7] rounded-full flex items-center justify-center mb-6">
               <Clock className="w-8 h-8 text-[#D97757]" />
            </div>
            <h3 className="text-xl font-serif mb-2">Backend is waking up...</h3>
            <p className="text-[#8A857D] mb-8 max-w-[400px]">
              Our server was sleeping to save resources.<br />
              It usually takes 20-40 seconds to wake up.<br />
              This is completely normal on free hosting.
            </p>
            
            <div className="w-full max-w-[300px] mb-8">
              <div className="text-sm font-medium text-[#2D2926] mb-2">Retrying in {countdown} seconds...</div>
              <div className="w-full h-2 bg-[#DDD8CF] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#CC5500] transition-all duration-1000 ease-linear"
                  style={{ width: `${(countdown / 30) * 100}%` }}
                />
              </div>
            </div>

            <button onClick={handleManualWake} className="btn-primary">
              Wake It Up →
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="document-card p-8">
                 <div className="flex items-center gap-3 text-[#8A857D] mb-4">
                   <Inbox className="w-5 h-5" />
                   <h3 className="font-medium">Total Tickets</h3>
                 </div>
                 <div className="text-5xl font-serif text-[#2D2926]">{loading ? "..." : tickets.length}</div>
               </div>
               <div className="document-card p-8">
                 <div className="flex items-center gap-3 text-[#8A857D] mb-4">
                   <AlertCircle className="w-5 h-5" />
                   <h3 className="font-medium">Needs Attention</h3>
                 </div>
                 <div className="text-5xl font-serif text-[#D97757]">{loading ? "..." : tickets.filter(t => t.status !== 'resolved').length}</div>
               </div>
               <div className="document-card p-8">
                 <div className="flex items-center gap-3 text-[#8A857D] mb-4">
                   <BarChart2 className="w-5 h-5" />
                   <h3 className="font-medium">Resolution Rate</h3>
                 </div>
                 <div className="text-5xl font-serif text-[#4A5D4E]">{loading ? "..." : "-"}</div>
               </div>
            </div>

            <div className="document-card overflow-hidden">
               <div className="p-6 md:p-8 border-b border-[#E5E0D8] flex items-center justify-between">
                 <h2 className="text-xl font-serif">Recent Inquiries</h2>
                 <button onClick={() => fetchData(0)} className="p-2 text-[#8A857D] hover:text-[#2D2926] transition-colors" title="Refresh">
                   <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                 </button>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                   <thead>
                     <tr className="border-b border-[#E5E0D8] bg-[#F9F8F6]">
                       <th className="px-8 py-4 font-medium text-sm text-[#8A857D]">Customer</th>
                       <th className="px-8 py-4 font-medium text-sm text-[#8A857D]">Channel</th>
                       <th className="px-8 py-4 font-medium text-sm text-[#8A857D]">Status</th>
                       <th className="px-8 py-4 font-medium text-sm text-[#8A857D] text-right">Time</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-[#E5E0D8]">
                     {loading ? (
                       [...Array(3)].map((_, i) => (
                         <tr key={i}>
                           <td colSpan={4} className="px-8 py-6">
                             <div className="h-4 bg-[#F0EBE1] rounded animate-pulse w-full max-w-sm mb-2" />
                             {i === 0 && <span className="text-xs text-[#8A857D] mt-2 block">{loadingText}</span>}
                           </td>
                         </tr>
                       ))
                     ) : tickets.length === 0 ? (
                       <tr>
                         <td colSpan={4} className="px-8 py-16 text-center text-[#8A857D]">
                           No tickets found. Looking peaceful today.
                         </td>
                       </tr>
                     ) : (
                       tickets.map((ticket) => (
                         <tr key={ticket.id} className="hover:bg-[#F9F8F6] transition-colors group">
                           <td className="px-8 py-5">
                             <div className="font-medium text-[#2D2926]">{ticket.customer}</div>
                             <div className="text-xs text-[#8A857D] mt-1 font-mono">{ticket.id}</div>
                           </td>
                           <td className="px-8 py-5">
                             <span className="capitalize text-[#5C564D]">{ticket.channel.replace('_', ' ')}</span>
                           </td>
                           <td className="px-8 py-5">
                             <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)} capitalize`}>
                               {ticket.status}
                             </span>
                           </td>
                           <td className="px-8 py-5 text-[#8A857D] text-sm text-right font-mono">
                             {ticket.time.split('T')[1]?.split('.')[0] || ticket.time}
                           </td>
                         </tr>
                       ))
                     )}
                   </tbody>
                 </table>
               </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
