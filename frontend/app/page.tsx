'use client';

import { motion } from 'framer-motion';
import { Bot, Mail, MessageSquare, Globe, ArrowRight, TrendingUp, Shield, BarChart3, Clock, Zap } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function LandingPage() {
  const stats = [
    { num: '2.3s', label: 'Avg Response Time', sub: '↓ 0.4s vs last week', color: 'text-em' },
    { num: '99.9%', label: 'System Uptime', sub: '30-day rolling avg', color: 'text-ind' },
    { num: '3', label: 'Active Channels', sub: 'Email · WhatsApp · Web', color: 'text-amber' },
    { num: '24/7', label: 'Always On', sub: 'Zero downtime SLA', color: 'text-em' },
  ];

  const features = [
    { icon: '📧', title: 'Email Intelligence', desc: 'Monitors Gmail for unread priority messages, auto-replies with context-aware formal responses.', badge: 'Gmail API' },
    { icon: '💬', title: 'WhatsApp Support', desc: 'Twilio-powered WhatsApp webhook. Conversational, concise responses optimized for mobile.', badge: 'Twilio API' },
    { icon: '🌐', title: 'Web Form Intake', desc: 'Pydantic v2 validated multi-step support form. Instant ticket creation and tracking.', badge: 'FastAPI' },
    { icon: '📊', title: 'CEO Briefings', desc: 'Every Monday, ARIA generates an executive briefing with KPIs, wins, and recommendations.', badge: 'Auto-Generated' },
    { icon: '🧠', title: 'Sentiment Analysis', desc: 'Real-time tone monitoring. Auto-escalates to human agents when sentiment drops.', badge: 'Groq LLaMA' },
    { icon: '⚡', title: 'Auto-Escalation', desc: 'Legal mentions, refunds, security — ARIA instantly routes to human agents with a summary.', badge: 'Rule Engine' },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="pt-24 pb-20">
        {/* HERO */}
        <div className="relative overflow-hidden pt-12">
          <div className="absolute top-0 right-0 w-[80%] h-[60%] bg-radial-gradient-aria opacity-10 pointer-events-none" 
               style={{ background: 'radial-gradient(ellipse 80% 60% at 60% -10%, rgba(16,185,129,0.15) 0%, transparent 60%)' }} />
          
          <div className="container mx-auto px-12 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center max-w-[1200px]">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 bg-em/10 border border-em/20 px-3.5 py-1.5 rounded-full mb-6 font-body font-semibold text-[12px] text-em tracking-wider uppercase">
                <span className="pulse-dot w-1.5 h-1.5" />
                Live Production System
              </div>
              <h1 className="font-head text-6xl md:text-7xl font-extrabold leading-[1.05] tracking-tight mb-6">
                Your 24/7 <span className="text-em italic font-black">AI Customer</span> Success Employee
              </h1>
              <p className="font-body text-text2 text-lg leading-relaxed mb-10 max-w-[480px]">
                ARIA handles every support ticket across Email, WhatsApp, and Web — autonomously, instantly, flawlessly. Powered by Groq LLaMA 3.3.
              </p>
              <div className="flex gap-3">
                <Link href="/support">
                  <button className="bg-em hover:bg-em2 text-bg px-8 py-3.5 rounded-xl font-body font-bold text-sm flex items-center gap-2 transition-all hover:-translate-y-1 shadow-em-glow">
                    Submit a Ticket <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
                <Link href="/dashboard">
                  <button className="bg-transparent hover:bg-card text-text2 hover:text-text border border-border2 px-8 py-3.5 rounded-xl font-body font-bold text-sm transition-all hover:border-text2">
                    View Dashboard
                  </button>
                </Link>
              </div>
            </motion.div>

            {/* TERMINAL HERO */}
            <motion.div 
              style={{ perspective: '1000px' }}
              initial={{ opacity: 0, rotateY: 5 }}
              animate={{ opacity: 1, rotateY: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-2xl">
                <div className="bg-card px-4 py-3 flex items-center justify-between border-b border-border">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber" />
                    <div className="w-2.5 h-2.5 rounded-full bg-em" />
                  </div>
                  <div className="font-mono text-[11px] text-text3 tracking-wider">aria-agent · live</div>
                  <div className="w-10" />
                </div>
                <div className="p-5 font-mono text-[12px] leading-relaxed space-y-1">
                  <div className="flex gap-2">
                    <span className="text-em">▶</span>
                    <span className="text-text">aria.process_ticket(channel="whatsapp")</span>
                  </div>
                  <div className="text-text3 ml-4">[+] Customer identified: usr_a9f2c1</div>
                  <div className="text-text3 ml-4">[+] History loaded: 3 interactions</div>
                  <div className="text-text3 ml-4">[+] KB search: "password reset" → 1 match</div>
                  <div className="text-em ml-4">[✓] Ticket #TKT-8842 created</div>
                  <div className="text-em ml-4">[✓] Response sent via WhatsApp (1.8s)</div>
                  <div className="text-text3 ml-4">[~] Sentiment: 0.82 (positive)</div>
                  <div className="flex gap-2 mt-2">
                    <span className="text-em">▶</span>
                    <span className="text-text">aria.metrics()</span>
                  </div>
                  <div className="text-amber ml-4">Uptime: 99.97% | Today: 247</div>
                  <div className="text-text3 ml-4">Escalations: 12 (4.9%) | Avg: 2.3s</div>
                  <div className="flex gap-2">
                    <span className="text-em">▶</span>
                    <span className="w-2 h-3.5 bg-em animate-blink" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* STATS */}
        <section className="container mx-auto px-12 pt-20 max-w-[1200px]">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-surface border border-border p-6 rounded-2xl group hover:border-border2 transition-colors relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
                <div className={`font-head text-3xl font-extrabold mb-1.5 ${stat.color}`}>{stat.num}</div>
                <div className="text-[12px] text-text3 font-semibold uppercase tracking-wider mb-1">{stat.label}</div>
                <div className="text-[11px] text-em font-bold">{stat.sub}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CHANNEL STRIP */}
        <section className="container mx-auto px-12 py-20 max-w-[1200px]">
          <div className="bg-surface border border-border rounded-2xl p-7 flex items-center justify-between flex-wrap gap-8">
            <div className="flex gap-8 flex-wrap">
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-em shadow-[0_0_8px_var(--tw-shadow-color)] shadow-em" />
                <div>
                  <div className="text-[13px] font-bold">📧 Gmail</div>
                  <div className="text-[11px] text-text3 font-medium tracking-tight">47 tickets today</div>
                </div>
              </div>
              <div className="w-px h-7 bg-border hidden md:block" />
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-ind shadow-[0_0_8px_var(--tw-shadow-color)] shadow-ind" />
                <div>
                  <div className="text-[13px] font-bold">💬 WhatsApp</div>
                  <div className="text-[11px] text-text3 font-medium tracking-tight">128 tickets today</div>
                </div>
              </div>
              <div className="w-px h-7 bg-border hidden md:block" />
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-amber shadow-[0_0_8px_var(--tw-shadow-color)] shadow-amber" />
                <div>
                  <div className="text-[13px] font-bold">🌐 Web Portal</div>
                  <div className="text-[11px] text-text3 font-medium tracking-tight">72 tickets today</div>
                </div>
              </div>
            </div>
            <div className="font-mono text-[11px] text-text3 tracking-tight ml-auto">
              Kafka: Confluent · DB: Neon · AI: Groq llama-3.3-70b
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="container mx-auto px-12 max-w-[1200px] mb-20">
          <div className="text-em text-[11px] font-bold uppercase tracking-[0.2em] mb-3">Capabilities</div>
          <h2 className="font-head text-4xl font-extrabold text-text mb-12 tracking-tight">Built for Enterprise scale</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="bg-surface border border-border p-8 rounded-3xl group hover:border-border2 hover:-translate-y-1 transition-all"
              >
                <div className="w-11 h-11 bg-card rounded-xl flex items-center justify-center text-xl mb-6">{f.icon}</div>
                <h3 className="font-head text-lg font-bold mb-2.5">{f.title}</h3>
                <p className="text-text2 text-[13px] leading-relaxed mb-4">{f.desc}</p>
                <span className="inline-block px-2.5 py-1 rounded-md bg-card border border-border text-text3 font-mono text-[10px] uppercase font-bold tracking-wider">{f.badge}</span>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-border bg-card/30 py-12">
        <div className="container mx-auto px-12 max-w-[1200px] flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <div className="flex items-center gap-2 font-head text-lg font-extrabold mb-1">
              <Bot className="w-5 h-5 text-em" /> ARIA<span className="text-em">FTE</span>
            </div>
            <p className="text-text3 text-[11px] font-medium tracking-wide">© 2026 HassaanFisky · All systems operational.</p>
          </div>
          <div className="flex gap-8 text-[13px] font-semibold text-text2 underline-offset-4 decoration-em/30">
            <Link href="#" className="hover:text-em hover:underline transition-all">Documentation</Link>
            <Link href="#" className="hover:text-em hover:underline transition-all">Privacy</Link>
            <Link href="#" className="hover:text-em hover:underline transition-all">API Status</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

