"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare, Clock, AlertTriangle, RefreshCcw,
  Mail, MessageCircle, Globe, Zap, TrendingUp, ChevronRight,
  TicketIcon,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import Navbar from "@/components/Navbar";
import LoadingSpinner from "@/components/LoadingSpinner";
import EmptyState from "@/components/EmptyState";

// ─── Static chart data ─────────────────────────────────────────────
const channelData = [
  { name: "Email",    value: 45, color: "#6366F1" },
  { name: "WhatsApp", value: 30, color: "#10B981" },
  { name: "Web",      value: 25, color: "#F59E0B" },
];

const sentimentData = [
  { day: "Mon", score: 0.80 },
  { day: "Tue", score: 0.75 },
  { day: "Wed", score: 0.82 },
  { day: "Thu", score: 0.78 },
  { day: "Fri", score: 0.85 },
  { day: "Sat", score: 0.88 },
  { day: "Sun", score: 0.92 },
];

// ─── Types ─────────────────────────────────────────────────────────
interface Ticket {
  id: string;
  customer: string;
  channel: string;
  status: string;
  sentiment: string;
  time: string;
}

interface KPI {
  title: string;
  value: string | number;
  sub: string;
  icon: React.ElementType;
  color: string;
}

// ─── KPI Card ─────────────────────────────────────────────────────
const KPICard = ({ title, value, sub, icon: Icon, color }: KPI) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: "easeOut" }}
    className="bg-slate-800 border border-slate-700 p-6 rounded-2xl hover:border-emerald-500/30 transition-colors duration-300"
  >
    <div className="flex justify-between items-start mb-5">
      <div className={`p-2.5 rounded-xl bg-slate-900 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
    <div className="text-3xl font-black text-white mb-1">{value}</div>
    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">{title}</div>
    <div className="text-xs text-slate-600 italic border-t border-slate-700 pt-3">{sub}</div>
  </motion.div>
);

// ─── Status badge ─────────────────────────────────────────────────
const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    resolved:   "bg-emerald-500/10 text-emerald-400 ring-emerald-500/30",
    escalated:  "bg-red-500/10 text-red-400 ring-red-500/30",
    processing: "bg-amber-500/10 text-amber-400 ring-amber-500/30",
    open:       "bg-amber-500/10 text-amber-400 ring-amber-500/30",
  };
  return (
    <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-tight ring-1 ring-inset ${map[status] ?? "bg-slate-700 text-slate-400 ring-slate-600"}`}>
      {status}
    </span>
  );
};

