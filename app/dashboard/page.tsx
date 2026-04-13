"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Inbox, BarChart2, AlertCircle, RefreshCw, Clock, WifiOff,
  TrendingUp, TrendingDown, Minus, Sparkles, Terminal, ArrowRight,
  Cpu, Zap, Brain, Search, Mail, Database, Command, Plus,
} from "lucide-react";
import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";
import Navbar from "@/components/Navbar";
import { BentoCell } from "@/components/BentoCell";
import { useAriaAgent } from "@/lib/hooks/useAriaAgent";
import { useWebLLM } from "@/lib/hooks/useWebLLM";

interface Ticket {
  id: string;
  customer: string;
  channel: string;
  status: string;
  time: string;
  priority: "low" | "medium" | "high" | "critical";
  message?: string;
  timestamp?: number;
}

const AGENT_ROSTER = [
  { name: "Manager",    model: "llama-3.1-70b",    temp: 0.1, icon: Brain,    color: "text-violet-500" },
  { name: "Research A", model: "llama-3.1-70b",    temp: 0.3, icon: Search,   color: "text-blue-500"   },
  { name: "Research B", model: "llama-3.1-70b",    temp: 0.3, icon: Search,   color: "text-blue-400"   },
  { name: "Sales A",    model: "llama-3.1-70b",    temp: 0.8, icon: Mail,     color: "text-emerald-500"},
  { name: "Sales B",    model: "llama-3.1-70b",    temp: 0.8, icon: Zap,      color: "text-yellow-500" },
  { name: "Technical",  model: "llama-3.3-70b",    temp: 0.2, icon: Database, color: "text-accent"     },
];

