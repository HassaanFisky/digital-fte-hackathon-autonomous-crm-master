'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Bot, Home, MessageSquare, AlertTriangle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-bg-base text-text-primary p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="text-center max-w-lg"
      >
        {/* Icon */}
        <div className="w-20 h-20 rounded-[1.5rem] bg-bg-surface border border-border-fine flex items-center justify-center mx-auto mb-8 shadow-float">
          <motion.div
            animate={{ rotate: [0, 8, -8, 0], y: [0, -4, 4, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Bot className="w-10 h-10 text-accent" />
          </motion.div>
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-error/10 border border-error/20 text-error text-[10px] font-bold uppercase tracking-widest mb-6">
          <AlertTriangle className="w-3 h-3" /> 404 — Page Not Found
        </div>

        <h1 className="text-3xl font-serif font-bold text-text-primary mb-3">
          Route not found
        </h1>
        <p className="text-text-secondary mb-10 leading-relaxed">
          ARIA searched the system but this route doesn't exist. Let me guide you back.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-[var(--radius-sm)] bg-bg-elevated border border-border-fine text-text-secondary hover:border-accent hover:text-accent transition-all text-[11px] font-bold uppercase tracking-widest"
          >
            <Home className="w-4 h-4" /> Home
          </Link>
          <Link
            href="/support"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-[var(--radius-sm)] bg-accent text-white hover:opacity-90 transition-all text-[11px] font-bold uppercase tracking-widest shadow-lg"
          >
            <MessageSquare className="w-4 h-4" /> Support Hub
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
