"use client";
import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import Navbar from "@/components/Navbar";
import { ArrowLeft, Sparkles, CheckCircle2, ShieldAlert, Clock, MessageSquare, RefreshCw } from "lucide-react";
import { useAriaAgent } from "@/lib/hooks/useAriaAgent";

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
  const {
    isLoadingSupport,
    isLoadingClassifier,
    isLoadingSuggestions,
    isLoadingEscalation,
    supportResponse,
    classification,
    suggestions,
    activeModel,
    error,
    submitTicket,
    getSuggestions,
    resetState,
  } = useAriaAgent();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    category: "general",
    message: "",
  });

  const update = (key: string, value: string) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const handleNameBlur = () => {
    if (formData.name.trim().length > 1 && suggestions.length === 0 && !isLoadingSuggestions) {
      getSuggestions(formData.name.trim());
    }
  };

  const handleSuggestionClick = (text: string) => {
    update("message", text);
    toast.success("Suggestion applied!", {
      icon: '✨',
      style: {
        borderRadius: '10px',
        background: '#2D2926',
        color: '#fff',
      },
    });
  };

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

    await submitTicket(formData.name.trim(), formData.email.trim(), formData.message.trim());
  };

  const handleReset = () => {
    resetState();
    setFormData({
      name: "",
      email: "",
      subject: "",
      category: "general",
      message: "",
    });
    setStep(1);
  };

  const inputStyles =
    "w-full bg-transparent border-b-2 border-[#E5E0D8] px-0 py-3 text-lg font-serif text-[#2D2926] placeholder-[#8A857D] focus:outline-none focus:border-[#D97757] transition-colors rounded-none";

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const isLoading = isLoadingSupport || isLoadingClassifier;
  const showResults = supportResponse && classification;

  return (
    <main className="min-h-screen bg-[#FAF9F6] text-[#2D2926] flex flex-col items-center">
      <Navbar />

      <div className="w-full max-w-[700px] px-6 pt-40 pb-24 flex-grow flex flex-col">
        {!showResults && (
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#8A857D] hover:text-[#2D2926] transition-colors mb-12 w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
        )}

        {/* Step indicator */}
        {!showResults && (
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
          {showResults ? (
            /* ── AI RESULTS DISPLAY ── */
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-16 h-16 bg-[#EDF2EE] rounded-full flex items-center justify-center mb-6 shadow-sm border border-[#D9E3DA]">
                  <CheckCircle2 className="w-8 h-8 text-[#4A5D4E]" />
                </div>
                <h1 className="text-4xl font-serif mb-2">ARIA has processed your request</h1>
                <p className="text-[#8A857D]">Intelligence layer results below</p>
              </div>

              {/* Status Badges */}
              <div className="flex flex-wrap gap-3 justify-center">
                <div className={`px-4 py-1.5 rounded-full text-xs font-bold border uppercase tracking-wider ${getPriorityColor(classification.priority)}`}>
                  {classification.priority} Priority
                </div>
                <div className="px-4 py-1.5 rounded-full text-xs font-bold border border-[#E5E0D8] bg-white text-[#5C564D] uppercase tracking-wider">
                  {classification.category}
                </div>
                <div className="px-4 py-1.5 rounded-full text-xs font-bold border border-[#E5E0D8] bg-white text-[#5C564D] uppercase tracking-wider capitalize">
                  Sentiment: {classification.sentiment}
                </div>
                <div className="px-4 py-1.5 rounded-full text-xs font-bold border border-[#E5E0D8] bg-white text-[#5C564D] uppercase tracking-wider">
                   ETA: {classification.estimatedResolutionMinutes}m
                </div>
              </div>

              {/* Escalation Notice */}
              {classification.urgencyScore >= 8 && (
                <div className="bg-[#FFF4F2] border border-[#FFD4CC] rounded-xl p-4 flex items-center gap-3">
                  <ShieldAlert className="w-5 h-5 text-[#D97757]" />
                  <span className="text-sm font-medium text-[#8C4A35]">Your case has been flagged for priority review.</span>
                </div>
              )}

              {/* ARIA Response Card */}
              <div className="document-card p-8 md:p-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Sparkles className="w-12 h-12" />
                </div>
                <div className="flex items-center gap-3 mb-6">
                   <div className="w-8 h-8 rounded-full bg-[#2D2926] flex items-center justify-center text-white text-[10px] font-bold">ARIA</div>
                   <span className="text-sm font-semibold tracking-wide text-[#2D2926]">OFFICIAL RESPONSE</span>
                </div>
                <div className="text-xl font-serif leading-relaxed text-[#2D2926] whitespace-pre-wrap italic">
                  &quot;{supportResponse}&quot;
                </div>
                <div className="mt-8 pt-6 border-t border-[#E5E0D8] flex items-center justify-between">
                   <span className="text-[10px] text-[#8A857D] uppercase tracking-widest font-bold">
                     Powered by ARIA Multi-Agent Intelligence • {activeModel}
                   </span>
                   <Clock className="w-4 h-4 text-[#8A857D]" />
                </div>
              </div>

              <div className="flex justify-center pt-8">
                <button 
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 text-sm font-bold text-[#D97757] hover:text-[#2D2926] transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Submit another request
                </button>
              </div>
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
                <div className="relative">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => update("name", e.target.value)}
                    onBlur={handleNameBlur}
                    placeholder="Your full name"
                    className={inputStyles}
                    autoFocus
                    onKeyDown={(e) => e.key === "Enter" && goNext()}
                  />
                  {isLoadingSuggestions && (
                    <div className="absolute right-0 bottom-4 flex items-center gap-2">
                       <div className="w-2 h-2 bg-[#D97757] rounded-full animate-ping" />
                       <span className="text-[10px] font-bold text-[#D97757] uppercase tracking-tighter">AI Processing</span>
                    </div>
                  )}
                </div>
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
              <div className="flex flex-col gap-4">
                <div>
                  <h1 className="text-4xl font-serif text-[#2D2926] mb-3">Tell us more.</h1>
                  <p className="text-[#5C564D] text-lg">The more detail, the faster we can help.</p>
                </div>
                
                {/* Suggestions Section */}
                {suggestions.length > 0 && (
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold text-[#8A857D] uppercase tracking-widest flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3" />
                      Smart Suggestions
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {suggestions.map((s, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSuggestionClick(s)}
                          className="px-3 py-1.5 rounded-lg text-[11px] font-medium bg-[#F0EBE1] text-[#5C564D] border border-transparent hover:border-[#D97757] hover:bg-white transition-all text-left max-w-full"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <textarea
                  value={formData.message}
                  onChange={(e) => update("message", e.target.value)}
                  placeholder="Describe your issue or request in detail, or tap a suggestion above..."
                  className="w-full min-h-[250px] bg-white border border-[#E5E0D8] rounded-2xl p-6 text-lg font-serif text-[#2D2926] placeholder-[#8A857D] focus:outline-none focus:border-[#D97757] transition-colors resize-none shadow-sm"
                  autoFocus
                />
                <div className="absolute right-4 bottom-4 text-[10px] font-mono font-bold text-[#8A857D]">
                   {formData.message.length} / 1000
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button onClick={() => setStep(2)} className="btn-secondary w-full">
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isLoading || formData.message.length < 10}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
                >
                  <AnimatePresence mode="wait">
                    {isLoading ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center justify-center gap-3"
                      >
                         <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                         <span className="animate-pulse">ARIA is analyzing your request...</span>
                      </motion.div>
                    ) : (
                      <motion.span key="normal">Send Request →</motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
