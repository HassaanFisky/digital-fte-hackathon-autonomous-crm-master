"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { HeartHandshake, Sparkles, Sprout, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const features = [
  {
    icon: Sparkles,
    title: "Thoughtful Intelligence",
    desc: "Aria reads every message with nuance, drafting responses that are deeply contextual and empathetic.",
    color: "#FDF1E7"
  },
  {
    icon: HeartHandshake,
    title: "Human in the Loop",
    desc: "Designed to collaborate. Your team retains full control while Aria handles the repetitive inquiries.",
    color: "#EDF2EE"
  },
  {
    icon: Sprout,
    title: "Organic Growth",
    desc: "The system learns from your best agents, organically adapting to your unique voice and policies.",
    color: "#F4EDFA"
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2, duration: 0.8 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col bg-[#FAF9F6] text-[#2D2926] overflow-x-hidden">
      <Navbar />

      <section className="relative flex flex-col items-center justify-center min-h-[90vh] px-6 pt-32 pb-24 text-center">
        <motion.div 
          className="relative max-w-[800px] w-full z-10"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="mb-8">
            <span className="text-[13px] font-medium tracking-wide text-[#8A857D] px-4 py-1.5 border border-[#E5E0D8] bg-white rounded-full shadow-sm">
              Meet your new copilot
            </span>
          </motion.div>

          <motion.h1 
            variants={itemVariants} 
            className="font-serif text-5xl md:text-7xl font-normal tracking-tight mb-8 text-[#2D2926] text-pretty leading-[1.1]"
          >
            Support that feels <br/>
            <span className="italic text-[#D97757]">beautifully human.</span>
          </motion.h1>

          <motion.p 
            variants={itemVariants} 
            className="text-lg md:text-xl text-[#5C564D] max-w-[600px] mx-auto mb-12 leading-relaxed text-pretty"
          >
            Aria bridges the gap between efficiency and empathy. 
            Deploy intelligent agents that resolve tickets across all channels while preserving your brand's warmth.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/support"
              className="group flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 bg-[#D97757] text-white font-medium text-[16px] rounded-xl transition-all hover:bg-[#C86444] active:scale-[0.98] shadow-sm"
            >
              Get Started
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-8 py-3.5 bg-[#F0EBE1] text-[#4A4541] font-medium text-[16px] rounded-xl transition-all hover:bg-[#E5E0D8] active:scale-[0.98]"
            >
              View Dashboard
            </Link>
          </motion.div>
        </motion.div>
      </section>

      <section className="w-full max-w-[1200px] mx-auto px-6 py-32 border-t border-[#E5E0D8]/60">
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl text-[#2D2926] mb-4">Thoughtful infrastructure</h2>
          <p className="text-[#8A857D] max-w-[500px] mx-auto">Built with care to handle your most delicate customer interactions.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map(({ icon: Icon, title, desc, color }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="bg-white p-10 rounded-2xl border border-[#E5E0D8] shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow"
            >
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                style={{ backgroundColor: color }}
              >
                <Icon className="w-6 h-6 text-[#2D2926]" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-serif text-[#2D2926] mb-3">
                {title}
              </h3>
              <p className="text-[#5C564D] leading-relaxed">
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
