"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { HeartHandshake, Sparkles, Sprout, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/components/LanguageProvider";

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

/**
 * HASSAAN AI ARCHITECT — Companion FTE Landing Node
 * Re-engineered for 100% Theme Fidelity and Multi-Language Protocol.
 */
export default function LandingPage() {
  const { t } = useLanguage();

  const features = [
    {
      icon: Sparkles,
      title: t.features.items[0].title,
      desc: t.features.items[0].desc,
      color: "bg-[#FDF1E7] dark:bg-orange-900/20"
    },
    {
      icon: HeartHandshake,
      title: t.features.items[1].title,
      desc: t.features.items[1].desc,
      color: "bg-[#EDF2EE] dark:bg-emerald-900/20"
    },
    {
      icon: Sprout,
      title: t.features.items[2].title,
      desc: t.features.items[2].desc,
      color: "bg-[#F4EDFA] dark:bg-purple-900/20"
    },
  ];

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground overflow-x-hidden selection:bg-primary/10">
      <Navbar />

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center min-h-[90vh] px-6 pt-32 pb-24 text-center">
        {/* Subtle Background Detail */}
        <div className="absolute inset-0 z-0 bg-texture opacity-60 pointer-events-none" />

        <motion.div 
          className="relative max-w-[800px] w-full z-10"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="mb-10">
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#D97757] px-5 py-2 border border-[#E5E0D8] bg-white/50 backdrop-blur-sm rounded-full shadow-sm">
              {t.hero.badge}
            </span>
          </motion.div>

          <motion.h1 
            variants={itemVariants} 
            className="font-serif text-5xl md:text-7xl font-normal tracking-tight mb-10 text-[#38312E] text-pretty leading-[1.05]"
          >
            {t.hero.title} <br/>
            <span className="italic text-[#D97757]">{t.hero.titleAccent}</span>
          </motion.h1>

          <motion.p 
            variants={itemVariants} 
            className="text-lg md:text-xl font-serif italic text-[#8A857D] max-w-[650px] mx-auto mb-14 leading-relaxed text-pretty opacity-90"
          >
            {t.hero.description}
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              href="/support"
              className="btn-primary group w-full sm:w-auto"
            >
              {t.hero.getStarted}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 ml-2" />
            </Link>
            <Link
              href="/dashboard"
              className="btn-secondary w-full sm:w-auto"
            >
              {t.hero.viewDashboard}
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="w-full max-w-[1200px] mx-auto px-6 py-40 border-t border-[#E5E0D8]/60">
        <div className="text-center mb-20">
          <div className="text-[#D97757] text-[11px] font-bold uppercase tracking-[0.4em] mb-4">
            {t.features.title}
          </div>
          <h2 className="font-serif text-4xl text-[#38312E] mb-6">
            {t.features.subtitle}
          </h2>
          <p className="text-[#8A857D] text-lg max-w-[550px] mx-auto font-serif italic">
            {t.features.description}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {features.map(({ icon: Icon, title, desc, color }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="document-card p-12 flex flex-col items-center text-center group"
            >
              <div 
                className={`w-16 h-16 rounded-[24px] flex items-center justify-center mb-10 transition-transform duration-500 group-hover:scale-110 ${color}`}
              >
                <Icon className="w-7 h-7 text-[#38312E]" strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-serif font-bold text-[#38312E] mb-4 tracking-tight">
                {title}
              </h3>
              <p className="text-[#8A857D] leading-relaxed font-serif opacity-80">
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
