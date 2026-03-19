'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Mail, MessageSquare, AlertCircle, ChevronRight, CheckCircle2, Globe, Clock, BotIcon, ArrowLeft, Loader2, Sparkles, User, Info, Terminal, Target } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';

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

const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error('Ticket not found');
  return res.json();
});

export default function TicketStatusPage() {
  const { id } = useParams();
  const router = useRouter();

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const { data: ticket, error, isLoading } = useSWR<Ticket>(
    id ? `${apiUrl}/api/v1/tickets/${id}` : null,
    fetcher,
    { 
      refreshInterval: (data) => (data?.status === 'resolved' || data?.status === 'escalated' ? 0 : 15000)
    }
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-bg text-text selection:bg-em/20">
        <Loader2 className="w-12 h-12 text-em animate-spin mb-4" />
        <span className="text-sm font-bold text-text3 uppercase tracking-widest">Warping to ARIA Core...</span>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-bg text-text selection:bg-em/20 p-6">
        <div className="p-10 rounded-3xl bg-red/5 border border-red/20 text-center max-w-md w-full relative">
            <div className="absolute top-0 right-0 w-[140px] h-[140px] bg-red opacity-[0.05] rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
            <AlertCircle className="w-12 h-12 text-red mx-auto mb-4" />
            <h1 className="text-2xl font-head font-extrabold mb-2 text-text">Access Error</h1>
            <p className="text-text2 text-[13px] mb-8 leading-relaxed">We couldn't locate ticket <span className="font-mono font-bold text-red bg-red/10 px-1 py-0.5 rounded">{id}</span>. Please verify the ID.</p>
            <Link href="/support">
                <button className="w-full sm:w-auto px-6 py-3 rounded-xl bg-surface border border-border text-text font-bold text-sm hover:bg-card hover:border-border2 transition-all">Back to Support</button>
            </Link>
        </div>
      </div>
    );
  }

  const currentStepIndex = ticket.status === 'resolved' ? 3 : (ticket.status === 'processing' ? 1 : 0);

  return (
    <div className="min-h-screen bg-bg text-text selection:bg-em/20 overflow-x-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-[-10%] w-[40%] h-[40%] bg-em/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-0 left-[-10%] w-[40%] h-[40%] bg-ind/10 blur-[120px] rounded-full" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-10 border-b border-border bg-bg/80 backdrop-blur-md">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2" onClick={() => router.push('/')} style={{ cursor: 'pointer' }}>
            <div className="w-2.5 h-2.5 rounded-full bg-em animate-pulse-live shadow-[0_0_8px_#10B981] opacity-90" />
            <span className="font-head text-xl font-extrabold tracking-tight">ARIA<span className="text-em">FTE</span></span>
          </div>
          <Link href="/support">
            <button className="flex items-center gap-2 text-sm font-bold text-text3 hover:text-text transition-colors">
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
                    className="p-8 rounded-3xl bg-surface border border-border mt-0"
                >
                    <div className="flex items-center gap-2 text-[10px] font-bold text-text3 uppercase tracking-[0.2em] mb-4">
                        <Terminal className="w-3 h-3" /> System Ident
                    </div>
                    <div className="text-3xl font-mono font-extrabold text-em mb-6 truncate">{ticket.id.split('-').pop()}</div>
                    
                    <div className="space-y-4">
                        <div className="pb-4 border-b border-border">
                            <span className="text-[10px] font-bold text-text3 block mb-1">SUBJECT</span>
                            <div className="text-[13px] font-medium leading-relaxed">{ticket.subject}</div>
                        </div>
                        <div className="flex justify-between pb-4 border-b border-border">
                            <div>
                                <span className="text-[10px] font-bold text-text3 block mb-1 uppercase tracking-tighter">Category</span>
                                <div className="text-[11px] font-bold text-em capitalize">{ticket.category}</div>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] font-bold text-text3 block mb-1 uppercase tracking-tighter">Priority</span>
                                <div className={`text-[11px] font-bold ${ticket.priority === 'high' || ticket.priority === 'critical' ? 'text-red' : 'text-text2'}`}>{ticket.priority.toUpperCase()}</div>
                            </div>
                        </div>
                        <div>
                            <span className="text-[10px] font-bold text-text3 block mb-1">ORIGIN</span>
                            <div className="flex items-center gap-2">
                                <Globe className="w-3.5 h-3.5 text-text3" />
                                <span className="text-[12px] font-medium text-text2">Web Portal Gateway</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-8 rounded-3xl bg-ind/5 border border-ind/20"
                >
                    <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
                        <Info className="w-4 h-4 text-ind" /> ARIA Protocol
                    </h3>
                    <p className="text-[12px] text-text3 leading-relaxed mb-6 italic">
                        "I am currently processing your request. I've analyzed your intent and am cross-referencing our knowledge base for the most accurate resolution."
                    </p>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-ind/20 flex items-center justify-center">
                            <Bot className="w-4 h-4 text-ind" />
                        </div>
                        <span className="text-[10px] font-bold tracking-[0.2em] text-ind opacity-80">ARIA CORE ONLINE</span>
                    </div>
                </motion.div>
            </div>

            {/* Right Side: Timeline and Chat */}
            <div className="lg:col-span-2 space-y-8">
                {/* Visual Progress Tracker */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-surface border border-border rounded-[28px]"
                >
                    <div className="flex items-center justify-between px-4 pt-4 pb-8 border-b border-border mb-8">
                        <div>
                            <h3 className="font-head text-lg font-bold">Autonomous Progress</h3>
                            <p className="text-[10px] text-text3 uppercase tracking-[0.2em] font-bold mt-1">Current Status: {ticket.status}</p>
                        </div>
                        <div className="px-3 py-1 bg-em/10 border border-em/20 rounded-lg text-[10px] font-bold text-em animate-pulse">LIVE MONITOR</div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-6 relative mb-4">
                        {statusSteps.map((s, i) => (
                           <div key={s.id} className="flex-1 flex flex-col items-center gap-3 relative z-10 w-full md:w-auto">
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${i <= currentStepIndex ? 'bg-em text-bg scale-110 shadow-em-glow' : 'bg-card border border-border text-text3'}`}>
                                 {i < currentStepIndex ? <CheckCircle2 className="w-6 h-6" /> : s.icon}
                              </div>
                              <span className={`text-[10px] font-bold uppercase tracking-widest ${i <= currentStepIndex ? 'text-text' : 'text-text3'}`}>{s.label}</span>
                              
                              {/* Horizontal connector line for desktop */}
                              {i < statusSteps.length - 1 && (
                                <div className="hidden md:block absolute left-[calc(50%+2rem)] right-[calc(-50%+2rem)] top-6 h-[2px] bg-border -z-0">
                                    <div 
                                        className="h-full bg-em transition-all duration-1000" 
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
                    <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-text3 px-2">Interaction Flow</h3>
                    
                    <div className="space-y-6 relative">
                         {/* Vertical line connecting messages */}
                         <div className="absolute left-6 top-10 bottom-10 w-0.5 bg-border/50 -z-0 hidden md:block" />

                         <AnimatePresence>
                            {ticket.messages.map((msg, i) => (
                                <motion.div 
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className={`flex items-start gap-4 md:gap-8 group`}
                                >
                                    <div className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center z-10 ${msg.role === 'customer' ? 'bg-ind/10 border border-ind/20' : 'bg-em/10 border border-em/20'}`}>
                                        {msg.role === 'customer' ? <User className="w-6 h-6 text-ind" /> : <BotIcon className="w-6 h-6 text-em" />}
                                    </div>
                                    <div className={`flex-1 p-6 md:p-8 rounded-[28px] border transition-all ${msg.role === 'customer' ? 'bg-surface border-border' : 'bg-card border-em/30 shadow-em-glow'}`}>
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-[10px] font-bold text-text3 uppercase tracking-widest">{msg.role === 'customer' ? 'Customer Message' : 'Aria Response'}</span>
                                            <span className="text-[10px] font-medium text-text3 flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(msg.created_at).toLocaleTimeString()}</span>
                                        </div>
                                        <div className="text-[13px] md:text-sm leading-relaxed text-text2 font-body">
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
                                    <div className="w-12 h-12 shrink-0 rounded-2xl bg-em/10 border border-em/20 flex items-center justify-center z-10">
                                        <BotIcon className="w-6 h-6 text-em/50 animate-pulse" />
                                    </div>
                                    <div className="flex-1 p-8 rounded-[28px] border border-border bg-surface">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-em animate-bounce [animation-delay:-0.3s]" />
                                            <div className="w-1.5 h-1.5 rounded-full bg-em animate-bounce [animation-delay:-0.15s]" />
                                            <div className="w-1.5 h-1.5 rounded-full bg-em animate-bounce" />
                                            <span className="text-[10px] font-bold text-text3 uppercase tracking-[0.2em] ml-4">Aria is thinking...</span>
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
                        className="p-8 rounded-3xl bg-em/10 border border-em/20 text-center"
                    >
                        <h3 className="font-head text-xl font-bold mb-2 text-text">Issue Resolved!</h3>
                        <p className="text-[13px] text-text2 mb-6 font-medium">ARIA successfully processed your technical request. How was the experience?</p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button className="w-full sm:w-auto px-10 py-3 rounded-xl bg-em hover:bg-em2 text-bg font-bold text-sm transition-all shadow-em-glow">Excellent</button>
                            <button className="w-full sm:w-auto px-10 py-3 rounded-xl bg-surface border border-border text-text font-bold text-sm hover:border-border2 transition-all">Report Issue</button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
      </main>

      {/* Quick Access Footer */}
      <footer className="py-12 px-6 border-t border-border bg-bg relative z-10">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <Bot className="w-6 h-6 text-em" />
              <span className="font-head font-bold text-lg tracking-tight">ARIA</span>
            </div>
            <p className="text-[12px] text-text3">Enterprise AI Infrastructure — Modern Response Engine</p>
          </div>
          <div className="flex gap-8 text-[12px] font-medium text-text3">
             <Link href="/" className="hover:text-em transition-colors">Home</Link>
             <Link href="/dashboard" className="hover:text-em transition-colors">Dashboard</Link>
             <span>© 2026 HassaanFisky</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
