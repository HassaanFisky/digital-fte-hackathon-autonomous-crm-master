'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Mail, MessageSquare, AlertCircle, ChevronRight, CheckCircle2, Globe, Clock, BotIcon, ArrowLeft, Loader2, Sparkles, User, Info, Terminal, Target } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface Message {
  role: 'customer' | 'agent';
  content: string;
  created_at: string;
}

interface Ticket {
  id: string;
  subject: string;
  status: 'open' | 'processing' | 'resolved' | 'escalated';
  category: string;
  priority: string;
  created_at: string;
  messages: Message[];
}

const statusSteps = [
  { id: 'open', label: 'Ticket Received', icon: <Mail className="w-5 h-5" /> },
  { id: 'processing', label: 'ARIA Analysis', icon: <Target className="w-5 h-5" />, active: true },
  { id: 'responding', label: 'Knowledge Lookup', icon: <Sparkles className="w-5 h-5" /> },
  { id: 'resolved', label: 'Resolved', icon: <CheckCircle2 className="w-5 h-5" /> },
];

export default function TicketStatusPage() {
  const { id } = useParams();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const router = useRouter();

  const fetchStatus = async () => {
    try {
      const response = await fetch(`/api/support/status/${id}`);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setTicket(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000); // Poll every 3 seconds
    return () => clearInterval(interval);
  }, [id]);

  if (loading && !ticket) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950">
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-4" />
        <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Warping to ARIA Core...</span>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 p-6">
        <div className="p-10 rounded-3xl bg-red-500/5 border border-red-500/20 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Access Error</h1>
            <p className="text-slate-500 mb-8">We couldn't locate ticket <span className="font-mono text-red-500">{id}</span>. Please verify the ID.</p>
            <Link href="/support">
                <button className="px-6 py-3 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-700 transition-all">Back to Support</button>
            </Link>
        </div>
      </div>
    );
  }

  const currentStepIndex = ticket.status === 'resolved' ? 3 : (ticket.status === 'processing' ? 1 : 0);

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-emerald-500Selection overflow-x-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-0 left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-10 border-b border-white/5 bg-slate-950/80 backdrop-blur-md">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2" onClick={() => router.push('/')} style={{ cursor: 'pointer' }}>
            <Bot className="w-8 h-8 text-emerald-500" />
            <span className="font-bold text-xl tracking-tight">ARIA</span>
          </div>
          <Link href="/support">
            <button className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-white transition-colors">
                <ArrowLeft className="w-4 h-4" /> New Ticket
            </button>
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-6 pt-32 pb-24 relative z-0 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Sidebar: Detailed Info */}
            <div className="lg:col-span-1 space-y-6">
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-8 rounded-3xl bg-slate-900 border border-white/5 shadow-2xl"
                >
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
                        <Terminal className="w-3 h-3" /> System Ident
                    </div>
                    <div className="text-3xl font-mono font-extrabold text-emerald-500 mb-6 truncate">{ticket.id.split('-').pop()}</div>
                    
                    <div className="space-y-4">
                        <div className="pb-4 border-b border-white/5">
                            <span className="text-[10px] font-bold text-slate-600 block mb-1">SUBJECT</span>
                            <div className="text-sm font-medium leading-relaxed">{ticket.subject}</div>
                        </div>
                        <div className="flex justify-between pb-4 border-b border-white/5">
                            <div>
                                <span className="text-[10px] font-bold text-slate-600 block mb-1 uppercase tracking-tighter">Category</span>
                                <div className="text-xs font-bold text-emerald-400 capitalize">{ticket.category}</div>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] font-bold text-slate-600 block mb-1 uppercase tracking-tighter">Priority</span>
                                <div className={`text-xs font-bold ${ticket.priority === 'high' || ticket.priority === 'critical' ? 'text-rose-500' : 'text-slate-400'}`}>{ticket.priority.toUpperCase()}</div>
                            </div>
                        </div>
                        <div>
                            <span className="text-[10px] font-bold text-slate-600 block mb-1">ORIGIN</span>
                            <div className="flex items-center gap-2">
                                <Globe className="w-3.5 h-3.5 text-slate-500" />
                                <span className="text-xs font-medium text-slate-400">Web Portal Gateway</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-8 rounded-3xl bg-indigo-500/5 border border-indigo-500/10"
                >
                    <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
                        <Info className="w-4 h-4 text-indigo-400" /> ARIA Protocol
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed mb-6 italic">
                        "I am currently processing your request. I've analyzed your intent and am cross-referencing our knowledge base for the most accurate resolution."
                    </p>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                            <Bot className="w-4 h-4 text-indigo-400" />
                        </div>
                        <span className="text-[10px] font-bold tracking-widest text-indigo-300">ARIA CORE ONLINE</span>
                    </div>
                </motion.div>
            </div>

            {/* Right Side: Timeline and Chat */}
            <div className="lg:col-span-2 space-y-8">
                {/* Visual Progress Tracker */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-slate-900 border border-white/5 rounded-3xl shadow-xl"
                >
                    <div className="flex items-center justify-between px-4 pt-4 pb-8 border-b border-white/5 mb-8">
                        <div>
                            <h3 className="text-lg font-bold">Autonomous Progress</h3>
                            <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mt-1 tracking-tighter">Current Status: {ticket.status}</p>
                        </div>
                        <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-bold text-emerald-500 animate-pulse">LIVE MONITOR</div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-6 relative">
                        {statusSteps.map((s, i) => (
                           <div key={s.id} className="flex-1 flex flex-col items-center gap-3 relative z-10 w-full md:w-auto">
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${i <= currentStepIndex ? 'bg-emerald-500 text-slate-950 scale-110 shadow-lg shadow-emerald-500/20' : 'bg-slate-800 text-slate-600'}`}>
                                 {i < currentStepIndex ? <CheckCircle2 className="w-6 h-6" /> : s.icon}
                              </div>
                              <span className={`text-[10px] font-bold uppercase tracking-widest ${i <= currentStepIndex ? 'text-white' : 'text-slate-600'}`}>{s.label}</span>
                              
                              {/* Horizontal connector line for desktop */}
                              {i < statusSteps.length - 1 && (
                                <div className="hidden md:block absolute left-[calc(50%+2rem)] right-[calc(-50%+2rem)] top-6 h-0.5 bg-slate-800 -z-0">
                                    <div 
                                        className="h-full bg-emerald-500 transition-all duration-1000" 
                                        style={{ width: i < currentStepIndex ? '100%' : '0%' }}
                                    />
                                </div>
                              )}
                           </div>
                        ))}
                    </div>
                </motion.div>

                {/* Interaction Flow */}
                <div className="space-y-6">
                    <h3 className="text-sm font-bold tracking-widest uppercase text-slate-600 px-2">Interaction Flow</h3>
                    
                    <div className="space-y-6 relative">
                         {/* Vertical line connecting messages */}
                         <div className="absolute left-6 top-10 bottom-10 w-0.5 bg-white/5 -z-0 hidden md:block" />

                         <AnimatePresence>
                            {ticket.messages.map((msg, i) => (
                                <motion.div 
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className={`flex items-start gap-4 md:gap-8 group ${msg.role === 'customer' ? 'flex-row' : 'flex-row'}`}
                                >
                                    <div className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center z-10 ${msg.role === 'customer' ? 'bg-indigo-500/20 border border-indigo-500/30' : 'bg-emerald-500/20 border border-emerald-500/30'}`}>
                                        {msg.role === 'customer' ? <User className="w-6 h-6 text-indigo-400" /> : <BotIcon className="w-6 h-6 text-emerald-400" />}
                                    </div>
                                    <div className={`flex-1 p-6 md:p-8 rounded-3xl border transition-all ${msg.role === 'customer' ? 'bg-slate-900 border-white/5' : 'bg-gradient-to-br from-slate-900 to-emerald-950/20 border-emerald-500/20 shadow-xl shadow-emerald-500/5'}`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{msg.role === 'customer' ? 'Customer Message' : 'Aria Response'}</span>
                                            <span className="text-[10px] font-medium text-slate-600 flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(msg.created_at).toLocaleTimeString()}</span>
                                        </div>
                                        <div className="text-sm md:text-base leading-relaxed text-slate-200">
                                            {msg.content}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}

                            {ticket.status !== 'resolved' && (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex items-start gap-4 md:gap-8"
                                >
                                    <div className="w-12 h-12 shrink-0 rounded-2xl bg-emerald-500/10 border border-emerald-500/10 flex items-center justify-center z-10 animate-pulse">
                                        <BotIcon className="w-6 h-6 text-emerald-400/50" />
                                    </div>
                                    <div className="flex-1 p-8 rounded-3xl border border-white/5 bg-slate-900/50">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.3s]" />
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.15s]" />
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" />
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-4">Aria is thinking...</span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                         </AnimatePresence>
                    </div>
                </div>

                {/* Quick Actions */}
                {ticket.status === 'resolved' && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-8 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-center"
                    >
                        <h3 className="text-xl font-bold mb-2">Issue Resolved!</h3>
                        <p className="text-sm text-slate-400 mb-6">ARIA successfully processed your technical request. How was the experience?</p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button className="w-full sm:w-auto px-10 py-3 rounded-xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 transition-all">Excellent</button>
                            <button className="w-full sm:w-auto px-10 py-3 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-700 transition-all">Report Issue</button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
      </main>

      {/* Quick Access Footer */}
      <footer className="py-12 px-6 border-t border-white/5 bg-slate-950 relative z-10">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <Bot className="w-6 h-6 text-emerald-500" />
              <span className="font-bold text-lg tracking-tight">ARIA</span>
            </div>
            <p className="text-xs text-slate-600">Enterprise AI Infrastructure — Modern Response Engine</p>
          </div>
          <div className="flex gap-8 text-sm font-medium text-slate-500">
             <Link href="/" className="hover:text-emerald-500 transition-colors">Home</Link>
             <Link href="/dashboard" className="hover:text-emerald-500 transition-colors">Dashboard</Link>
             <span>© 2026 HassaanFisky</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
