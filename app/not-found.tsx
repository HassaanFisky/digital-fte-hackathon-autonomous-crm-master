'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Bot, Home, MessageSquare, ArrowLeft, Search, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 p-6 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-indigo-500/10 blur-[150px] rounded-full -z-0" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="text-center relative z-10 max-w-lg"
      >
        <div className="w-24 h-24 rounded-3xl bg-slate-900 border border-white/5 flex items-center justify-center mx-auto mb-10 shadow-2xl">
          <motion.div
            animate={{ 
                rotate: [0, 10, -10, 0],
                y: [0, -5, 5, 0]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Bot className="w-12 h-12 text-emerald-500" />
          </motion.div>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[10px] font-bold uppercase tracking-widest mb-6">
          <AlertTriangle className="w-3 h-3" /> Error 404: Path Obscured
        </div>
        
        <h1 className="text-4xl font-extrabold mb-4 tracking-tight">I couldn't find that page...</h1>
        <p className="text-slate-400 mb-12 leading-relaxed text-balance">
          ARIA searched the entire SaaS infrastructure but this route is not documented. Let me guide you back to a known coordinate.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/" className="w-full">
                <Button variant="secondary" className="w-full h-14" leftIcon={<Home className="w-4 h-4" />}>
                    Home Base
                </Button>
            </Link>
            <Link href="/support" className="w-full">
                <Button variant="primary" className="w-full h-14" leftIcon={<MessageSquare className="w-4 h-4" />}>
                    Support Hub
                </Button>
            </Link>
        </div>

        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-16 flex items-center justify-center gap-2 text-slate-600 font-mono text-xs"
        >
            <Search className="w-3 h-3" />
            <span>Scanning for active channels... Web Port: 3000 Active</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
