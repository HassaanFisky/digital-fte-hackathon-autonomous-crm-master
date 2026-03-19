'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, MessageSquare, AlertCircle, ChevronRight, CheckCircle2, Globe, ArrowLeft, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import ReactConfetti from 'react-confetti';

const steps = [
  { id: 1, title: 'Contact Info', icon: <User className="w-5 h-5" /> },
  { id: 2, title: 'Issue Details', icon: <AlertCircle className="w-5 h-5" /> },
  { id: 3, title: 'Message', icon: <MessageSquare className="w-5 h-5" /> },
];

const categories = [
  { id: 'general', label: 'General Inquiry', icon: '💬' },
  { id: 'technical', label: 'Technical Issue', icon: '🛠️' },
  { id: 'billing', label: 'Billing & Pricing', icon: '💰' },
  { id: 'feedback', label: 'Product Feedback', icon: '📈' },
  { id: 'bug_report', label: 'Report a Bug', icon: '🪲' },
];

const priorities = [
  { id: 'low', label: 'Low', color: 'bg-slate-700 text-slate-300' },
  { id: 'medium', label: 'Medium', color: 'bg-amber-500/10 text-amber-500' },
  { id: 'high', label: 'High', color: 'bg-red-500/10 text-red-500' },
];

export default function SupportForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: 'general',
    priority: 'medium',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');
  const router = useRouter();

  const handleNext = () => {
    if (step === 1 && (!formData.name || !formData.email)) {
      toast.error('Please complete all contact info');
      return;
    }
    if (step === 2 && !formData.subject) {
      toast.error('Subject is required');
      return;
    }
    setStep(s => s + 1);
  };

  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.message.length < 10) {
      toast.error('Message must be at least 10 characters');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/support/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Submission failed');

      const data = await response.json();
      setTicketId(data.ticket_id);
      setSubmitted(true);
      toast.success('Ticket submitted successfully!');
    } catch (err) {
      toast.error('Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 relative overflow-hidden">
        <ReactConfetti recycle={false} numberOfPieces={200} />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="max-w-md w-full p-10 rounded-3xl bg-slate-900 border border-emerald-500/30 text-center shadow-2xl shadow-emerald-500/10"
        >
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-8 animate-bounce">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h1 className="text-3xl font-extrabold mb-4">Aria is on it!</h1>
          <p className="text-slate-400 mb-8 leading-relaxed">
            Your request has been received. Our AI success agent ARIA will respond within 5 minutes.
          </p>
          
          <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 mb-10">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">TICKET ID</span>
            <div className="text-2xl font-mono font-bold text-emerald-500">{ticketId}</div>
          </div>

          <div className="flex flex-col gap-3">
              <button 
                onClick={() => router.push(`/support/status/${ticketId}`)}
                className="w-full py-4 rounded-xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 transition-all flex items-center justify-center gap-2"
              >
                Track Status <ChevronRight className="w-4 h-4" />
              </button>
              <button 
                onClick={() => { setSubmitted(false); setStep(1); setFormData({name:'', email:'', subject:'', category:'general', priority:'medium', message:''}); }}
                className="w-full py-4 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-700 transition-all"
              >
                Submit Another
              </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen p-6 max-w-2xl mx-auto pt-24">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 mb-4">
          <Globe className="w-4 h-4 text-emerald-500" />
          <span className="text-[10px] font-bold tracking-widest uppercase">Web Portal Support</span>
        </div>
        <h1 className="text-4xl font-extrabold mb-3">How can we help?</h1>
        <p className="text-slate-400">ARIA is standing by to resolve your technical or billing issues.</p>
      </motion.div>

      {/* Progress Bar */}
      <div className="flex items-center gap-2 mb-12 px-2">
        {steps.map((s, i) => (
          <div key={s.id} className="flex-1 flex items-center gap-2">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${step >= s.id ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}>
              {step > s.id ? <CheckCircle2 className="w-6 h-6" /> : s.icon}
            </div>
            {i < steps.length - 1 && <div className={`flex-1 h-1 rounded-full ${step > s.id ? 'bg-emerald-500' : 'bg-slate-800'}`} />}
          </div>
        ))}
      </div>

      {/* Form Steps */}
      <div className="flex-1">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-400 ml-1">YOUR NAME</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                  <input 
                    type="text"
                    placeholder="Enter your full name"
                    className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-700"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-400 ml-1">EMAIL ADDRESS</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                  <input 
                    type="email"
                    placeholder="name@company.com"
                    className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-700"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-400 ml-1">SUBJECT</label>
                <input 
                  type="text"
                  placeholder="Summarize your issue"
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 px-6 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-700"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-400 ml-1">CATEGORY</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setFormData({...formData, category: cat.id})}
                      className={`flex items-center gap-3 p-4 rounded-2xl border transition-all text-left ${formData.category === cat.id ? 'bg-emerald-500/10 border-emerald-500/50 text-white' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                    >
                      <span className="text-xl">{cat.icon}</span>
                      <span className="text-sm font-medium">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-400 ml-1">PRIORITY</label>
                <div className="flex gap-3">
                  {priorities.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setFormData({...formData, priority: p.id})}
                      className={`flex-1 py-3 px-4 rounded-xl border text-sm font-bold transition-all ${formData.priority === p.id ? p.color + ' border-current' : 'bg-slate-900 border-slate-800 text-slate-600 hover:border-slate-700'}`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-sm font-bold text-slate-400">MESSAGE</label>
                  <span className={`text-[10px] font-bold ${formData.message.length > 900 ? 'text-amber-500' : 'text-slate-600'}`}>{formData.message.length} / 1000</span>
                </div>
                <textarea 
                  placeholder={formData.category === 'billing' ? "Describe your billing discrepancy..." : "How can ARIA help you today?"}
                  rows={8}
                  maxLength={1000}
                  className="w-full bg-slate-900 border border-slate-800 rounded-3xl py-6 px-6 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-700 resize-none"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Actions */}
      <div className="mt-12 flex items-center justify-between pb-12">
        {step > 1 ? (
          <button 
            onClick={handleBack}
            className="flex items-center gap-2 px-6 py-3 rounded-xl hover:bg-slate-800 transition-colors font-bold text-slate-400"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        ) : <div />}

        {step < 3 ? (
          <button 
            onClick={handleNext}
            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-slate-200 text-slate-950 font-bold hover:bg-white transition-all ml-auto shadow-lg"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-10 py-4 rounded-xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 transition-all ml-auto shadow-xl shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Process My Ticket'}
          </button>
        )}
      </div>
    </div>
  );
}
