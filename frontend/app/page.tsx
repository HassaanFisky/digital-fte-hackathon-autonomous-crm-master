"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, MessageSquare, FileText } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const features = [
  {
    icon: Mail,
    title: "Email Intelligence",
    desc: "Monitors Gmail 24/7. Drafts and sends formal replies automatically.",
  },
  {
    icon: MessageSquare,
    title: "WhatsApp Support",
    desc: "Instant conversational responses via Twilio sandbox integration.",
  },
  {
    icon: FileText,
    title: "Web Form",
    desc: "Structured intake with intelligent triage and priority detection.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col bg-[#F5F0E8] text-[#1A1612] overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center min-h-screen px-6 py-24 text-center overflow-hidden">
        {/* Subtle radial gradient background */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,_#F5F0E8_0%,_#EDE8DF_100%)] opacity-50" />
        
        <motion.div 
          className="relative max-w-5xl w-full z-10"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Label */}
          <motion.div variants={itemVariants} className="mb-8">
            <span className="font-body font-bold text-[0.7rem] uppercase tracking-[0.15em] text-[#CC5500]">
              INTELLIGENT SUPPORT INFRASTRUCTURE
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1 
            variants={itemVariants} 
            className="font-display font-black leading-[1.1] tracking-[-0.02em] mb-10"
            style={{ fontSize: "clamp(3.5rem, 8vw, 5.5rem)" }}
          >
            <span className="text-[#1A1612]">Customer Support,</span>
            <br />
            <span className="text-[#CC5500]">Handled.</span>
          </motion.h1>

          {/* Subtext */}
          <motion.p 
            variants={itemVariants} 
            className="font-body font-light text-[1.1rem] text-[#6B6459] max-w-[480px] mx-auto mb-12 tracking-wide leading-relaxed"
          >
            ARIA resolves every support ticket across Email, WhatsApp, and Web — autonomously, in under 3 seconds.
          </motion.p>

          {/* Buttons */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/support"
              className="w-full sm:w-auto font-body font-bold px-10 py-4 bg-[#1A1612] text-[#FDFAF5] border-radius-[2px] transition-all duration-200 hover:bg-[#CC5500] hover:scale-[1.02] active:scale-[0.97]"
              style={{ borderRadius: '2px' }}
            >
              Start a Ticket →
            </Link>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto font-body font-bold px-10 py-4 bg-transparent text-[#1A1612] border-radius-[2px] border-1 border-[#1A1612] transition-all duration-200 hover:bg-[#1A1612] hover:text-[#FDFAF5] hover:scale-[1.02] active:scale-[0.97]"
              style={{ borderRadius: '2px', border: '1px solid #1A1612' }}
            >
              View Dashboard
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="w-full max-w-6xl mx-auto px-6 py-32 bg-[#F5F0E8]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16"
        >
          <span className="font-body font-bold text-[0.7rem] uppercase tracking-[0.15em] text-[#CC5500]">
            WHAT ARIA DOES
          </span>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: i * 0.1 }}
              className="p-10 bg-[#EDE8DF] border border-[#DDD8CF] shadow-[0_1px_3px_rgba(26,22,18,0.06)] rounded-[4px] group transition-all duration-300 hover:translate-y-[-4px] hover:scale-[1.02] hover:shadow-[0_4px_24px_rgba(26,22,18,0.08)]"
              style={{ borderRadius: '4px' }}
            >
              <div className="mb-6">
                <Icon className="w-6 h-6 text-[#CC5500] stroke-[1.5]" />
              </div>
              <h3 className="font-display font-black text-2xl text-[#1A1612] mb-4">
                {title}
              </h3>
              <p className="font-body font-light text-[0.95rem] text-[#6B6459] leading-relaxed">
                {desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
