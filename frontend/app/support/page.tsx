"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import Navbar from "@/components/Navbar";
import { ArrowLeft } from "lucide-react";

const CATEGORIES = [
  { value: "general", label: "General Inquiry" },
  { value: "technical", label: "Technical Issue" },
  { value: "billing", label: "Billing" },
  { value: "feedback", label: "Feedback" },
  { value: "bug_report", label: "Bug Report" },
];

export default function SupportPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    category: "general",
    message: "",
  });

  const update = (key: string, value: string) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const goNext = () => {
    if (step === 1) {
      if (!formData.name.trim() || formData.name.trim().length < 2)
        return toast.error("Please provide your full name.");
      if (!formData.email.includes("@"))
        return toast.error("Please provide a valid email address.");
    }
    if (step === 2) {
      if (formData.subject.trim().length < 5)
        return toast.error("Subject must be at least 5 characters.");
    }
    setStep((s) => s + 1);
  };

  const handleSubmit = async () => {
    if (formData.message.length < 10)
      return toast.error("Please provide a bit more detail (min 10 chars).");

    setLoading(true);
    try {
      const res = await fetch("/api/backend/v1/channels/webform/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          subject: formData.subject.trim(),
          category: formData.category,
          message: formData.message.trim(),
          priority: "medium",
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Submission failed");
      }

      const data = await res.json();
      setSubmitted(true);

      // Redirect to ticket status page after a brief feedback moment
      if (data.ticket_id) {
        setTimeout(() => {
          router.push(`/support/status/${data.ticket_id}`);
        }, 1500);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong. Please try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyles =
    "w-full bg-transparent border-b-2 border-[#E5E0D8] px-0 py-3 text-lg font-serif text-[#2D2926] placeholder-[#8A857D] focus:outline-none focus:border-[#D97757] transition-colors rounded-none";

  return (
    <main className="min-h-screen bg-[#FAF9F6] text-[#2D2926] flex flex-col items-center">
      <Navbar />

      <div className="w-full max-w-[600px] px-6 pt-40 pb-24 flex-grow flex flex-col">
        {!submitted && (
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#8A857D] hover:text-[#2D2926] transition-colors mb-12"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
        )}

        {/* Step indicator */}
        {!submitted && (
          <div className="flex items-center gap-2 mb-10">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                  s <= step ? "bg-[#D97757]" : "bg-[#E5E0D8]"
                }`}
              />
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* ── SUCCESS ── */}
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-grow flex flex-col items-center justify-center text-center -mt-20"
            >
              <div className="w-16 h-16 bg-[#EDF2EE] rounded-full flex items-center justify-center mb-6 shadow-sm">
                <span className="text-2xl">✓</span>
              </div>
              <h1 className="text-4xl font-serif mb-4">Request received</h1>
              <p className="text-lg text-[#5C564D] mb-4 max-w-[400px]">
                ARIA is reviewing your message. Redirecting you to your ticket…
              </p>
              <div className="w-8 h-1 bg-[#D97757] rounded-full animate-pulse" />
            </motion.div>
          ) : step === 1 ? (
            /* ── STEP 1: Name + Email ── */
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              <div>
                <h1 className="text-4xl font-serif text-[#2D2926] mb-3">Hello there.</h1>
                <p className="text-[#5C564D] text-lg">Who are we speaking with today?</p>
              </div>

              <div className="space-y-8">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="Your full name"
                  className={inputStyles}
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && goNext()}
                />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="Your email address"
                  className={inputStyles}
                  onKeyDown={(e) => e.key === "Enter" && goNext()}
                />
              </div>

              <div className="pt-4">
                <button onClick={goNext} className="btn-primary w-full">
                  Continue →
                </button>
              </div>
            </motion.div>
          ) : step === 2 ? (
            /* ── STEP 2: Subject + Category ── */
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              <div>
                <h1 className="text-4xl font-serif text-[#2D2926] mb-3">What&apos;s this about?</h1>
                <p className="text-[#5C564D] text-lg">Give us a quick summary.</p>
              </div>

              <div className="space-y-8">
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => update("subject", e.target.value)}
                  placeholder="Subject (e.g. API key not working)"
                  className={inputStyles}
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && goNext()}
                />

                <div>
                  <label className="block text-sm font-medium text-[#8A857D] mb-3 uppercase tracking-wide">
                    Category
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(({ value, label }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => update("category", value)}
                        className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                          formData.category === value
                            ? "bg-[#D97757] text-white border-[#D97757]"
                            : "bg-white text-[#5C564D] border-[#E5E0D8] hover:border-[#D97757]"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button onClick={() => setStep(1)} className="btn-secondary w-full">
                  Back
                </button>
                <button onClick={goNext} className="btn-primary w-full">
                  Continue →
                </button>
              </div>
            </motion.div>
          ) : (
            /* ── STEP 3: Message ── */
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              <div>
                <h1 className="text-4xl font-serif text-[#2D2926] mb-3">Tell us more.</h1>
                <p className="text-[#5C564D] text-lg">The more detail, the faster ARIA can help.</p>
              </div>

              <textarea
                value={formData.message}
                onChange={(e) => update("message", e.target.value)}
                placeholder="Describe your issue or request in detail…"
                className="w-full min-h-[250px] bg-white border border-[#E5E0D8] rounded-2xl p-6 text-lg font-serif text-[#2D2926] placeholder-[#8A857D] focus:outline-none focus:border-[#D97757] transition-colors resize-none shadow-sm"
                autoFocus
              />

              <div className="flex gap-4 pt-4">
                <button onClick={() => setStep(2)} className="btn-secondary w-full">
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Sending…" : "Send to ARIA →"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
