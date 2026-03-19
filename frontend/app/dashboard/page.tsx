'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, TrendingUp, Users, Clock, AlertCircle, 
  Mail, Phone, Globe, Search, Filter, RefreshCw, 
  ExternalLink, ChevronRight, CheckCircle2, MoreVertical,
  Download, FileText, Zap, User, Star
} from 'lucide-react';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { formatDistanceToNow } from 'date-fns';

const sentimentData = [
  { day: 'Mon', sentiment: 0.8, tickets: 42 },
  { day: 'Tue', sentiment: 0.75, tickets: 38 },
  { day: 'Wed', sentiment: 0.85, tickets: 56 },
  { day: 'Thu', sentiment: 0.9, tickets: 45 },
  { day: 'Fri', sentiment: 0.82, tickets: 62 },
  { day: 'Sat', sentiment: 0.88, tickets: 24 },
  { day: 'Sun', sentiment: 0.92, tickets: 18 },
];

const channelData = [
  { name: 'Email', value: 450, color: '#10B981' },
  { name: 'WhatsApp', value: 300, color: '#6366F1' },
  { name: 'Web Form', value: 150, color: '#F59E0B' },
];

const mockTickets = [
  { id: 'TIC-1024', customer: 'John Smith', channel: 'email', status: 'processing', sentiment: 0.8, created_at: new Date(Date.now() - 1000 * 60 * 15) },
  { id: 'TIC-1023', customer: '+14155238886', channel: 'whatsapp', status: 'resolved', sentiment: 0.9, created_at: new Date(Date.now() - 1000 * 60 * 45) },
  { id: 'TIC-1022', customer: 'Alice Cooper', channel: 'web_form', status: 'open', sentiment: 0.4, created_at: new Date(Date.now() - 1000 * 60 * 120) },
  { id: 'TIC-1021', customer: 'Bob Marley', channel: 'email', status: 'escalated', sentiment: 0.2, created_at: new Date(Date.now() - 1000 * 60 * 300) },
];

const getSentimentIcon = (score: number) => {
  if (score >= 0.8) return '😇';
  if (score >= 0.6) return '🙂';
  if (score >= 0.4) return '😐';
  return '😠';
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'open': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    case 'processing': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    case 'resolved': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    case 'escalated': return 'bg-red-500/10 text-red-500 border-red-500/20';
    default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
  }
};

const getChannelIcon = (channel: string) => {
  switch (channel) {
    case 'email': return <Mail className="w-3.5 h-3.5" />;
    case 'whatsapp': return <Phone className="w-3.5 h-3.5" />;
    case 'web_form': return <Globe className="w-3.5 h-3.5" />;
    default: return <AlertCircle className="w-3.5 h-3.5" />;
  }
};

