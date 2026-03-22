"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, Brain, Layers, Code2, ArrowRight } from "lucide-react";

const cards = [
  {
    title: "Getting Started",
    icon: BookOpen,
    desc: "Understand what ARIA is and submit your first ticket.",
    href: "/docs/getting-started",
    color: "#CC5500",
    bg: "bg-[#CC5500]/5",
  },
  {
    title: "Agent Intelligence",
    icon: Brain,
    desc: "How Groq LLaMA-3.3 processes and responds to customers.",
    href: "/docs/agent-intelligence",
    color: "#4A7C59",
    bg: "bg-[#4A7C59]/5",
  },
  {
    title: "Channel Integration",
    icon: Layers,
    desc: "WhatsApp, Gmail, and Web Form setup and Kafka routing.",
    href: "/docs/channels",
    color: "#4A5D4E",
    bg: "bg-[#4A5D4E]/5",
  },
  {
    title: "Developer API",
    icon: Code2,
    desc: "REST endpoints, webhook verification, live playground.",
    href: "/docs/api-hooks",
    color: "#D97757",
    bg: "bg-[#D97757]/5",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

export default function DocsPage() {
  return (
    <div className="flex flex-col w-full max-w-[900px]">
      
      {/* Decorative Hero Area */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#EDE8DF] to-[#F5F0E8] border border-[#DDD8CF] rounded-3xl p-10 md:p-14 mb-16 shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#CC5500] opacity-5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#4A7C59] opacity-[0.03] rounded-full blur-[60px] translate-y-1/4 -translate-x-1/4"></div>
        
        <div className="relative z-10 w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-white/50 border border-[#DDD8CF] text-[#CC5500] text-[0.75rem] font-bold tracking-[0.1em] uppercase shadow-sm"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            <span className="w-2 h-2 rounded-full bg-[#CC5500] animate-pulse"></span>
            Documentation Hub
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-[2.5rem] md:text-[3.5rem] font-black text-[#1A1612] leading-[1.1] mb-6"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900 }}
          >
            Welcome to <br className="hidden md:block"/> ARIA Docs
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-[#6B6459] text-[1.125rem] md:text-[1.25rem] max-w-[540px] leading-relaxed"
            style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 300 }}
          >
            Everything you need to understand, integrate, and extend the autonomous Customer Intelligence Platform.
          </motion.p>
        </div>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 gap-6"
      >
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <motion.div variants={item} key={card.title} className="h-full">
              <Link
                href={card.href}
                className="group relative flex flex-col justify-between h-full bg-[#EDE8DF]/40 backdrop-blur-sm border border-[#DDD8CF] hover:border-[#CC5500]/50 hover:bg-white rounded-[20px] p-8 transition-all duration-300 hover:shadow-[0_12px_40px_-10px_rgba(204,85,0,0.12)] hover:-translate-y-1 overflow-hidden"
              >
                {/* Background Accent On Hover */}
                <div className={`absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${card.bg}`} />
                
                <div className="relative z-10">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-white/40 ${card.bg}`}>
                    <Icon
                      className="w-6 h-6"
                      style={{ color: card.color || "#1A1612" }}
                      strokeWidth={1.5}
                    />
                  </div>
                  
                  <h3
                    className="text-[1.3rem] text-[#1A1612] mb-3 font-bold group-hover:text-[#CC5500] transition-colors"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {card.title}
                  </h3>
                  <p
                    className="text-[#6B6459] text-[0.95rem] leading-[1.6] mb-6"
                    style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 400 }}
                  >
                    {card.desc}
                  </p>
                </div>
                
                <div className="relative z-10 mt-auto pt-4 border-t border-[#DDD8CF]/50 flex items-center gap-2 text-[0.85rem] font-bold text-[#6B6459] group-hover:text-[#CC5500] uppercase tracking-wide transition-colors" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Explore 
                  <ArrowRight className="w-4 h-4 translate-x-0 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
