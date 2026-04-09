"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { Inbox, BarChart2, AlertCircle, RefreshCw, Clock, WifiOff, TrendingUp, TrendingDown, Minus, Sparkles, Zap, Terminal, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAriaAgent } from "@/lib/hooks/useAriaAgent";

interface Ticket {
  id: string;
  customer: string;
  channel: string;
  status: string;
  time: string;
  priority: "low" | "medium" | "high" | "critical";
}

const STATIC_TICKETS: Ticket[] = [
  { id: "TKT-0021", customer: "Sarah Mitchell", channel: "Web Form", status: "Resolved", time: "2 min ago", priority: "medium" },
  { id: "TKT-0020", customer: "James Okafor", channel: "Email", status: "In Progress", time: "8 min ago", priority: "high" },
  { id: "TKT-0019", customer: "Priya Nair", channel: "Web Form", status: "Resolved", time: "15 min ago", priority: "low" },
  { id: "TKT-0018", customer: "David Chen", channel: "Email", status: "Needs Review", time: "22 min ago", priority: "critical" },
  { id: "TKT-0017", customer: "Amara Diallo", channel: "Web Form", status: "Resolved", time: "31 min ago", priority: "medium" },
  { id: "TKT-0016", customer: "Marcus Webb", channel: "Email", status: "In Progress", time: "45 min ago", priority: "high" },
];

const INSTANT_STATS = {
  totalTickets: 247,
  needsAttention: 4,
  resolutionRate: "96.3%",
  avgResponseTime: "1.8 min",
};

