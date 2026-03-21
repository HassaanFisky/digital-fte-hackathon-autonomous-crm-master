"use client";
import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Send, CheckCircle2, ChevronRight, ChevronLeft,
  Info, LifeBuoy, CreditCard, MessageCircle, Bug,
} from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "@/components/Navbar";

const categories = [
  { id: "general",    label: "General",   icon: Info },
  { id: "technical",  label: "Technical", icon: LifeBuoy },
  { id: "billing",    label: "Billing",   icon: CreditCard },
  { id: "feedback",   label: "Feedback",  icon: MessageCircle },
  { id: "bug_report", label: "Bug",       icon: Bug },
];

const priorities = [
  { id: "low",    label: "Low",    active: "bg-slate-700 text-white border-slate-600" },
  { id: "medium", label: "Medium", active: "bg-amber-500/20 text-amber-400 border-amber-500" },
  { id: "high",   label: "High",   active: "bg-red-500/20 text-red-400 border-red-500" },
];

const slideVariants = {
  enter: { x: 40, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: -40, opacity: 0 },
};

export default function SupportPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState("");
  const [direction, setDirection] = useState(1);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    category: "general",
    priority: "medium",
    message: "",
  });

  const goNext = () => {
    if (step === 1) {
      if (!formData.name.trim()) {
        toast.error("Please enter your name.");
        return;
      }
      if (!formData.email.includes("@")) {
        toast.error("Please enter a valid email.");
        return;
      }
    }
    if (step === 2) {
      if (!formData.subject.trim()) {
        toast.error("Please enter a subject.");
        return;
      }
    }
    setDirection(1);
    setStep((s) => s + 1);
  };

  const goBack = () => {
    setDirection(-1);
    setStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    if (formData.message.length < 10) {
      toast.error("Message is too short.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/support/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setTicketId("WEB-" + Math.random().toString(36).substr(2, 9).toUpperCase());
        setSubmitted(true);
        toast.success("Ticket submitted!");
      } else {
        toast.error(data.detail || "Submission failed.");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Success state ────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-sm w-full text-center"
        >
          {/* Checkmark ring */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
            className="w-20 h-20 bg-emerald-500/10 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8"
          >
            <CheckCircle2 className="text-emerald-500 w-10 h-10" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
            className="text-3xl font-extrabold text-white mb-3"
          >
            Ticket Received
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28, duration: 0.5, ease: "easeOut" }}
            className="text-slate-400 text-base mb-8 leading-relaxed"
          >
            ARIA will respond within 5 minutes.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.36, duration: 0.5, ease: "easeOut" }}
            className="bg-slate-800 border border-slate-700 rounded-2xl px-6 py-4 mb-8 font-mono text-sm"
          >
            <span className="text-slate-500">Ticket # </span>
            <span className="text-emerald-400 font-bold">{ticketId}</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.44 }}
            className="flex flex-col gap-3"
          >
            <button
              onClick={() => router.push(`/support/status/${ticketId}`)}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-colors duration-200"
            >
              Track Status →
            </button>
            <button
              onClick={() => {
                setStep(1);
                setSubmitted(false);
                setFormData({ ...formData, subject: "", message: "" });
              }}
              className="text-slate-500 hover:text-slate-300 text-sm transition-colors duration-200"
            >
              Submit Another
            </button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // ─── Form ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-6 pt-24 pb-16">
        <div className="w-full max-w-lg">
          {/* Step dots */}
          <div className="flex items-center justify-center gap-3 mb-12">
            {[1, 2, 3].map((dot) => (
              <div
                key={dot}
                className={`rounded-full transition-all duration-300 ${
                  dot === step
                    ? "w-6 h-2.5 bg-emerald-500"
                    : dot < step
                    ? "w-2.5 h-2.5 bg-emerald-500/40"
                    : "w-2.5 h-2.5 bg-slate-700"
                }`}
              />
            ))}
          </div>

          {/* Card */}
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8 overflow-hidden relative">
            <AnimatePresence mode="wait" custom={direction}>
              {/* ── Step 1 ── */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Who are you?</h2>
                    <p className="text-slate-400 text-sm">We'll use this to follow up with you.</p>
                  </div>

                  <div className="space-y-5">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-widest text-slate-500">
                        Name
                      </label>
                      <input
                        type="text"
                        autoFocus
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        onKeyDown={(e) => e.key === "Enter" && goNext()}
                        placeholder="Jane Smith"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3.5 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors duration-200 text-base font-medium"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-widest text-slate-500">
                        Email
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          onKeyDown={(e) => e.key === "Enter" && goNext()}
                          placeholder="jane@company.com"
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3.5 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors duration-200 text-base font-medium pr-12"
                        />
                        {formData.email.includes("@") && (
                          <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 w-5 h-5" />
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── Step 2 ── */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">What's the issue?</h2>
                    <p className="text-slate-400 text-sm">Give us a quick overview.</p>
                  </div>

                  <div className="space-y-5">
                    {/* Subject */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-widest text-slate-500">
                        Subject
                      </label>
                      <input
                        type="text"
                        autoFocus
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="e.g. Login not working"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3.5 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors duration-200 text-base font-medium"
                      />
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase tracking-widest text-slate-500">
                        Category
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {categories.map((cat) => {
                          const Icon = cat.icon;
                          const active = formData.category === cat.id;
                          return (
                            <button
                              key={cat.id}
                              onClick={() => setFormData({ ...formData, category: cat.id })}
                              className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border text-xs font-bold transition-all duration-200 ${
                                active
                                  ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                                  : "bg-slate-950 border-slate-700 text-slate-500 hover:border-slate-600"
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                              {cat.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Priority */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase tracking-widest text-slate-500">
                        Priority
                      </label>
                      <div className="flex gap-2">
                        {priorities.map((p) => {
                          const active = formData.priority === p.id;
                          return (
                            <button
                              key={p.id}
                              onClick={() => setFormData({ ...formData, priority: p.id })}
                              className={`flex-1 py-2.5 rounded-xl border text-sm font-bold transition-all duration-200 ${
                                active
                                  ? p.active
                                  : "bg-slate-950 border-slate-700 text-slate-600 hover:border-slate-600"
                              }`}
                            >
                              {p.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── Step 3 ── */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Describe the issue</h2>
                    <p className="text-slate-400 text-sm">The more detail, the faster ARIA can help.</p>
                  </div>

                  <div className="relative">
                    <textarea
                      autoFocus
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Describe your issue..."
                      rows={7}
                      maxLength={1000}
                      className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-4 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors duration-200 text-sm font-medium resize-none leading-relaxed"
                    />
                    <span className="absolute bottom-4 right-4 text-xs text-slate-600 font-mono">
                      {formData.message.length}/1000
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation */}
            <div className="mt-8 flex items-center justify-between gap-4">
              {step > 1 ? (
                <button
                  onClick={goBack}
                  className="flex items-center gap-1.5 px-5 py-3 border border-slate-700 hover:bg-slate-700/40 text-slate-400 hover:text-white rounded-xl transition-all duration-200 text-sm font-bold"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
              ) : (
                <div />
              )}

              {step < 3 ? (
                <button
                  onClick={goNext}
                  className="flex items-center gap-1.5 ml-auto px-6 py-3 bg-white hover:bg-slate-100 text-slate-950 rounded-xl transition-colors duration-200 text-sm font-bold"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex items-center gap-2 ml-auto w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl transition-colors duration-200 font-bold justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_24px_rgba(16,185,129,0.3)]"
                >
                  {loading ? "Sending..." : "Send to ARIA →"}
                  {!loading && <Send className="w-4 h-4" />}
                </button>
              )}
            </div>
          </div>

          {/* Back home */}
          <p className="mt-6 text-center text-sm text-slate-600">
            <Link href="/" className="hover:text-slate-400 transition-colors duration-200">
              ← Back to Home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
