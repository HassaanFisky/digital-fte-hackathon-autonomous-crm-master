"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Search, Filter, TrendingUp, TrendingDown, Clock, 
  MessageSquare, User, CheckCircle2, AlertTriangle, 
  Mail, MessageCircle, Globe, RefreshCcw, ChevronRight, Zap
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from "recharts";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";

// Mock Data
const channelData = [
  { name: 'Email', value: 45, color: '#6366F1' },
  { name: 'WhatsApp', value: 30, color: '#10B981' },
  { name: 'Web', value: 25, color: '#F59E0B' },
];

const sentimentData = [
  { day: 'Mon', score: 0.8 },
  { day: 'Tue', score: 0.75 },
  { day: 'Wed', score: 0.82 },
  { day: 'Thu', score: 0.78 },
  { day: 'Fri', score: 0.85 },
  { day: 'Sat', score: 0.88 },
  { day: 'Sun', score: 0.92 },
];

const KPICard = ({ title, value, sub, icon: Icon, color }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-slate-800 border border-slate-700 p-6 rounded-3xl group hover:border-emerald-500/50 transition-all shadow-xl"
  >
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-2xl ${color} bg-opacity-10 text-opacity-100 flex items-center justify-center`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex items-center text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg">
        <TrendingUp className="w-3 h-3 mr-1" /> 12%
      </div>
    </div>
    <div className="text-3xl font-black mb-1 group-hover:scale-105 origin-left transition-transform">{value}</div>
    <div className="text-sm font-bold text-text-muted uppercase tracking-widest">{title}</div>
    <div className="mt-4 pt-4 border-t border-slate-700 text-xs text-text-muted italic">{sub}</div>
  </motion.div>
);

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [generatingBriefing, setGeneratingBriefing] = useState(false);
  const [briefing, setBriefing] = useState<any>(null);
  const [tickets, setTickets] = useState<any[]>([]);

  const fetchDashboardData = async () => {
    // In a real app, fetch from multiple endpoints
    // Mocking for now
    setTickets([
      { id: 'WEB-X9J21', customer: 'Alice Smith', channel: 'web_form', status: 'resolved', sentiment: '😊', time: '2m ago' },
      { id: 'WHS-P8B14', customer: 'John Doe', channel: 'whatsapp', status: 'processing', sentiment: '😐', time: '14m ago' },
      { id: 'EML-S1A20', customer: 'Sarah Jenkins', channel: 'email', status: 'escalated', sentiment: '😡', time: '41m ago' },
      { id: 'WEB-M7V88', customer: 'Bob Marley', channel: 'web_form', status: 'open', sentiment: '🤔', time: '1h ago' },
      { id: 'WHS-T4K12', customer: 'Charlie Brown', channel: 'whatsapp', status: 'resolved', sentiment: '😊', time: '3h ago' },
    ]);
    setLoading(false);
  };

  const handleGenerateBriefing = async () => {
    setGeneratingBriefing(true);
    toast.loading("Generating CEO Briefing...", { id: "briefing" });
    try {
      const res = await fetch("/api/v1/briefing/generate", { method: "POST" });
      const data = await res.json();
      setBriefing(data);
      toast.success("Briefing generated!", { id: "briefing" });
    } catch (e) {
      toast.error("Generation failed.", { id: "briefing" });
    } finally {
      setGeneratingBriefing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center font-mono">LOADING_ARIA_SYSTEM...</div>;

  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-10">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
           <div>
             <h1 className="text-4xl font-extrabold tracking-tight mb-2">Executive Dashboard</h1>
             <p className="text-text-muted flex items-center gap-2">
               <span className="relative flex h-2 w-2">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
               </span>
               ARIA is currently monitoring 12 active conversations.
             </p>
           </div>
           
           <div className="flex gap-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Search tickets..." 
                  className="bg-slate-800 border border-slate-700 rounded-xl pl-12 pr-6 py-3 focus:outline-none focus:border-emerald-500 text-sm font-medium w-64"
                />
              </div>
              <button 
                onClick={handleGenerateBriefing}
                disabled={generatingBriefing}
                className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 px-6 py-3 rounded-xl font-bold flex items-center transition-all disabled:opacity-50"
              >
                <Zap className="w-4 h-4 mr-2" /> 
                {generatingBriefing ? "Generating..." : "Generate Briefing"}
              </button>
           </div>
        </header>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
           <KPICard title="Total Tickets" value="1,284" sub="Processed last 7 days" icon={MessageSquare} color="text-indigo-500" />
           <KPICard title="Active Now" value="12" sub="Bots actively responding" icon={RefreshCcw} color="text-emerald-500" />
           <KPICard title="Avg Response" value="2,450ms" sub="Latency benchmark: 3,000ms" icon={Clock} color="text-amber-500" />
           <KPICard title="Escalation Rate" value="4.2%" sub="Target: < 5.0%" icon={AlertTriangle} color="text-red-500" />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Ticket Breakdown */}
            <div className="lg:col-span-1 bg-slate-800 border border-slate-700 p-8 rounded-3xl">
               <h3 className="text-xl font-bold mb-8">Channel Distribution</h3>
               <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={channelData}
                        innerRadius={80}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {channelData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ background: '#0F172A', border: '1px solid #334155', borderRadius: '12px' }}
                        itemStyle={{ color: '#F8FAFC' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
               </div>
               <div className="flex justify-center gap-6 mt-4">
                  {channelData.map((c) => (
                    <div key={c.name} className="flex items-center text-xs font-bold uppercase tracking-widest text-text-muted">
                      <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: c.color }} />
                      {c.name}
                    </div>
                  ))}
               </div>
            </div>

            {/* Sentiment Trend */}
            <div className="lg:col-span-2 bg-slate-800 border border-slate-700 p-8 rounded-3xl">
               <h3 className="text-xl font-bold mb-8">Customer Sentiment Trend</h3>
               <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sentimentData}>
                      <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                      <XAxis dataKey="day" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} domain={[0, 1]} />
                      <Tooltip 
                        contentStyle={{ background: '#0F172A', border: '1px solid #334155', borderRadius: '12px' }}
                      />
                      <Area type="monotone" dataKey="score" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                    </AreaChart>
                  </ResponsiveContainer>
               </div>
            </div>
        </div>

        {/* Bottom Section: Feed & Briefing */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Live Feed */}
            <div className="bg-slate-800 border border-slate-700 p-8 rounded-3xl shadow-xl overflow-hidden">
               <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-bold flex items-center gap-3">
                    Recent Tickets
                    <span className="text-xs bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full font-black">LIVE</span>
                  </h3>
                  <button className="text-sm font-bold text-emerald-500 hover:underline">View All</button>
               </div>
               
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                   <thead>
                     <tr className="border-b border-slate-700">
                       <th className="pb-4 text-xs font-bold uppercase tracking-widest text-text-muted">Ticket ID</th>
                       <th className="pb-4 text-xs font-bold uppercase tracking-widest text-text-muted">Customer</th>
                       <th className="pb-4 text-xs font-bold uppercase tracking-widest text-text-muted">Channel</th>
                       <th className="pb-4 text-xs font-bold uppercase tracking-widest text-text-muted">Status</th>
                       <th className="pb-4 text-xs font-bold uppercase tracking-widest text-text-muted text-center">Sentiment</th>
                       <th className="pb-4 text-xs font-bold uppercase tracking-widest text-text-muted text-right">Time</th>
                     </tr>
                   </thead>
                   <tbody>
                     {tickets.map((ticket) => (
                       <tr key={ticket.id} className="border-b last:border-0 border-slate-700/50 hover:bg-slate-700/20 transition-colors group cursor-pointer">
                         <td className="py-4 font-mono text-xs text-text-muted">{ticket.id}</td>
                         <td className="py-4 font-bold">{ticket.customer}</td>
                         <td className="py-4">
                           <div className="flex items-center gap-2 text-xs font-medium">
                              {ticket.channel === 'email' && <Mail className="w-3.5 h-3.5 text-indigo-400" />}
                              {ticket.channel === 'whatsapp' && <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />}
                              {ticket.channel === 'web_form' && <Globe className="w-3.5 h-3.5 text-amber-400" />}
                              {ticket.channel.replace('_', ' ')}
                           </div>
                         </td>
                         <td className="py-4">
                            <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-tighter ring-1 ring-inset ${
                              ticket.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-500 ring-emerald-500/30' : 
                              ticket.status === 'escalated' ? 'bg-red-500/10 text-red-500 ring-red-500/30' : 
                              'bg-amber-500/10 text-amber-500 ring-amber-500/30'
                            }`}>
                              {ticket.status}
                            </span>
                         </td>
                         <td className="py-4 text-center text-xl">{ticket.sentiment}</td>
                         <td className="py-4 text-right text-xs text-text-muted font-medium">{ticket.time} <ChevronRight className="inline-block w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" /></td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>

            {/* CEO Briefing */}
            <div className="bg-slate-800 border border-slate-700 p-8 rounded-3xl shadow-xl flex flex-col h-full overflow-hidden">
               <h3 className="text-xl font-bold mb-8 flex items-center justify-between">
                 Weekly CEO Briefing
                 <span className="text-xs font-medium text-text-muted">Last generated: {briefing ? 'Just now' : 'Never'}</span>
               </h3>
               
               <div className="flex-1 bg-slate-950/50 border border-slate-700 rounded-2xl p-8 overflow-y-auto prose prose-invert prose-emerald max-w-none">
                 {briefing ? (
                   <ReactMarkdown>{briefing.briefing_markdown || briefing.message}</ReactMarkdown>
                 ) : (
                   <div className="h-full flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-6">
                        <TrendingUp className="text-text-muted w-8 h-8" />
                      </div>
                      <h4 className="font-bold text-lg mb-2">No Briefing Available</h4>
                      <p className="text-text-muted text-sm max-w-xs mx-auto mb-8">
                        Executive summaries are generated based on historical data. Click the button above to generate a new one.
                      </p>
                      <button 
                        onClick={handleGenerateBriefing}
                        className="px-6 py-2 border border-slate-700 hover:bg-slate-800 text-sm font-bold rounded-lg transition-all"
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
