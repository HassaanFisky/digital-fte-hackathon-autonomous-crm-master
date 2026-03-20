"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, MessageSquare, Globe, TrendingUp, ShieldAlert, Cpu } from "lucide-react";

const FeatureCard = ({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="p-6 bg-slate-800 border border-slate-700 rounded-2xl hover:border-emerald-500/50 transition-colors"
  >
    <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4">
      <Icon className="text-emerald-500 w-6 h-6" />
    </div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-text-muted">{desc}</p>
  </motion.div>
);

const StatItem = ({ label, value }: { label: string, value: string }) => (
  <div className="flex flex-col items-center">
    <span className="text-emerald-500 text-2xl font-bold">{value}</span>
    <span className="text-text-muted text-xs uppercase tracking-widest">{label}</span>
  </div>
);

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 w-full max-w-7xl mx-auto flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 inline-flex items-center px-4 py-1.5 rounded-full border border-slate-700 bg-slate-800/50 text-emerald-500 text-sm font-medium backdrop-blur-sm"
        >
          <span className="relative flex h-2 w-2 mr-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          ARIA 2.0 is now live
        </motion.div>
        
        <motion.h1 
          className="text-5xl md:text-7xl font-extrabold max-w-4xl text-balance tracking-tight mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Your 24/7 AI <span className="animate-gradient font-black">Customer Success</span> Employee
        </motion.h1>
        
        <motion.p 
          className="text-xl text-text-muted max-w-2xl mb-12 text-balance leading-relaxed"
          initial={{ opacity: 0, y: 30 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          animate={{ opacity: 1, y: 0 }}
        >
          ARIA handles every support ticket across Email, WhatsApp, and Web — autonomously, instantly, flawlessly.
        </motion.p>
        
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 mb-20 w-fit"
          initial={{ opacity: 0, y: 30 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link href="/support" className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl transition-all hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center group">
            Submit a Ticket 
            <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
          </Link>
          <Link href="/dashboard" className="px-8 py-4 border border-slate-700 hover:bg-slate-800 text-text-primary font-bold rounded-xl transition-all">
            View Dashboard →
          </Link>
        </motion.div>

        {/* Stats Bar */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-20 p-8 border border-white/5 bg-white/5 backdrop-blur-md rounded-3xl w-fit"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <StatItem label="Response Time" value="< 3s" />
          <StatItem label="Uptime" value="99.9%" />
          <StatItem label="Channels" value="3" />
          <StatItem label="Status" value="Live" />
        </motion.div>
      </section>

      {/* Feature Grid */}
      <section className="w-full max-w-7xl mx-auto px-4 py-24">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-4">Enterprise-Ready Intelligence</h2>
          <p className="text-text-muted max-w-xl mx-auto">Scalable infrastructure designed for modern support teams.</p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard 
            icon={Mail} 
            title="Email Intelligence" 
            desc="Automated Gmail monitoring and formal responses with smart threading."
          />
          <FeatureCard 
            icon={MessageSquare} 
            title="WhatsApp Support" 
            desc="Real-time Twilio integration for casual, instant customer messaging."
          />
          <FeatureCard 
            icon={Globe} 
            title="Web Form" 
            desc="Structured ticket ingestion with dynamic priority and category logic."
          />
          <FeatureCard 
            icon={TrendingUp} 
            title="CEO Briefings" 
            desc="Autonomous weekly reports for leadership with key KPIs and insights."
          />
          <FeatureCard 
            icon={ShieldAlert} 
            title="Auto-Escalation" 
            desc="Smart triggers detect legal threats or high frustration for human intervention."
          />
          <FeatureCard 
            icon={Cpu} 
            title="Sentiment Analysis" 
            desc="Deep emotional context tracking for every single customer interaction."
          />
        </div>
      </section>

      {/* Tech Stack Bar */}
      <section className="w-full bg-slate-900/50 py-12 border-y border-slate-800 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
           <span className="text-xl font-bold tracking-tighter">Groq LLaMA</span>
           <span className="text-xl font-bold tracking-tighter">Neon PostgreSQL</span>
           <span className="text-xl font-bold tracking-tighter">Confluent Kafka</span>
           <span className="text-xl font-bold tracking-tighter">Twilio</span>
           <span className="text-xl font-bold tracking-tighter">Next.js 14</span>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-4 py-20 border-t border-slate-800 text-center">
        <p className="text-text-muted mb-4">Built for GIAIC Hackathon 5 by Hassaan</p>
        <Link href="https://github.com/HassaanFisky/digital-fte-hackathon-autonomous-crm-master" className="text-emerald-500 hover:underline">
          View Repository on GitHub
        </Link>
      </footer>
    </main>
  );
}
