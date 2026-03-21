"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Navbar from "@/components/Navbar";

const categories = [
  { id: "general", label: "General" },
  { id: "technical", label: "Technical" },
  { id: "billing", label: "Billing" },
  { id: "feedback", label: "Feedback" },
];

const priorities = [
  { id: "low", label: "Low" },
  { id: "medium", label: "Medium" },
  { id: "high", label: "High" },
];

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
      if (!formData.name.trim()) return toast.error("Name is required");
      if (!formData.email.includes("@")) return toast.error("Valid email is required");
    }
    if (step === 2) {
      if (!formData.subject.trim()) return toast.error("Subject is required");
    }
    setDirection(1);
    setStep((s) => s + 1);
  };

  const goBack = () => {
    setDirection(-1);
    setStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    if (formData.message.length < 10) return toast.error("Message too short");
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
      } else {
        toast.error(data.detail || "Submission failed");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="min-h-screen bg-[#1A1612] flex flex-col items-center justify-center p-6 text-center"
      >
        <div className="relative mb-12">
          <svg width="120" height="120" viewBox="0 0 120 120" className="mx-auto">
            <motion.circle
              cx="60" cy="60" r="54"
              fill="none"
              stroke="#CC5500"
              strokeWidth="2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, ease: "easeInOut" }}
            />
            <motion.path
              d="M38 60L54 76L82 44"
              fill="none"
              stroke="#CC5500"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
            />
          </svg>
        </div>

        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.7 }}
          className="font-display font-black text-[3rem] text-[#FDFAF5] mb-4 tracking-[-0.02em]"
        >
          Received.
        </motion.h2>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
          className="space-y-6"
        >
          <p className="font-mono text-[#CC5500] text-[0.9rem] uppercase tracking-widest">
            {ticketId}
          </p>
          <p className="font-body font-light text-[#9E948A] text-[1rem]">
            ARIA will respond within 5 minutes.
          </p>
          <button
            onClick={() => {
              setStep(1);
              setSubmitted(false);
              setFormData({ ...formData, subject: "", message: "" });
            }}
            className="font-body font-light text-[#9E948A] hover:text-[#FDFAF5] transition-colors mt-12 block mx-auto underline underline-offset-4"
          >
            ← Submit another
          </button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F5F0E8] flex flex-col items-center">
      <Navbar />
      
      <div className="w-full max-w-[520px] px-6 pt-32 pb-24 flex flex-col">
        {/* Back Link */}
        <Link href="/" className="font-body font-light text-[0.9rem] text-[#9E948A] hover:text-[#1A1612] transition-colors mb-20 inline-flex items-center gap-2">
          ← Home
        </Link>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-24">
          {[1, 2, 3].map((i) => (
            <div key={i} className="relative w-10 h-[2px] bg-[#DDD8CF]">
              <motion.div 
                className="absolute inset-0 bg-[#CC5500]"
                initial={false}
                animate={{ width: i <= step ? "100%" : "0%" }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              />
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              <h1 className="font-display font-black text-[2.5rem] text-[#1A1612] tracking-[-0.02em]">
                Let's start with you.
              </h1>
              
              <div className="space-y-10">
                <div className="relative grid gap-2">
                  <label className="font-body font-bold text-[0.75rem] uppercase tracking-[0.08em] text-[#6B6459]">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Type your name..."
                    className="bg-transparent border-none border-b border-[#DDD8CF] focus:border-[#CC5500] focus:ring-0 px-0 py-3 font-body font-light text-[1.1rem] text-[#1A1612] placeholder-[#9E948A] transition-all outline-none"
                    style={{ borderBottom: '1px solid #DDD8CF' }}
                  />
                </div>

                <div className="relative grid gap-2">
                  <label className="font-body font-bold text-[0.75rem] uppercase tracking-[0.08em] text-[#6B6459]">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="j@example.com"
                    className="bg-transparent border-none border-b border-[#DDD8CF] focus:border-[#CC5500] focus:ring-0 px-0 py-3 font-body font-light text-[1.1rem] text-[#1A1612] placeholder-[#9E948A] transition-all outline-none"
                    style={{ borderBottom: '1px solid #DDD8CF' }}
                  />
                </div>
              </div>

              <button
                onClick={goNext}
                className="w-full mt-12 py-5 bg-[#1A1612] text-[#FDFAF5] font-body font-bold text-[1rem] tracking-wide hover:bg-[#CC5500] transition-all duration-200 active:scale-[0.98]"
                style={{ borderRadius: '2px' }}
              >
                Continue →
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              <h1 className="font-display font-black text-[2.5rem] text-[#1A1612] tracking-[-0.02em]">
                Tell us what's happening.
              </h1>

              <div className="space-y-10">
                <div className="relative grid gap-2">
                  <label className="font-body font-bold text-[0.75rem] uppercase tracking-[0.08em] text-[#6B6459]">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Short description..."
                    className="bg-transparent border-none border-b border-[#DDD8CF] focus:border-[#CC5500] focus:ring-0 px-0 py-3 font-body font-light text-[1.1rem] text-[#1A1612] placeholder-[#9E948A] transition-all outline-none"
                    style={{ borderBottom: '1px solid #DDD8CF' }}
                  />
                </div>

                <div className="space-y-4">
                  <label className="font-body font-bold text-[0.75rem] uppercase tracking-[0.08em] text-[#6B6459]">
                    Category
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setFormData({ ...formData, category: cat.id })}
                        className={`py-3 px-4 border font-body font-light text-[0.9rem] transition-all ${
                          formData.category === cat.id
                            ? "bg-[#1A1612] text-[#FDFAF5] border-[#1A1612]"
                            : "bg-transparent text-[#6B6459] border-[#DDD8CF] hover:border-[#1A1612]"
                        }`}
                        style={{ borderRadius: '4px' }}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="font-body font-bold text-[0.75rem] uppercase tracking-[0.08em] text-[#6B6459]">
                    Priority
                  </label>
                  <div className="flex gap-3">
                    {priorities.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setFormData({ ...formData, priority: p.id })}
                        className={`flex-1 py-3 border font-body font-light text-[0.9rem] transition-all ${
                          formData.priority === p.id
                            ? p.id === 'high' ? "bg-[#CC5500] text-[#FDFAF5] border-[#CC5500]" : "bg-[#1A1612] text-[#FDFAF5] border-[#1A1612]"
                            : "bg-transparent text-[#6B6459] border-[#DDD8CF] hover:border-[#1A1612]"
                        }`}
                        style={{ borderRadius: '4px' }}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 pt-8">
                <button onClick={goBack} className="font-body font-light text-[#6B6459] hover:text-[#1A1612] underline underline-offset-4">
                  Back
                </button>
                <button
                  onClick={goNext}
                  className="flex-1 py-5 bg-[#1A1612] text-[#FDFAF5] font-body font-bold text-[1rem] tracking-wide hover:bg-[#CC5500] transition-all duration-200 active:scale-[0.98]"
                  style={{ borderRadius: '2px' }}
                >
                  Continue →
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              <h1 className="font-display font-black text-[2.5rem] text-[#1A1612] tracking-[-0.02em]">
                Describe the issue.
              </h1>

              <div className="relative">
                <label className="font-body font-bold text-[0.75rem] uppercase tracking-[0.08em] text-[#6B6459]">
                  Details
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="How can ARIA help you today?"
                  className="w-full min-h-[160px] bg-transparent border-none border-b border-[#DDD8CF] focus:border-[#CC5500] focus:ring-0 px-0 py-4 font-body font-light text-[1.1rem] text-[#1A1612] placeholder-[#9E948A] transition-all outline-none resize-none leading-relaxed"
                  style={{ borderBottom: '1px solid #DDD8CF' }}
                />
                <div className="absolute bottom-[-24px] right-0 font-body font-light text-[0.75rem] text-[#9E948A]">
                  {formData.message.length} / 1000
                </div>
              </div>

              <div className="flex items-center gap-6 pt-12">
                <button onClick={goBack} className="font-body font-light text-[#6B6459] hover:text-[#1A1612] underline underline-offset-4">
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 py-5 bg-[#CC5500] text-[#FDFAF5] font-body font-bold text-[1rem] tracking-wide hover:scale-[1.02] transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
                  style={{ borderRadius: '2px' }}
                >
                  {loading ? "Sending..." : "Send to ARIA →"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
