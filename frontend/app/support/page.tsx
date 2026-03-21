"use client";
import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Send, CheckCircle2, AlertCircle, ChevronRight, ChevronLeft,
  Info, LifeBuoy, CreditCard, MessageCircle, Bug
} from "lucide-react";
import toast from "react-hot-toast";

const categories = [
  { id: "general",    label: "General Inquiry",       icon: Info },
  { id: "technical",  label: "Technical Support",      icon: LifeBuoy },
  { id: "billing",    label: "Billing & Subscriptions",icon: CreditCard },
  { id: "feedback",   label: "Product Feedback",       icon: MessageCircle },
  { id: "bug_report", label: "Report a Bug",           icon: Bug },
];

const priorities = [
  { id: "low",    label: "Low",    color: "text-slate-400 bg-slate-400/10 border-slate-700 hover:border-slate-600" },
  { id: "medium", label: "Medium", color: "text-amber-500 bg-amber-500/10 border-amber-700/50 hover:border-amber-500" },
  { id: "high",   label: "High",   color: "text-red-500 bg-red-500/10 border-red-700/50 hover:border-red-500" },
];

export default function SupportPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    category: "general",
    priority: "medium",
    message: "",
  });

  const nextStep = () => {
    if (step === 1) {
      if (!formData.name || !formData.email.includes("@")) {
        toast.error("Please provide valid contact details.");
        return;
      }
    }
    if (step === 2) {
      if (!formData.subject) {
        toast.error("Please provide a subject line.");
        return;
      }
    }
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

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
        setSubmitted(true);
        setTicketId("WEB-" + Math.random().toString(36).substr(2, 9).toUpperCase());
        toast.success("Request submitted successfully!");
      } else {
        toast.error(data.detail || "Submission failed.");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-slate-800 border border-slate-700 p-10 rounded-3xl max-w-md w-full text-center"
        >
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="text-emerald-500 w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Request Sent!</h2>
          <p className="text-text-muted mb-8 leading-relaxed">
            Your support request has been logged. ARIA is analysing it right now.
          </p>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-700 mb-8 font-mono text-sm">
            <span className="text-text-muted">Ticket ID:</span>{" "}
            <span className="text-emerald-500">{ticketId}</span>
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.push(`/support/status/${ticketId}`)}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl transition-all"
            >
              Track Status →
            </button>
            <button
              onClick={() => {
                setStep(1);
                setSubmitted(false);
                setFormData({ ...formData, subject: "", message: "" });
              }}
              className="text-text-muted hover:text-white transition-colors"
            >
              Submit Another
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <Link
            href="/"
            className="inline-block mb-6 text-text-muted hover:text-white transition-colors"
          >
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-extrabold mb-4">Support Center</h1>
          <p className="text-text-muted">ARIA is ready to assist you. 🌐 Web Form</p>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-slate-800 rounded-full mb-12">
          <motion.div
            initial={{ width: "33.3%" }}
            animate={{ width: `${(step / 3) * 100}%` }}
            className="h-full bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"
          />
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold">Step 1: Contact Details</h2>
                <div className="space-y-4">
                  <div className="relative group">
                    <label className="block text-xs font-bold uppercase tracking-widest text-text-muted group-focus-within:text-emerald-500 transition-colors mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter your full name"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 font-medium transition-all"
                    />
                  </div>
                  <div className="relative group">
                    <label className="block text-xs font-bold uppercase tracking-widest text-text-muted group-focus-within:text-emerald-500 transition-colors mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="your@email.com"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 font-medium transition-all"
                      />
                      {formData.email.includes("@") && (
                        <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 w-5 h-5" />
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                className="space-y-8"
              >
                <h2 className="text-2xl font-bold">Step 2: Request Details</h2>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-widest text-text-muted mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="What can we help you with?"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 font-medium transition-all"
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="block text-xs font-bold uppercase tracking-widest text-text-muted">
                      Category
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {categories.map((cat) => {
                        const Icon = cat.icon;
                        const isActive = formData.category === cat.id;
                        return (
                          <button
                            key={cat.id}
                            onClick={() => setFormData({ ...formData, category: cat.id })}
                            className={`flex items-center p-4 rounded-xl border transition-all ${
                              isActive
                                ? "bg-emerald-500/10 border-emerald-500 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                                : "bg-slate-950 border-slate-700 text-text-muted hover:border-slate-500"
                            }`}
                          >
                            <Icon className="w-5 h-5 mr-3" />
                            <span className="font-bold text-sm">{cat.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-xs font-bold uppercase tracking-widest text-text-muted">
                      Priority
                    </label>
                    <div className="flex gap-4">
                      {priorities.map((p) => {
                        const isActive = formData.priority === p.id;
                        return (
                          <button
                            key={p.id}
                            onClick={() => setFormData({ ...formData, priority: p.id })}
                            className={`flex-1 p-4 rounded-xl border text-center font-bold relative transition-all ${p.color} ${
                              isActive ? "ring-2 ring-inset ring-current scale-[1.02]" : "opacity-60 grayscale"
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

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold">Step 3: Message</h2>
                <div className="relative">
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder={
                      formData.category === "bug_report"
                        ? "Describe the bug, steps to reproduce, and expected vs actual behavior..."
                        : formData.category === "billing"
                        ? "What's wrong with your subscription or payment?"
                        : "Explain your request in detail..."
                    }
                    rows={8}
                    maxLength={1000}
                    className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-6 focus:outline-none focus:border-emerald-500 font-medium transition-all resize-none"
                  />
                  <div className="absolute bottom-4 right-6 text-xs text-text-muted">
                    {formData.message.length}/1000
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="mt-10 flex justify-between items-center gap-4">
            {step > 1 ? (
              <button
                onClick={prevStep}
                className="flex items-center px-6 py-4 border border-slate-700 hover:bg-slate-700/50 rounded-xl transition-all font-bold group"
              >
                <ChevronLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                onClick={nextStep}
                className="flex items-center ml-auto px-8 py-4 bg-white text-slate-950 hover:bg-slate-100 rounded-xl transition-all font-bold group"
              >
                Next Step
                <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center ml-auto px-10 py-4 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl transition-all font-bold shadow-[0_0_20px_rgba(16,185,129,0.4)] disabled:opacity-50 disabled:grayscale"
              >
                {loading ? "Sending..." : "Submit Request"}
                <Send className="w-5 h-5 ml-2" />
              </button>
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-12 p-6 bg-slate-900/50 border border-slate-800 rounded-2xl flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-emerald-500 flex-shrink-0" />
          <p className="text-sm text-text-muted leading-relaxed">
            This form uses ARIA (Autonomous Response &amp; Intelligence Agent). Responses are
            generated instantly after analysis. For urgent matters, set priority to High.
          </p>
        </div>
      </div>
    </div>
  );
}
