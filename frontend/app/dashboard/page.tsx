"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { 
  Inbox, BarChart2, AlertCircle, RefreshCw, Clock, WifiOff, 
  TrendingUp, TrendingDown, Minus, Sparkles, Terminal, ArrowRight 
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAriaAgent } from "@/lib/hooks/useAriaAgent";
import { motion } from "framer-motion";

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
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [retryCount, setRetryCount] = useState(0);

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
    return "bg-bg-elevated text-text-secondary";
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
    return <Minus className="w-4 h-4 text-text-muted" />;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <main className="min-h-screen bg-bg-base text-text-primary flex flex-col">
      <Navbar />

      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-[1200px] mx-auto w-full px-6 pt-32 pb-20"
      >
        <motion.div variants={itemVariants} className="mb-12">
          <h1 className="text-4xl font-serif text-text-primary mb-3">Dashboard</h1>
          <p className="text-lg text-text-secondary">A centralized view of your support operations.</p>
        </motion.div>

        {error === "permanent" ? (
          <motion.div variants={itemVariants} className="document-card p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-6">
              <WifiOff className="w-8 h-8 text-accent" />
            </div>
            <h3 className="text-xl font-serif mb-2">Unable to connect</h3>
            <p className="text-text-muted mb-8">Backend may be down. Check system status.</p>
            <div className="flex gap-4">
              <Link href="/status" className="btn-secondary">Check Status →</Link>
              <button onClick={handlePermanentRetry} className="btn-primary">Try Again</button>
            </div>
          </motion.div>
        ) : countdown !== null ? (
          <motion.div variants={itemVariants} className="document-card p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-6">
              <Clock className="w-8 h-8 text-accent" />
            </div>
            <h3 className="text-xl font-serif mb-2">Backend is waking up...</h3>
            <p className="text-text-muted mb-8 max-w-[400px]">
              Our server was sleeping to save resources.<br />
              It usually takes 20-40 seconds to wake up.
            </p>
            <div className="w-full max-w-[300px] mb-8">
              <div className="text-sm font-medium text-text-primary mb-2">Retrying in {countdown} seconds...</div>
              <div className="w-full h-2 bg-border-fine rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent transition-all duration-1000 ease-linear"
                  style={{ width: `${(countdown / 30) * 100}%` }}
                />
              </div>
            </div>
            <button onClick={handleManualWake} className="btn-primary">Wake It Up →</button>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {/* ── INSTANT STAT CARDS ── */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: "Total Tickets", value: INSTANT_STATS.totalTickets, icon: Inbox, color: "text-text-primary" },
                { label: "Needs Attention", value: INSTANT_STATS.needsAttention, icon: AlertCircle, color: "text-accent" },
                { label: "Resolution Rate", value: INSTANT_STATS.resolutionRate, icon: BarChart2, color: "text-[#4A5D4E]" },
                { label: "Avg Response", value: INSTANT_STATS.avgResponseTime, icon: Clock, color: "text-blue-500" }
              ].map((stat, i) => (
                <motion.div 
                  key={i}
                  variants={itemVariants} 
                  className="document-card p-8 group"
                >
                  <div className="flex items-center gap-3 text-text-muted mb-4 group-hover:text-accent transition-colors">
                    <stat.icon className="w-5 h-5" />
                    <h3 className="font-medium text-[11px] uppercase tracking-widest">{stat.label}</h3>
                  </div>
                  <div className={`text-5xl font-serif ${stat.color}`}>{stat.value}</div>
                </motion.div>
              ))}
            </div>

            {/* ── AI AGENT TERMINAL LINK ── */}
            <motion.div variants={itemVariants}>
              <Link 
                href="/dashboard/agents"
                className="document-card p-6 flex items-center justify-between group hover:border-accent transition-all"
              >
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-text-primary rounded-2xl flex items-center justify-center text-white group-hover:bg-accent transition-colors shadow-lg">
                    <Terminal className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-serif text-text-primary">Agent Operations Center</h3>
                    <p className="text-sm text-text-muted">Command your Digital FTE roster directly.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-accent font-bold text-xs uppercase tracking-widest">
                  Manage Team <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </motion.div>

            {/* ── ARIA INTELLIGENCE REPORT ── */}
            <motion.div variants={itemVariants}>
              {isLoadingAnalysis && (
                <div className="document-card p-8 border-l-4 border-accent">
                  <div className="flex items-center gap-3 mb-4">
                    <Sparkles className="w-5 h-5 text-accent animate-pulse" />
                    <h2 className="text-xl font-serif">ARIA Intelligence Report</h2>
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 bg-bg-elevated rounded animate-pulse w-3/4" />
                    <div className="h-4 bg-bg-elevated rounded animate-pulse w-1/2" />
                    <div className="h-4 bg-bg-elevated rounded animate-pulse w-2/3" />
                  </div>
                </div>
              )}

              {analysis && !isLoadingAnalysis && (
                <div className="document-card p-8 border-l-4 border-accent animate-fade-in relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl -mr-16 -mt-16" />
                  <div className="flex items-center gap-3 mb-6 relative z-10">
                    <Sparkles className="w-5 h-5 text-accent" />
                    <h2 className="text-xl font-serif">ARIA Intelligence Report</h2>
                    <div className="ml-auto flex items-center gap-2 bg-bg-base px-3 py-1 rounded-full border border-border-fine">
                      {getTrendIcon(analysis.weeklyTrend)}
                      <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted capitalize">{analysis.weeklyTrend}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 relative z-10">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">Top Issue Category</div>
                      <div className="text-lg font-serif capitalize">{analysis.topIssueCategory}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">AI Resolution Rate</div>
                      <div className="text-lg font-serif">{analysis.resolutionRatePercent}%</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">Avg Response Time</div>
                      <div className="text-lg font-serif">{analysis.avgResponseTimeMinutes} min</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">Agent Performance</div>
                      <div className="text-lg font-serif">{analysis.agentPerformanceScore} / 10</div>
                    </div>
                  </div>
                  <div className="space-y-3 border-t border-border-fine pt-5 relative z-10">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-accent mb-1">Critical Insight</div>
                      <p className="text-sm text-text-primary font-serif italic">{analysis.criticalInsight}</p>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">Recommended Action</div>
                      <p className="text-sm text-text-secondary">{analysis.recommendedAction}</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* ── TICKET TABLE ── */}
            <motion.div variants={itemVariants} className="document-card overflow-hidden">
              <div className="p-6 md:p-8 border-b border-border-fine flex items-center justify-between">
                <h2 className="text-xl font-serif">Recent Inquiries</h2>
                <button
                  onClick={() => runAnalysis()}
                  className="p-2 text-text-muted hover:text-text-primary transition-colors"
                  title="Refresh"
                >
                  <RefreshCw className={`w-5 h-5 ${isLoadingAnalysis ? "animate-spin" : ""}`} />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border-fine bg-bg-base/50">
                      <th className="px-8 py-4 font-bold text-[10px] uppercase tracking-widest text-text-muted">Customer</th>
                      <th className="px-8 py-4 font-bold text-[10px] uppercase tracking-widest text-text-muted">Channel</th>
                      <th className="px-8 py-4 font-bold text-[10px] uppercase tracking-widest text-text-muted">Status</th>
                      <th className="px-8 py-4 font-bold text-[10px] uppercase tracking-widest text-text-muted">Priority</th>
                      <th className="px-8 py-4 font-bold text-[10px] uppercase tracking-widest text-text-muted text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-fine">
                    {STATIC_TICKETS.map((ticket) => (
                      <tr
                        key={ticket.id}
                        className={`hover:bg-bg-base/50 transition-colors group ${ticket.priority === "critical" ? "bg-red-50/10" : ""}`}
                      >
                        <td className="px-8 py-5">
                          <div className="font-bold text-text-primary group-hover:text-accent transition-colors">{ticket.customer}</div>
                          <div className="text-xs text-text-muted mt-1 font-mono">{ticket.id}</div>
                        </td>
                        <td className="px-8 py-5">
                          <span className="capitalize text-text-secondary text-sm">{ticket.channel}</span>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2">
                            {ticket.status === "In Progress" && (
                              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                            )}
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(ticket.status)}`}>
                              {ticket.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${getPriorityDot(ticket.priority)}`} />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted capitalize">{ticket.priority}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-text-muted text-xs text-right font-mono">
                          {ticket.time}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </main>
  );
}
