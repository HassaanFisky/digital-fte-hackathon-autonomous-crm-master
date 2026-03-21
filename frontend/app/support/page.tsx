"use client";
import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import Navbar from "@/components/Navbar";
import { ArrowLeft } from "lucide-react";

export default function SupportPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const goNext = () => {
    if (step === 1) {
      if (!formData.name.trim()) return toast.error("Please provide your name.");
      if (!formData.email.includes("@")) return toast.error("Please provide a valid email.");
    }
    setStep(2);
  };

  const handleSubmit = async () => {
    if (formData.message.length < 10) return toast.error("Please provide a bit more detail (min 10 chars).");
    setLoading(true);
    try {
      // Mock submit latency
      await new Promise(r => setTimeout(r, 1200));
      setSubmitted(true);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyles = "w-full bg-transparent border-b-2 border-[#E5E0D8] px-0 py-3 text-lg font-serif text-[#2D2926] placeholder-[#8A857D] focus:outline-none focus:border-[#D97757] transition-colors rounded-none";

  return (
    <main className="min-h-screen bg-[#FAF9F6] text-[#2D2926] flex flex-col items-center">
      <Navbar />
      
      <div className="w-full max-w-[600px] px-6 pt-40 pb-24 flex-grow flex flex-col">
        {!submitted && (
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-[#8A857D] hover:text-[#2D2926] transition-colors mb-12">
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
        )}

        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-grow flex flex-col items-center justify-center text-center -mt-20"
            >
               <div className="w-16 h-16 bg-[#FDF1E7] rounded-full flex items-center justify-center mb-6 shadow-sm">
                 <span className="text-2xl">✨</span>
               </div>
               <h1 className="text-4xl font-serif mb-4">Request sent successfully</h1>
               <p className="text-lg text-[#5C564D] mb-10 max-w-[400px]">
                 Thank you for reaching out. Our team (and Aria) will review your request and get back to you shortly.
               </p>
               <button
                 onClick={() => {
                   setStep(1);
                   setSubmitted(false);
                   setFormData({ name: "", email: "", message: "" });
                 }}
                 className="px-6 py-3 bg-[#F0EBE1] text-[#4A4541] font-medium rounded-xl hover:bg-[#E5E0D8] transition-colors shadow-sm"
               >
                 Send another request
               </button>
            </motion.div>
          ) : step === 1 ? (
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
                 <div>
                   <input
                     type="text"
                     value={formData.name}
                     onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                     placeholder="Your full name"
                     className={inputStyles}
                     autoFocus
                   />
                 </div>
                 <div>
                   <input
                     type="email"
                     value={formData.email}
                     onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                     placeholder="Your email address"
                     className={inputStyles}
                   />
                 </div>
               </div>

               <div className="pt-4">
                 <button
                   onClick={goNext}
                   className="btn-primary w-full"
                 >
                   Continue
                 </button>
               </div>
             </motion.div>
          ) : (
            <motion.div
               key="step2"
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               className="space-y-12"
             >
               <div>
                 <h1 className="text-4xl font-serif text-[#2D2926] mb-3">How can we help?</h1>
                 <p className="text-[#5C564D] text-lg">Please provide the details below.</p>
               </div>
               
               <div className="space-y-2">
                 <textarea
                   value={formData.message}
                   onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                   placeholder="Type your message here..."
                   className="w-full min-h-[250px] bg-white border border-[#E5E0D8] rounded-2xl p-6 text-lg font-serif text-[#2D2926] placeholder-[#8A857D] focus:outline-none focus:border-[#D97757] transition-colors resize-none shadow-sm"
                   autoFocus
                 />
               </div>

               <div className="flex gap-4 pt-4">
                 <button 
                   onClick={() => setStep(1)} 
                   className="btn-secondary w-full"
                 >
                   Back
                 </button>
                 <button
                   onClick={handleSubmit}
                   disabled={loading}
                   className="btn-primary w-full disabled:opacity-50"
                 >
                   {loading ? "Sending..." : "Send to Support"}
                 </button>
               </div>
             </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