export default function DashboardPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [loadingText] = useState("Connecting to ARIA backend...");

  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { analysis, isLoadingAnalysis, runAnalysis } = useAriaAgent();

  const clearTimers = useCallback(() => {
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    countdownIntervalRef.current = null;
  }, []);

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  // Trigger ARIA Intelligence Report after 2 seconds
  useEffect(() => {
    const t = setTimeout(() => { runAnalysis(); }, 2000);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleManualWake = () => {
    clearTimers();
    const nextCount = retryCount + 1;
    setRetryCount(nextCount);
  };

  const handlePermanentRetry = () => {
    setError(null);
    setRetryCount(0);
  };

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s === "resolved") return "bg-[#EDF2EE] text-[#4A5D4E]";
    if (s === "in progress") return "bg-blue-50 text-blue-700";
    if (s === "needs review") return "bg-amber-50 text-amber-700";
    return "bg-[#F0EBE1] text-[#4A4541]";
  };

  const getPriorityDot = (priority: string) => {
    switch (priority) {
      case "critical": return "bg-red-500";
      case "high": return "bg-orange-500";
      case "medium": return "bg-amber-400";
      case "low": return "bg-green-500";
      default: return "bg-gray-300";
    }
  };

  const getTrendIcon = (trend: string) => {
    if (trend === "improving") return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (trend === "declining") return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-[#8A857D]" />;
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
            <button onClick={handleManualWake} className="btn-primary">Wake It Up →</button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* ── INSTANT STAT CARDS ── */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="document-card p-8">
                <div className="flex items-center gap-3 text-[#8A857D] mb-4">
                  <Inbox className="w-5 h-5" />
                  <h3 className="font-medium">Total Tickets</h3>
                </div>
                <div className="text-5xl font-serif text-[#2D2926]">{INSTANT_STATS.totalTickets}</div>
              </div>
              <div className="document-card p-8">
                <div className="flex items-center gap-3 text-[#8A857D] mb-4">
                  <AlertCircle className="w-5 h-5" />
                  <h3 className="font-medium">Needs Attention</h3>
                </div>
                <div className="text-5xl font-serif text-[#D97757]">{INSTANT_STATS.needsAttention}</div>
              </div>
              <div className="document-card p-8">
                <div className="flex items-center gap-3 text-[#8A857D] mb-4">
                  <BarChart2 className="w-5 h-5" />
                  <h3 className="font-medium">Resolution Rate</h3>
                </div>
                <div className="text-5xl font-serif text-[#4A5D4E]">{INSTANT_STATS.resolutionRate}</div>
              </div>
            </div>

            {/* ── AI AGENT TERMINAL LINK ── */}
            <Link 
              href="/dashboard/agents"
              className="document-card p-6 flex items-center justify-between group hover:border-[#D97757] transition-all"
            >
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-[#2D2926] rounded-2xl flex items-center justify-center text-white group-hover:bg-[#D97757] transition-colors">
                  <Terminal className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-serif text-[#2D2926]">Agent Operations Center</h3>
                  <p className="text-sm text-[#8A857D]">Command your Digital FTE roster directly.</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[#D97757] font-bold text-xs uppercase tracking-widest">
                Manage Team <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* ── ARIA INTELLIGENCE REPORT ── */}
            {isLoadingAnalysis && (
              <div className="document-card p-8 border-l-4 border-[#D97757]">
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="w-5 h-5 text-[#D97757] animate-pulse" />
                  <h2 className="text-xl font-serif">ARIA Intelligence Report</h2>
                </div>
                <div className="space-y-3">
                  <div className="h-4 bg-[#F0EBE1] rounded animate-pulse w-3/4" />
                  <div className="h-4 bg-[#F0EBE1] rounded animate-pulse w-1/2" />
                  <div className="h-4 bg-[#F0EBE1] rounded animate-pulse w-2/3" />
                </div>
              </div>
            )}

            {analysis && !isLoadingAnalysis && (
              <div className="document-card p-8 border-l-4 border-[#D97757]">
                <div className="flex items-center gap-3 mb-6">
                  <Sparkles className="w-5 h-5 text-[#D97757]" />
                  <h2 className="text-xl font-serif">ARIA Intelligence Report</h2>
                  <div className="ml-auto flex items-center gap-2">
                    {getTrendIcon(analysis.weeklyTrend)}
                    <span className="text-xs font-bold uppercase tracking-wider text-[#8A857D] capitalize">{analysis.weeklyTrend}</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-widest text-[#8A857D] mb-1">Top Issue Category</div>
                    <div className="text-lg font-serif capitalize">{analysis.topIssueCategory}</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-widest text-[#8A857D] mb-1">AI Resolution Rate</div>
                    <div className="text-lg font-serif">{analysis.resolutionRatePercent}%</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-widest text-[#8A857D] mb-1">Avg Response Time</div>
                    <div className="text-lg font-serif">{analysis.avgResponseTimeMinutes} min</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-widest text-[#8A857D] mb-1">Agent Performance</div>
                    <div className="text-lg font-serif">{analysis.agentPerformanceScore} / 10</div>
                  </div>
                </div>
                <div className="space-y-3 border-t border-[#E5E0D8] pt-5">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-widest text-[#D97757] mb-1">Critical Insight</div>
                    <p className="text-sm text-[#2D2926]">{analysis.criticalInsight}</p>
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-widest text-[#8A857D] mb-1">Recommended Action</div>
                    <p className="text-sm text-[#5C564D]">{analysis.recommendedAction}</p>
                  </div>
                </div>
              </div>
            )}

            {/* ── TICKET TABLE ── */}
            <div className="document-card overflow-hidden">
              <div className="p-6 md:p-8 border-b border-[#E5E0D8] flex items-center justify-between">
                <h2 className="text-xl font-serif">Recent Inquiries</h2>
                <button
                  onClick={() => runAnalysis()}
                  className="p-2 text-[#8A857D] hover:text-[#2D2926] transition-colors"
                  title="Refresh"
                >
                  <RefreshCw className={`w-5 h-5 ${isLoadingAnalysis ? "animate-spin" : ""}`} />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#E5E0D8] bg-[#F9F8F6]">
                      <th className="px-8 py-4 font-medium text-sm text-[#8A857D]">Customer</th>
                      <th className="px-8 py-4 font-medium text-sm text-[#8A857D]">Channel</th>
                      <th className="px-8 py-4 font-medium text-sm text-[#8A857D]">Status</th>
                      <th className="px-8 py-4 font-medium text-sm text-[#8A857D]">Priority</th>
                      <th className="px-8 py-4 font-medium text-sm text-[#8A857D] text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E0D8]">
                    {STATIC_TICKETS.map((ticket) => (
                      <tr
                        key={ticket.id}
                        className={`hover:bg-[#F9F8F6] transition-colors group ${ticket.priority === "critical" ? "bg-red-50/30" : ""}`}
                      >
                        <td className="px-8 py-5">
                          <div className="font-medium text-[#2D2926]">{ticket.customer}</div>
                          <div className="text-xs text-[#8A857D] mt-1 font-mono">{ticket.id}</div>
                        </td>
                        <td className="px-8 py-5">
                          <span className="capitalize text-[#5C564D]">{ticket.channel}</span>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2">
                            {ticket.status === "In Progress" && (
                              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                            )}
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                              {ticket.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${getPriorityDot(ticket.priority)}`} />
                            <span className="text-xs font-medium text-[#8A857D] capitalize">{ticket.priority}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-[#8A857D] text-sm text-right font-mono">
                          {ticket.time}
                        </td>
                      </tr>
                    ))}
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
