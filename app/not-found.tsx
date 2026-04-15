'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Bot, Home, MessageSquare, AlertTriangle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="text-center max-w-lg"
      >
        {/* Icon */}
        <div
          className="w-20 h-20 flex items-center justify-center mx-auto mb-8"
          style={{
            background: 'var(--bg-surface)',
            border: '0.8px solid var(--border-fine)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <motion.div
            animate={{ rotate: [0, 8, -8, 0], y: [0, -4, 4, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Bot className="w-10 h-10" style={{ color: 'var(--accent)' }} />
          </motion.div>
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6"
          style={{ background: 'rgba(217,87,87,0.1)', border: '1px solid rgba(217,87,87,0.2)', color: 'var(--error)' }}
        >
          <AlertTriangle className="w-3 h-3" /> 404 — Page Not Found
        </div>

        <h1 className="text-3xl font-serif font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
          Route not found
        </h1>
        <p className="mb-10 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          Aira searched the system but this route doesn&apos;t exist. Let me guide you back.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-3 text-[11px] font-bold uppercase tracking-widest transition-all hover:opacity-80"
            style={{
              background: 'var(--bg-elevated)',
              border: '0.8px solid var(--border-fine)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-secondary)',
            }}
          >
            <Home className="w-4 h-4" /> Home
          </Link>
          <Link
            href="/support"
            className="flex items-center justify-center gap-2 px-6 py-3 text-[11px] font-bold uppercase tracking-widest transition-all hover:opacity-90"
            style={{
              background: 'var(--accent)',
              borderRadius: 'var(--radius-sm)',
              color: '#FFFFFF',
              boxShadow: '0 4px 16px -4px rgba(217,119,87,0.3)',
            }}
          >
            <MessageSquare className="w-4 h-4" /> Support Hub
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