// ─── Dashboard Page ────────────────────────────────────────────────
export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [generatingBriefing, setGeneratingBriefing] = useState(false);
  const [briefing, setBriefing] = useState<{ briefing_markdown?: string; message?: string } | null>(null);

  const fetchDashboardData = useCallback(async () => {
    // 3-second timeout guard — dashboard NEVER stays stuck
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 3000);

    try {
      // Attempt to fetch real tickets via the existing API route
      // If NEXT_PUBLIC_API_URL is not available or the route fails, we gracefully
      // show empty state rather than an infinite spinner.
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 2800);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? ""}/api/v1/tickets?limit=10`,
        { signal: controller.signal }
      );
      clearTimeout(timer);

      if (res.ok) {
        const data = await res.json();
        // Normalise whatever shape the backend returns
        const items: Ticket[] = Array.isArray(data)
          ? data.map((t: Record<string, unknown>) => ({
              id:        String(t.ticket_id ?? t.id ?? "—"),
              customer:  String(t.customer_name ?? t.customer ?? "Unknown"),
              channel:   String(t.channel ?? "web_form"),
              status:    String(t.status ?? "open"),
              sentiment: String(t.sentiment_emoji ?? t.sentiment ?? "😐"),
              time:      String(t.created_at ?? t.time ?? "—"),
            }))
          : [];
        setTickets(items);
      }
    } catch {
      // Network fail or abort — just show empty state, no crash
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  }, []);

  const handleGenerateBriefing = async () => {
    setGeneratingBriefing(true);
    toast.loading("Generating CEO Briefing...", { id: "briefing" });
    try {
      const res = await fetch("/api/v1/briefing/generate", { method: "POST" });
      const data = await res.json();
      setBriefing(data);
      toast.success("Briefing generated!", { id: "briefing" });
    } catch {
      toast.error("Generation failed.", { id: "briefing" });
    } finally {
      setGeneratingBriefing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30_000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const kpis: KPI[] = [
    { title: "Total Tickets",   value: tickets.length || 0,  sub: "All time", icon: MessageSquare, color: "text-indigo-400" },
    { title: "Active Now",      value: tickets.filter(t => t.status === "processing" || t.status === "open").length || 0, sub: "In queue", icon: RefreshCcw, color: "text-emerald-400" },
    { title: "Avg Response",    value: "< 3s",               sub: "Latency target: 3,000ms", icon: Clock, color: "text-amber-400" },
    { title: "Escalation Rate", value: "—",                  sub: "Target: < 5%", icon: AlertTriangle, color: "text-red-400" },
  ];

  // ─── Loading state ───────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <LoadingSpinner size="lg" label="Connecting to ARIA..." />
      </div>
    );
  }

  // ─── Error state ─────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="text-red-400 w-7 h-7" />
          </div>
          <h2 className="text-white font-bold text-xl mb-2">Dashboard Unavailable</h2>
          <p className="text-slate-500 text-sm mb-6">{error}</p>
          <button
            onClick={() => { setError(null); setLoading(true); fetchDashboardData(); }}
            className="px-5 py-2.5 bg-slate-800 border border-slate-700 hover:border-slate-600 text-white text-sm font-bold rounded-xl transition-colors duration-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ─── Dashboard ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 pt-28 pb-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
              Executive Dashboard
            </h1>
            <p className="text-slate-500 text-sm flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              ARIA is live and monitoring
            </p>
          </div>

          <button
            onClick={handleGenerateBriefing}
            disabled={generatingBriefing}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl transition-colors duration-200 disabled:opacity-50"
          >
            <Zap className="w-4 h-4" />
            {generatingBriefing ? "Generating..." : "Generate Briefing"}
          </button>
        </div>

        {/* KPI grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {kpis.map((kpi) => (
            <KPICard key={kpi.title} {...kpi} />
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {/* Pie */}
          <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-6">
              Channel Distribution
            </h3>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={channelData} innerRadius={55} outerRadius={75} paddingAngle={5} dataKey="value">
                    {channelData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "#0F172A", border: "1px solid #334155", borderRadius: "12px" }}
                    itemStyle={{ color: "#F8FAFC" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-2">
              {channelData.map((c) => (
                <div key={c.name} className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                  {c.name}
                </div>
              ))}
            </div>
          </div>

          {/* Area chart */}
          <div className="lg:col-span-2 bg-slate-800 border border-slate-700 p-6 rounded-2xl">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-6">
              Customer Sentiment (7-day)
            </h3>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sentimentData}>
                  <defs>
                    <linearGradient id="sentimentGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis dataKey="day" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} domain={[0, 1]} />
                  <Tooltip
                    contentStyle={{ background: "#0F172A", border: "1px solid #334155", borderRadius: "12px" }}
                    itemStyle={{ color: "#F8FAFC" }}
                  />
                  <Area type="monotone" dataKey="score" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#sentimentGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Bottom: Tickets + Briefing */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Ticket table */}
          <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                Recent Tickets
                <span className="px-1.5 py-0.5 text-[10px] font-black bg-emerald-500 text-slate-950 rounded-md">
                  LIVE
                </span>
              </h3>
            </div>

            {tickets.length === 0 ? (
              <EmptyState
                icon={TicketIcon}
                message="No tickets yet"
                subMessage="Tickets will appear here once customers submit requests."
                ctaLabel="Submit first ticket →"
                ctaHref="/support"
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-700">
                      {["Ticket ID", "Customer", "Channel", "Status", "Time"].map((h) => (
                        <th key={h} className="pb-3 text-[10px] font-bold uppercase tracking-widest text-slate-600">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map((ticket) => (
                      <tr
                        key={ticket.id}
                        className="border-b last:border-0 border-slate-700/50 hover:bg-slate-700/20 transition-colors group cursor-pointer"
                      >
                        <td className="py-3.5 font-mono text-xs text-slate-500">{ticket.id}</td>
                        <td className="py-3.5 font-semibold text-sm text-white">{ticket.customer}</td>
                        <td className="py-3.5">
                          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                            {ticket.channel === "email"     && <Mail className="w-3.5 h-3.5 text-indigo-400" />}
                            {ticket.channel === "whatsapp"  && <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />}
                            {ticket.channel === "web_form"  && <Globe className="w-3.5 h-3.5 text-amber-400" />}
                            {ticket.channel.replace("_", " ")}
                          </div>
                        </td>
                        <td className="py-3.5"><StatusBadge status={ticket.status} /></td>
                        <td className="py-3.5 text-xs text-slate-600 text-right whitespace-nowrap">
                          {ticket.time}
                          <ChevronRight className="inline-block w-3.5 h-3.5 ml-1 opacity-0 group-hover:opacity-100 transition-all translate-x-0 group-hover:translate-x-0.5" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Briefing */}
          <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest">
                Weekly CEO Briefing
              </h3>
              <span className="text-xs text-slate-600">
                {briefing ? "Just generated" : "Not yet generated"}
              </span>
            </div>

            <div className="flex-1 bg-slate-950/60 border border-slate-700 rounded-2xl p-6 overflow-y-auto prose prose-invert prose-emerald max-w-none">
              {briefing ? (
                <ReactMarkdown>{briefing.briefing_markdown ?? briefing.message ?? ""}</ReactMarkdown>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center py-10">
                  <div className="w-14 h-14 bg-slate-900 border border-slate-700 rounded-2xl flex items-center justify-center mb-4">
                    <TrendingUp className="text-slate-600 w-6 h-6" />
                  </div>
                  <p className="text-white font-semibold mb-2">No Briefing Available</p>
                  <p className="text-slate-500 text-sm max-w-xs mx-auto mb-6">
                    Click &ldquo;Generate Briefing&rdquo; to create an executive summary.
  </p>
                  <button
                    onClick={handleGenerateBriefing}
                    className="px-5 py-2 border border-slate-700 hover:bg-slate-700/50 text-slate-300 text-sm font-bold rounded-xl transition-colors duration-200"
                  >
                    Run Generator
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