export default function Dashboard() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [briefing, setBriefing] = useState<any>(null);
  const [briefingLoading, setBriefingLoading] = useState(true);
  const [briefingError, setBriefingError] = useState(false);
  const [generating, setGenerating] = useState(false);

  const fetchBriefing = async () => {
    try {
      setBriefingError(false);
      const res = await fetch('/api/briefings/latest');
      if (res.status === 404) { setBriefingLoading(false); return; }
      if (!res.ok) throw new Error();
      const data = await res.json();
      setBriefing(data);
    } catch {
      setBriefingError(true);
    } finally {
      setBriefingLoading(false);
    }
  };

  const handleGenerateBriefing = async () => {
    setGenerating(true);
    try {
      await fetch('/api/briefings/latest', { method: 'POST' });
      setTimeout(() => { fetchBriefing(); setGenerating(false); }, 35000);
    } catch {
      setGenerating(false);
    }
  };

  const getBriefingExcerpt = (markdown: string): string => {
    if (!markdown) return '';
    return markdown
      .replace(/#{1,6}\s+/g, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/\n+/g, ' ')
      .trim()
      .slice(0, 250);
  };

  useEffect(() => {
    fetchBriefing();
    const interval = setInterval(() => {
      setIsUpdating(true);
      setTimeout(() => setIsUpdating(false), 1500);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-1">CEO Dashboard</h1>
          <p className="text-xs font-bold text-slate-500 tracking-[0.2em] uppercase flex items-center gap-2">
            ARIA Intelligence Center {isUpdating && <RefreshCw className="w-3 h-3 animate-spin text-emerald-500" />}
          </p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                <input className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm focus:border-emerald-500 outline-none" placeholder="Search interaction history..." />
            </div>
            <button className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all">
                <Filter className="w-4 h-4 text-slate-400" />
            </button>
            <button className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm hover:bg-emerald-400 transition-all flex items-center gap-2">
                <FileText className="w-4 h-4" /> Briefing
            </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Tickets', value: '1,284', trend: '+12%', icon: <TrendingUp className="text-blue-500" /> },
          { label: 'Active Chats', value: '42', pulse: true, icon: <Users className="text-emerald-500" /> },
          { label: 'Avg Response', value: '2,450ms', trend: '-110ms', icon: <Clock className="text-indigo-500" /> },
          { label: 'Escalation Rate', value: '4.2%', trend: '-0.5%', icon: <AlertCircle className="text-amber-500" /> },
        ].map((kpi, i) => (
          <motion.div 
            key={i} 
            className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-500 tracking-widest uppercase">{kpi.label}</span>
              <div className="p-2 rounded-lg bg-slate-950">{kpi.icon}</div>
            </div>
            <div className="flex items-end justify-between">
              <div className="text-3xl font-extrabold flex items-center gap-2">
                {kpi.value}
                {kpi.pulse && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-live" />}
              </div>
              {kpi.trend && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${kpi.trend.startsWith('+') ? 'bg-blue-500/10 text-blue-500' : 'bg-emerald-500/10 text-emerald-500'}`}>{kpi.trend}</span>}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 p-8 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold">Sentiment Trend</h3>
              <p className="text-xs text-slate-500">Weekly customer satisfaction overview</p>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 rounded-md bg-slate-800 text-[10px] font-bold uppercase tracking-tighter">7D</button>
              <button className="px-3 py-1 rounded-md hover:bg-slate-800 text-[10px] font-bold uppercase tracking-tighter text-slate-500">30D</button>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sentimentData}>
                <defs>
                  <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 12}} dy={10} />
                <YAxis hide domain={[0, 1]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                  itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="sentiment" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorSent)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800">
          <h3 className="text-lg font-bold mb-1">Channel Volume</h3>
          <p className="text-xs text-slate-500 mb-8">Distribution of support requests</p>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={channelData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {channelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-3">
              {channelData.map((c, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: c.color}} />
                    <span className="text-sm font-medium text-slate-400">{c.name}</span>
                  </div>
                  <span className="text-sm font-bold">{c.value}</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Live Ticket Feed */}
      <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-bold">Live Support Feed</h3>
            <p className="text-xs text-slate-500">Autonomous ARIA interactions in real-time</p>
          </div>
          <button className="text-xs font-bold text-emerald-500 hover:text-emerald-400 flex items-center gap-1 transition-colors">
            View All Tickets <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <th className="pb-4 pl-0">Ticket ID</th>
                <th className="pb-4">Customer</th>
                <th className="pb-4">Channel</th>
                <th className="pb-4">Status</th>
                <th className="pb-4">Sentiment</th>
                <th className="pb-4 text-right">Activity</th>
                <th className="pb-4 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {mockTickets.map((ticket, i) => (
                <motion.tr 
                  key={ticket.id} 
                  className="group hover:bg-slate-800/30 transition-colors cursor-pointer"
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <td className="py-4 pl-0 font-mono text-xs font-bold text-slate-400">{ticket.id}</td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                       <User className="w-4 h-4 text-slate-600" />
                       <span className="text-sm font-semibold">{ticket.customer}</span>
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-950 border border-slate-800 w-fit">
                      {getChannelIcon(ticket.channel)}
                      <span className="text-[10px] uppercase font-bold text-slate-400">{ticket.channel.replace('_', ' ')}</span>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${getStatusColor(ticket.status)}`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="py-4 text-lg">
                    {getSentimentIcon(ticket.sentiment)}
                  </td>
                  <td className="py-4 text-right">
                    <span className="text-xs font-medium text-slate-500">{formatDistanceToNow(ticket.created_at)} ago</span>
                  </td>
                  <td className="py-4 text-right">
                    <button className="p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="w-4 h-4 text-slate-600" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CEO Briefing Preview */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-500/10 to-emerald-500/5 border border-indigo-500/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8">
                  <Star className="w-12 h-12 text-emerald-500/10 animate-pulse" />
              </div>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" /> Latest CEO Briefing
              </h2>
              <div className="prose prose-sm prose-invert max-w-none">
                  <p className="text-slate-400 italic">"Executive Summary: Revenue is up 12% this week driven by higher conversion on technical support tickets. ARIA has successfully handled 94% of inquiries without human intervention..."</p>
              </div>
              <div className="mt-8 flex gap-4">
                  <button className="px-5 py-2 rounded-xl bg-white text-slate-950 font-bold text-sm flex items-center gap-2 hover:bg-slate-100 transition-all">
                      Read Full <ExternalLink className="w-4 h-4" />
                  </button>
                  <button className="px-5 py-2 rounded-xl bg-slate-800/50 text-white font-bold text-sm flex items-center gap-2 hover:bg-slate-800 transition-all">
                      <Download className="w-4 h-4" /> PDF
                  </button>
              </div>
          </div>
          
          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800">
             <h2 className="text-xl font-bold mb-6">System Health</h2>
             <div className="space-y-6">
                {[
                  { name: 'Groq AI Engine', status: 'Optimal', latency: '640ms' },
                  { name: 'Neon DB (Postgres)', status: 'Connected', latency: '42ms' },
                  { name: 'Confluent Kafka', status: 'Streaming', latency: '12ms' },
                  { name: 'Twilio WhatsApp', status: 'Active', latency: '210ms' },
                ].map((s, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold">{s.name}</div>
                      <div className="text-[10px] text-slate-500">Latency: {s.latency}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-400">{s.status}</span>
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    </div>
                  </div>
                ))}
             </div>
          </div>
      </div>

      {/* Slide-over Ticket Panel */}
      <AnimatePresence>
        {selectedTicket && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTicket(null)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed top-0 right-0 h-screen w-full max-w-xl bg-slate-900 border-l border-slate-800 z-[60] p-10 shadow-3xl"
            >
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                     <span className="font-mono text-sm font-bold text-slate-500">{selectedTicket.id}</span>
                     <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusColor(selectedTicket.status)}`}>{selectedTicket.status}</span>
                  </div>
                  <button onClick={() => setSelectedTicket(null)} className="p-2 hover:bg-slate-800 rounded-lg">
                    <ChevronRight className="w-6 h-6 rotate-180" />
                  </button>
               </div>

               <h2 className="text-3xl font-extrabold mb-2">{selectedTicket.customer}</h2>
               <div className="flex items-center gap-4 mb-10 pb-10 border-b border-slate-800">
                  <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-800">
                    {getChannelIcon(selectedTicket.channel)}
                    <span className="text-[10px] font-bold uppercase">{selectedTicket.channel}</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-800">
                    <span className="text-lg">{getSentimentIcon(selectedTicket.sentiment)}</span>
                    <span className="text-[10px] font-bold uppercase">{selectedTicket.sentiment * 100}% Happy</span>
                  </div>
               </div>

               <div className="space-y-6 overflow-y-auto max-h-[60vh] pr-4 scrollbar-thin scrollbar-thumb-slate-700">
                  <div className="flex flex-col items-end">
                      <div className="bg-emerald-500 text-slate-950 p-4 rounded-2xl rounded-tr-none max-w-[80%] text-sm font-medium">
                          Hi, I'm having trouble with my account billing. It says I was charged twice this morning. Can you help?
                      </div>
                      <span className="text-[10px] text-slate-500 mt-2">10:14 AM</span>
                  </div>
                  <div className="flex flex-col items-start text-left">
                      <div className="bg-slate-800 border border-slate-700 p-4 rounded-2xl rounded-tl-none max-w-[80%] text-sm leading-relaxed">
                          Hello! I'm ARIA, and I'd be happy to look into this for you. I've located your account and I do see two pending transactions for today's date. One of these appears to be a pre-authorization hold. 
                          <br/><br/>
                          I've initiated a reconciliation process with our payment provider. These typically resolve within 3-5 business days. Should I open a formal investigation for you?
                      </div>
                      <span className="text-[10px] text-slate-500 mt-2">10:15 AM</span>
                  </div>
               </div>

               <div className="absolute bottom-10 left-10 right-10">
                  <button className="w-full py-4 rounded-2xl bg-indigo-500 text-white font-bold hover:bg-indigo-400 transition-all shadow-xl shadow-indigo-500/20">
                     Take Over Conversation
                  </button>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