export default function DashboardPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState({
    totalTickets: 0,
    needsAttention: 0,
    resolutionRate: 0,
    avgResponseTime: "1.2 min",
  });
  const [lastUpdated, setLastUpdated] = useState("");
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { analysis, isLoadingAnalysis, runAnalysis } = useAriaAgent();
  const { status: webLLMStatus, progress: webLLMProgress, progressText, memoryGB } = useWebLLM();

  useEffect(() => {
    return () => { if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current); };
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("h4_tickets");
    if (stored) {
      try {
        const parsed: Ticket[] = JSON.parse(stored);
        const sorted = parsed.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        setTickets(sorted);
        const attention = sorted.filter(t => t.priority === "critical" || t.priority === "high" || t.status === "Needs Review").length;
        const resolved = sorted.filter(t => t.status === "Resolved").length;
        const rate = sorted.length > 0 ? Math.round((resolved / sorted.length) * 100) : 100;
        setStats({ totalTickets: sorted.length, needsAttention: attention, resolutionRate: rate, avgResponseTime: "1.2 min" });
      } catch (e) { console.error("Failed to parse tickets", e); }
    }
    setLastUpdated(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => { runAnalysis(); }, 2000);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s === "resolved") return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
    if (s === "in progress") return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
    if (s === "needs review") return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
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
    if (trend === "improving") return <TrendingUp className="w-4 h-4 text-emerald-500" />;
    if (trend === "declining") return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-text-muted" />;
  };

  const webLLMStatusLabel = () => {
    switch (webLLMStatus) {
      case "ready":       return { label: "ON-DEVICE", color: "text-emerald-500", dot: "bg-emerald-500" };
      case "loading":     return { label: `LOADING ${webLLMProgress}%`, color: "text-amber-500", dot: "bg-amber-500 animate-pulse" };
      case "detecting":   return { label: "DETECTING...", color: "text-text-muted", dot: "bg-text-muted animate-pulse" };
      case "unsupported": return { label: "CLOUD MODE", color: "text-accent", dot: "bg-accent" };
      default:            return { label: "INITIALISING", color: "text-text-muted", dot: "bg-text-muted" };
    }
  };

  const wllm = webLLMStatusLabel();
  const radialData = [{ value: stats.resolutionRate, fill: "var(--accent)" }];

  const openCommandPalette = () => {
    window.dispatchEvent(new CustomEvent("toggle-command-palette"));
  };

  return (
    <main className="min-h-screen bg-bg-base text-text-primary flex flex-col">
      <Navbar />

      <div className="max-w-[1280px] mx-auto w-full px-6 pt-32 pb-24">

        {/* ── Row 1: Header ─────────────────────────────────────────────────── */}
        <BentoCell colSpan={12} delay={0} noGlass className="mb-2 !rounded-none !border-0 !shadow-none !bg-transparent">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] font-bold tracking-[0.35em] text-accent uppercase font-mono mb-1">
                H4 COMMAND CENTER
              </p>
              <h1 className="text-4xl font-serif text-text-primary">Dashboard</h1>
              <p className="text-sm text-text-muted mt-1">
                Autonomous operations — last updated {lastUpdated}
              </p>
            </div>
            <button
              onClick={openCommandPalette}
              className="flex items-center gap-2 px-4 py-2 glass-apple border border-white/20 dark:border-white/10 rounded-full text-xs font-bold tracking-widest text-text-muted uppercase hover:text-accent hover:border-accent/30 transition-all"
            >
              <Command size={13} /> K
            </button>
          </div>
        </BentoCell>

        {/* ── Row 2: Stat Cards (12-col grid) ───────────────────────────────── */}
        <div className="grid grid-cols-12 gap-5 mt-6">

          {/* Total Tickets */}
          <BentoCell colSpan={3} delay={0.05}>
            <div className="p-7">
              <div className="flex items-center gap-2 text-text-muted mb-4">
                <Inbox className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-widest">Total Tickets</span>
              </div>
              <div className="text-6xl font-serif text-text-primary tabular-nums">{stats.totalTickets}</div>
            </div>
          </BentoCell>

          {/* Needs Attention */}
          <BentoCell colSpan={3} delay={0.1}>
            <div className="p-7">
              <div className="flex items-center gap-2 text-text-muted mb-4">
                <AlertCircle className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-widest">Needs Attention</span>
              </div>
              <div className="flex items-end gap-3">
                <div className="text-6xl font-serif text-accent tabular-nums">{stats.needsAttention}</div>
                {stats.needsAttention > 0 && (
                  <div className="w-2 h-2 rounded-full bg-accent animate-pulse mb-4" />
                )}
              </div>
            </div>
          </BentoCell>

          {/* Resolution Rate */}
          <BentoCell colSpan={3} delay={0.15}>
            <div className="p-7 flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-text-muted mb-4">
                  <BarChart2 className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-widest">Resolution Rate</span>
                </div>
                <div className="text-6xl font-serif text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {stats.resolutionRate}%
                </div>
              </div>
              <div className="w-16 h-16 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="100%" data={radialData} startAngle={90} endAngle={-270}>
                    <RadialBar dataKey="value" cornerRadius={4} background={{ fill: "var(--bg-elevated)" }} />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </BentoCell>

          {/* Avg Response Time */}
          <BentoCell colSpan={3} delay={0.2}>
            <div className="p-7">
              <div className="flex items-center gap-2 text-text-muted mb-4">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-widest">Avg Response</span>
              </div>
              <div className="text-6xl font-serif text-text-primary">{stats.avgResponseTime}</div>
              <div className="mt-2 text-[9px] font-bold uppercase tracking-widest text-accent">
                AI-Accelerated
              </div>
            </div>
          </BentoCell>

          {/* ── Row 3: WebLLM Status + Agent Roster ──────────────────────── */}

          {/* WebLLM Status Card */}
          <BentoCell colSpan={5} delay={0.25}>
            <div className="p-7 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-bg-elevated rounded-2xl flex items-center justify-center border border-border-fine">
                    <Cpu className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold tracking-[0.3em] text-text-muted uppercase font-mono">On-Device AI</p>
                    <h3 className="font-serif text-base text-text-primary">WebLLM Engine</h3>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${wllm.dot}`} />
                    <span className={`text-[9px] font-bold tracking-widest uppercase font-mono ${wllm.color}`}>
                      {wllm.label}
                    </span>
                  </div>
                </div>

                {/* Model info */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="bg-bg-elevated/60 rounded-xl p-3 border border-border-fine">
                    <p className="text-[8px] font-bold tracking-widest text-text-muted uppercase mb-1">Model</p>
                    <p className="text-xs font-mono text-text-primary">Llama-3-8B-Instruct</p>
                  </div>
                  <div className="bg-bg-elevated/60 rounded-xl p-3 border border-border-fine">
                    <p className="text-[8px] font-bold tracking-widest text-text-muted uppercase mb-1">Device RAM</p>
                    <p className="text-xs font-mono text-text-primary">
                      {memoryGB !== null ? `${memoryGB} GB` : "Unknown"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              {(webLLMStatus === "loading" || webLLMStatus === "detecting") && (
                <div>
                  <div className="flex justify-between text-[9px] font-bold tracking-widest text-text-muted uppercase mb-2">
                    <span>{progressText || "Initialising..."}</span>
                    <span>{webLLMProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-bg-elevated rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-accent rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${webLLMProgress}%` }}
                      transition={{ ease: "easeOut", duration: 0.4 }}
                    />
                  </div>
                  <p className="text-[8px] text-text-muted mt-2">
                    First load downloads ~4 GB model. Cached in browser IndexedDB thereafter.
                  </p>
                </div>
              )}

              {webLLMStatus === "ready" && (
                <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[9px] font-bold tracking-widest text-emerald-600 dark:text-emerald-400 uppercase">
                    Private · Zero network cost · On-device inference
                  </span>
                </div>
              )}

              {webLLMStatus === "unsupported" && (
                <div className="flex items-center gap-2 px-3 py-2 bg-accent/10 border border-accent/20 rounded-xl">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  <span className="text-[9px] font-bold tracking-widest text-accent uppercase">
                    Fallback active — Groq cloud (pooled keys)
                  </span>
                </div>
              )}
            </div>
          </BentoCell>

          {/* Agent Status Panel */}
          <BentoCell colSpan={7} delay={0.3}>
            <div className="p-7">
              <div className="flex items-center gap-3 mb-5">
                <Brain className="w-5 h-5 text-accent" />
                <h3 className="font-serif text-base">Agent Roster</h3>
                <span className="ml-auto text-[9px] font-bold tracking-widest text-text-muted uppercase">6 Agents Online</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {AGENT_ROSTER.map((agent) => {
                  const Icon = agent.icon;
                  return (
                    <div key={agent.name} className="flex items-center gap-3 bg-bg-elevated/50 rounded-xl p-3 border border-border-fine">
                      <div className="relative">
                        <Icon className={`w-4 h-4 ${agent.color}`} />
                        <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-text-primary truncate">{agent.name}</p>
                        <p className="text-[9px] font-mono text-text-muted truncate">{agent.model}</p>
                      </div>
                      <div className="text-[9px] font-bold text-text-muted font-mono">
                        t={agent.temp}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </BentoCell>

          {/* ── Row 4: Intelligence Report + Quick Actions ──────────────── */}

          {/* ARIA Intelligence Report */}
          <BentoCell colSpan={8} delay={0.35}>
            <div className="p-7 border-l-4 border-l-accent h-full">
              <div className="flex items-center gap-3 mb-5">
                <Sparkles className="w-5 h-5 text-accent" />
                <h2 className="text-lg font-serif">ARIA Intelligence Report</h2>
                <button
                  onClick={() => runAnalysis()}
                  className="ml-auto p-1.5 text-text-muted hover:text-text-primary transition-colors rounded-lg hover:bg-bg-elevated"
                  title="Refresh report"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingAnalysis ? "animate-spin" : ""}`} />
                </button>
              </div>

              <AnimatePresence mode="wait">
                {isLoadingAnalysis && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-3"
                  >
                    {[0.75, 0.5, 0.65].map((w, i) => (
                      <div key={i} className="h-4 bg-bg-elevated rounded animate-pulse" style={{ width: `${w * 100}%` }} />
                    ))}
                  </motion.div>
                )}

                {analysis && !isLoadingAnalysis && (
                  <motion.div
                    key="report"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                  >
                    <div className="flex items-center gap-2 mb-5">
                      {getTrendIcon(analysis.weeklyTrend)}
                      <span className="text-xs font-bold uppercase tracking-wider text-text-muted capitalize">{analysis.weeklyTrend}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-5">
                      {[
                        { label: "Top Issue", value: analysis.topIssueCategory },
                        { label: "AI Resolution", value: `${analysis.resolutionRatePercent}%` },
                        { label: "Avg Response", value: `${analysis.avgResponseTimeMinutes} min` },
                        { label: "Agent Score", value: `${analysis.agentPerformanceScore} / 10` },
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <p className="text-[9px] font-bold uppercase tracking-widest text-text-muted mb-1">{label}</p>
                          <p className="font-serif text-base capitalize">{value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-3 border-t border-border-fine pt-4">
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-accent mb-1">Critical Insight</p>
                        <p className="text-sm text-text-primary">{analysis.criticalInsight}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-text-muted mb-1">Recommended Action</p>
                        <p className="text-sm text-text-secondary">{analysis.recommendedAction}</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {!analysis && !isLoadingAnalysis && (
                  <motion.p key="empty" className="text-sm text-text-muted font-serif italic">
                    Intelligence report will appear automatically...
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </BentoCell>

          {/* Quick Actions */}
          <BentoCell colSpan={4} delay={0.4}>
            <div className="p-7 h-full flex flex-col gap-3">
              <h3 className="font-serif text-base mb-1">Quick Actions</h3>

              <button
                onClick={() => runAnalysis()}
                className="w-full flex items-center gap-3 p-4 rounded-2xl bg-bg-elevated/60 border border-border-fine hover:border-accent/30 hover:bg-accent/5 transition-all group text-left"
              >
                <Sparkles className="w-4 h-4 text-accent shrink-0" />
                <span className="text-sm font-medium text-text-primary">Run Analysis</span>
                <ArrowRight className="w-3 h-3 text-text-muted ml-auto group-hover:translate-x-1 transition-transform" />
              </button>

              <Link
                href="/support"
                className="w-full flex items-center gap-3 p-4 rounded-2xl bg-bg-elevated/60 border border-border-fine hover:border-accent/30 hover:bg-accent/5 transition-all group"
              >
                <Plus className="w-4 h-4 text-accent shrink-0" />
                <span className="text-sm font-medium text-text-primary">New Ticket</span>
                <ArrowRight className="w-3 h-3 text-text-muted ml-auto group-hover:translate-x-1 transition-transform" />
              </Link>

              <button
                onClick={openCommandPalette}
                className="w-full flex items-center gap-3 p-4 rounded-2xl bg-accent text-white rounded-2xl hover:brightness-110 transition-all group shadow-md shadow-accent/20"
              >
                <Command className="w-4 h-4 shrink-0" />
                <span className="text-sm font-bold">Command ⌘K</span>
                <ArrowRight className="w-3 h-3 ml-auto group-hover:translate-x-1 transition-transform" />
              </button>

              <Link
                href="/dashboard/agents"
                className="w-full flex items-center gap-3 p-4 rounded-2xl bg-bg-elevated/60 border border-border-fine hover:border-accent/30 hover:bg-accent/5 transition-all group"
              >
                <Terminal className="w-4 h-4 text-accent shrink-0" />
                <span className="text-sm font-medium text-text-primary">Agent Center</span>
                <ArrowRight className="w-3 h-3 text-text-muted ml-auto group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </BentoCell>

          {/* ── Row 5: Agent Operations Center Link ──────────────────────── */}
          <BentoCell colSpan={12} delay={0.45} noGlass className="!rounded-none !border-0 !shadow-none !bg-transparent">
            <Link
              href="/dashboard/agents"
              className="glass-apple p-6 rounded-[2rem] flex items-center justify-between group hover:border-accent/40 transition-all shadow-soft border border-white/20 dark:border-white/5 relative overflow-hidden"
            >
              <div className="flex items-center gap-5 relative z-10">
                <div className="w-12 h-12 bg-text-primary rounded-2xl flex items-center justify-center text-bg-base group-hover:bg-accent transition-colors shadow-lg">
                  <Terminal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-serif text-text-primary">Agent Operations Center</h3>
                  <p className="text-sm text-text-secondary">Command your Digital FTE roster directly.</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-accent font-bold text-xs uppercase tracking-widest relative z-10">
                Manage Team <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </BentoCell>

          {/* ── Row 6: Ticket Table ──────────────────────────────────────── */}
          <BentoCell colSpan={12} delay={0.5} className="overflow-hidden">
            <div className="p-6 md:p-7 border-b border-border-fine flex items-center justify-between">
              <h2 className="text-lg font-serif">Recent Inquiries</h2>
              <button
                onClick={() => runAnalysis()}
                className="p-2 text-text-muted hover:text-text-primary transition-colors rounded-lg hover:bg-bg-elevated"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingAnalysis ? "animate-spin" : ""}`} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border-fine bg-bg-surface/50">
                    <th className="px-7 py-4 font-medium text-xs text-text-muted uppercase tracking-widest">Customer</th>
                    <th className="px-7 py-4 font-medium text-xs text-text-muted uppercase tracking-widest">Channel</th>
                    <th className="px-7 py-4 font-medium text-xs text-text-muted uppercase tracking-widest">Status</th>
                    <th className="px-7 py-4 font-medium text-xs text-text-muted uppercase tracking-widest">Priority</th>
                    <th className="px-7 py-4 font-medium text-xs text-text-muted text-right uppercase tracking-widest">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-fine">
                  {tickets.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-text-muted font-serif italic text-sm">
                        No active tickets yet. Submit a test ticket in the Support view.
                      </td>
                    </tr>
                  ) : (
                    tickets.map((ticket, i) => (
                      <motion.tr
                        key={ticket.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                        className={`hover:bg-bg-elevated/60 transition-colors ${ticket.priority === "critical" ? "bg-red-500/5" : ""}`}
                      >
                        <td className="px-7 py-5">
                          <div className="font-medium text-text-primary">{ticket.customer}</div>
                          <div className="text-xs text-text-muted mt-0.5 font-mono">{ticket.id}</div>
                        </td>
                        <td className="px-7 py-5">
                          <span className="capitalize text-sm text-text-secondary">{ticket.channel}</span>
                        </td>
                        <td className="px-7 py-5">
                          <div className="flex items-center gap-2">
                            {ticket.status === "In Progress" && <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />}
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                              {ticket.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-7 py-5">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${getPriorityDot(ticket.priority)}`} />
                            <span className="text-xs font-medium text-text-muted capitalize">{ticket.priority}</span>
                          </div>
                        </td>
                        <td className="px-7 py-5 text-text-muted text-sm text-right font-mono">{ticket.time}</td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </BentoCell>

        </div>
      </div>
    </main>
  );
}
