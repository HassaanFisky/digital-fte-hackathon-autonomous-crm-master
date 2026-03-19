'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Bot, Mail, MessageSquare, Globe, ArrowRight, Zap, Shield, BarChart3, Clock, Rocket, AtSign, Phone } from 'lucide-react';

const stats = [
  { label: 'Response Time', value: '< 3s', icon: <Clock className="w-5 h-5 text-emerald-500" /> },
  { label: 'Platform Uptime', value: '99.9%', icon: <Zap className="w-5 h-5 text-indigo-500" /> },
  { label: 'Live Channels', value: '3', icon: <Shield className="w-5 h-5 text-emerald-500" /> },
  { label: 'Support Status', value: '24/7', icon: <Rocket className="w-5 h-5 text-indigo-500" /> },
];

const features = [
  { title: 'Email Intelligence', description: 'Deep analysis of incoming emails with professional, multi-paragraph responses.', icon: <AtSign className="w-8 h-8 text-emerald-500" /> },
  { title: 'WhatsApp Support', description: 'Conversational, concise, and friendly messaging via Twilio integration.', icon: <Phone className="w-8 h-8 text-emerald-500" /> },
  { title: 'Web Form', description: 'Custom-built multi-step support form for structured inquiries.', icon: <Globe className="w-8 h-8 text-indigo-500" /> },
  { title: 'CEO Briefings', description: 'Automated executive summaries delivered every Monday to your nerve center.', icon: <BarChart3 className="w-8 h-8 text-indigo-500" /> },
  { title: 'Sentiment Analysis', description: 'Real-time tone monitoring ensures critical issues get priority attention.', icon: <Zap className="w-8 h-8 text-amber-500" /> },
  { title: 'Auto-Escalation', description: 'Smart triggers automatically flag sensitive or complex issues for human review.', icon: <Bot className="w-8 h-8 text-amber-500" /> },
];

const stack = ['Groq LLaMA', 'Neon PostgreSQL', 'Confluent Kafka', 'Twilio', 'Next.js'];

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-md">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-8 h-8 text-emerald-500" />
            <span className="font-bold text-xl tracking-tight">ARIA</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Features</Link>
            <Link href="/dashboard" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Dashboard</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/support">
              <button className="px-5 py-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-500 text-sm font-semibold hover:bg-emerald-500/20 transition-all">Support Form</button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Your 24/7 AI <br className="hidden md:block" />
              Customer Success Employee
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 text-balance">
              ARIA handles every support ticket across Email, WhatsApp, and Web — autonomously, instantly, flawlessly.
            </p>
          </motion.div>

          <motion.div 
            className="flex flex-col md:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Link href="/support">
              <button className="w-full md:w-auto px-8 py-4 rounded-xl bg-emerald-500 text-slate-950 font-bold flex items-center justify-center gap-2 hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20">
                Submit a Ticket <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <Link href="/dashboard">
              <button className="w-full md:w-auto px-8 py-4 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-700 transition-all">
                View Dashboard
              </button>
            </Link>
          </motion.div>

          {/* Stats Bar */}
          <motion.div 
            className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-20 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            {stats.map((stat, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center gap-3">
                {stat.icon}
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Channels Section */}
      <section id="features" className="py-20 px-6 bg-slate-900/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Unified Channel Intelligence</h2>
            <p className="text-slate-400 max-w-xl mx-auto">Consistent, context-aware support no matter how your customers reach out.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                className="p-8 rounded-3xl bg-slate-800/50 border border-slate-700 hover:border-emerald-500/50 transition-all group"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
              >
                <div className="mb-6 p-4 rounded-2xl bg-slate-900 inline-block group-hover:bg-slate-950 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Channel Indicators */}
      <section className="py-12 border-y border-white/5">
        <div className="container mx-auto px-6 flex flex-wrap items-center justify-center gap-12">
          {['Gmail', 'WhatsApp', 'Web Portal'].map((channel, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-live" />
              <span className="text-sm font-bold tracking-widest uppercase text-slate-500">{channel} LIVE</span>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center">
            <div className="text-xs font-bold text-slate-600 uppercase tracking-[0.2em] mb-8">Built with Enterprise Infrastructure</div>
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8">
                {stack.map((item, i) => (
                    <span key={i} className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-slate-400">{item}</span>
                ))}
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-12 px-6 border-t border-white/5 bg-slate-950">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <Bot className="w-6 h-6 text-emerald-500" />
              <span className="font-bold text-lg tracking-tight">ARIA</span>
            </div>
            <p className="text-xs text-slate-600">Built for GIAIC Hackathon 5 — Modern CRM Architecture 2026</p>
          </div>
          <div className="flex gap-8 text-sm font-medium text-slate-500">
             <Link href="https://github.com/HassaanFisky/digital-fte-hackathon-autonomous-crm-master" className="hover:text-emerald-500 transition-colors">GitHub</Link>
             <span>© 2026 HassaanFisky</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
