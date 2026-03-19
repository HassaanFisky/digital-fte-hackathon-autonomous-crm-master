'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, MessageSquare, AlertCircle, ChevronRight, CheckCircle2, Globe, ArrowLeft, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import ReactConfetti from 'react-confetti';
import Navbar from '@/components/Navbar';

const steps = [
  { id: 1, title: 'Contact' },
  { id: 2, title: 'Details' },
  { id: 3, title: 'Message' },
];

const categories = [
  { id: 'technical', label: 'Technical', icon: '🔧' },
  { id: 'billing', label: 'Billing', icon: '💳' },
  { id: 'bug_report', label: 'Bug Report', icon: '🐛' },
  { id: 'feedback', label: 'Feature Request', icon: '💡' },
];

const priorities = [
  { id: 'low', label: 'Low', icon: '🟢', activeClass: 'border-em bg-em/10' },
  { id: 'medium', label: 'Medium', icon: '🟡', activeClass: 'border-amber bg-amber/10' },
  { id: 'high', label: 'High', icon: '🔴', activeClass: 'border-red bg-red/10' },
];

export default function SupportForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: 'technical',
    priority: 'medium',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');
  const router = useRouter();

  const handleNext = () => {
    if (step === 1 && (!formData.name || !formData.email)) {
      toast.error('Please complete contact info');
      return;
    }
    if (step === 2 && !formData.subject) {
      toast.error('Subject is required');
      return;
    }
    setStep(s => s + 1);
  };

  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    if (formData.message.length < 10) {
      toast.error('Please describe your issue in detail');
      return;
    }

    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/v1/channels/webform/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Submission failed: ${errorText}`);
      }

      const data = await response.json();
      setTicketId(data.ticket_id);
      setSubmitted(true);
      toast.success('Submitted to ARIA!');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error connecting to ARIA');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-6 relative overflow-hidden">
        <ReactConfetti recycle={false} numberOfPieces={200} gravity={0.1} colors={['#10B981', '#6366F1', '#F59E0B']} />
        <Navbar />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-[480px] w-full bg-surface border border-border p-12 rounded-[32px] text-center shadow-2xl"
        >
          <div className="text-6xl mb-8">✅</div>
          <h1 className="font-head text-3xl font-extrabold mb-3">Ticket Submitted!</h1>
          <p className="font-body text-text2 text-sm mb-8">ARIA is processing your request autonomously.</p>
          
          <div className="bg-em/10 border border-em/20 rounded-2xl p-6 mb-8">
            <div className="text-[10px] font-bold text-text3 uppercase tracking-widest mb-1.5 flex justify-center items-center gap-1.5">
              Your Ticket ID
            </div>
            <div className="font-mono text-3xl font-extrabold text-em tracking-wider uppercase">{ticketId}</div>
          </div>

          <div className="flex items-center justify-center gap-2 text-[13px] text-text2 mb-10">
            <div className="w-2 h-2 rounded-full bg-em animate-pulse-live" />
            Estimated response: <strong>~2–5 minutes</strong>
          </div>

          <div className="flex flex-col gap-3">
            <button 
              onClick={() => router.push(`/support/status/${ticketId}`)}
              className="w-full bg-em hover:bg-em2 text-bg py-4 rounded-xl font-body font-bold text-sm transition-all hover:-translate-y-1 shadow-em-glow"
            >
              Track Status →
            </button>
            <button 
              onClick={() => { setSubmitted(false); setStep(1); setFormData({...formData, message: ''}); }}
              className="w-full bg-transparent hover:bg-card border border-border2 py-4 rounded-xl font-body font-bold text-sm text-text2 hover:text-text transition-all"
            >
              Submit Another
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      
      <main className="max-w-[680px] mx-auto pt-32 pb-24 px-6 md:px-0">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-em/10 border border-em/25 px-3 py-1 rounded-full mb-4 font-body font-bold text-[11px] text-em tracking-widest uppercase">
            <Globe className="w-3.5 h-3.5" /> Web Form Channel
          </div>
          <h2 className="font-head text-4xl font-extrabold mb-3 tracking-tight">Submit a Request</h2>
          <p className="font-body text-text2 text-[15px]">ARIA will respond within 5 minutes, 24/7.</p>
        </div>

        {/* PROGRESS TRACK */}
        <div className="relative flex justify-between mb-12 px-6">
          <div className="absolute top-[17px] left-12 right-12 h-0.5 bg-border z-0" />
          <motion.div 
            className="absolute top-[17px] left-12 h-0.5 bg-em z-1 transition-all duration-500" 
            style={{ width: `${(step - 1) * 50}%` }}
          />
          {steps.map((s) => (
            <div key={s.id} className="relative z-2 flex flex-col items-center gap-2.5">
              <div className={`w-[34px] h-[34px] rounded-full flex items-center justify-center font-mono text-sm font-bold border-2 transition-all duration-300 ${
                step > s.id ? 'bg-em border-em text-bg' : step === s.id ? 'bg-bg border-em text-em' : 'bg-bg border-border text-text3'
              }`}>
                {step > s.id ? '✓' : s.id}
              </div>
              <span className={`text-[11px] font-bold uppercase tracking-wider ${step >= s.id ? 'text-em' : 'text-text3'}`}>{s.title}</span>
            </div>
          ))}
        </div>

        <div className="bg-surface border border-border p-10 rounded-[24px] shadow-2xl shadow-black/20">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-[11px] font-bold text-text3 uppercase tracking-[0.1em] mb-3 ml-1">Full Name</label>
                  <input 
                    type="text"
                    placeholder="e.g. Hassaan Ahmed"
                    className="w-full bg-card border-[1.5px] border-border rounded-xl px-5 py-3.5 text-text font-body text-sm outline-none focus:border-em focus:bg-card2 transition-all placeholder:text-text3/50"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-text3 uppercase tracking-[0.1em] mb-3 ml-1">Email Address</label>
                  <input 
                    type="email"
                    placeholder="you@example.com"
                    className="w-full bg-card border-[1.5px] border-border rounded-xl px-5 py-3.5 text-text font-body text-sm outline-none focus:border-em focus:bg-card2 transition-all placeholder:text-text3/50"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-[11px] font-bold text-text3 uppercase tracking-[0.1em] mb-3 ml-1">Subject</label>
                  <input 
                    type="text"
                    placeholder="Brief description of your issue"
                    className="w-full bg-card border-[1.5px] border-border rounded-xl px-5 py-3.5 text-text font-body text-sm outline-none focus:border-em focus:bg-card2 transition-all"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-text3 uppercase tracking-[0.1em] mb-3 ml-1">Category</label>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setFormData({...formData, category: c.id})}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border-[1.5px] transition-all text-[13px] font-medium ${
                          formData.category === c.id ? 'border-em bg-em/10 text-em' : 'border-border bg-card text-text2 hover:border-border2'
                        }`}
                      >
                        <span className="text-lg">{c.icon}</span> {c.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-text3 uppercase tracking-[0.1em] mb-3 ml-1">Priority</label>
                  <div className="grid grid-cols-3 gap-2">
                    {priorities.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setFormData({...formData, priority: p.id})}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-[1.5px] transition-all ${
                          formData.priority === p.id ? p.activeClass : 'border-border bg-card text-text2 hover:border-border2'
                        }`}
                      >
                        <span className="text-lg">{p.icon}</span>
                        <span className="text-[11px] font-bold uppercase tracking-wider">{p.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
              >
                <div className="flex justify-between items-center mb-3 pr-1">
                  <label className="block text-[11px] font-bold text-text3 uppercase tracking-[0.1em] ml-1">Describe Your Issue</label>
                  <span className="font-mono text-[10px] text-text3">{formData.message.length} / 1000</span>
                </div>
                <textarea 
                  placeholder="Include any context, error messages, or steps to reproduce..."
                  rows={6}
                  maxLength={1000}
                  className="w-full bg-card border-[1.5px] border-border rounded-xl px-6 py-5 text-text font-body text-sm outline-none focus:border-em focus:bg-card2 transition-all resize-none leading-relaxed"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-10 pt-8 border-t border-border flex justify-between items-center">
            {step > 1 ? (
              <button 
                onClick={handleBack}
                className="font-body font-bold text-[14px] text-text3 hover:text-text flex items-center gap-2 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            ) : <div />}

            {step < 3 ? (
              <button 
                onClick={handleNext}
                className="bg-em hover:bg-em2 text-bg px-8 py-3 rounded-xl font-body font-bold text-sm transition-all shadow-em-glow"
              >
                Continue →
              </button>
            ) : (
              <button 
                onClick={handleSubmit}
                disabled={loading}
                className="bg-em hover:bg-em2 text-bg px-10 py-3.5 rounded-xl font-body font-bold text-sm transition-all shadow-em-glow disabled:opacity-50 disabled:translate-y-0"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Submit to ARIA →'}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

