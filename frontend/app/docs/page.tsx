"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, Brain, Layers, Code2 } from "lucide-react";

const cards = [
  {
    title: "Getting Started",
    icon: BookOpen,
    desc: "Understand what ARIA is and submit your first ticket.",
    href: "/docs/getting-started",
    color: "#CC5500",
  },
  {
    title: "Agent Intelligence",
    icon: Brain,
    desc: "How Groq LLaMA-3.3 processes and responds to customers.",
    href: "/docs/agent-intelligence",
  },
  {
    title: "Channel Integration",
    icon: Layers,
    desc: "WhatsApp, Gmail, and Web Form setup and Kafka routing.",
    href: "/docs/channels",
  },
  {
    title: "Developer API",
    icon: Code2,
    desc: "REST endpoints, webhook verification, live playground.",
    href: "/docs/api-hooks",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};

export default function DocsPage() {
  return (
    <div className="flex flex-col max-w-[800px]">
      <div
        className="text-[0.8rem] font-bold tracking-[0.1em] text-[#9E948A] uppercase mb-4"
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      >
        DOCUMENTATION
      </div>

      <h1
        className="text-[2.5rem] font-black text-[#1A1612] leading-tight mb-4"
        style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900 }}
      >
        Welcome to ARIA Docs
      </h1>

      <p
        className="text-[#6B6459] text-[1.125rem] mb-12 max-w-[600px] leading-relaxed"
        style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 300 }}
      >
        Everything you need to understand, integrate, and extend the ARIA Customer
        Intelligence Platform.
      </p>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 gap-6"
      >
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <motion.div variants={item} key={card.title}>
              <Link
                href={card.href}
                className="group block bg-[#EDE8DF] border border-[#DDD8CF] rounded-[8px] p-6 hover:-translate-y-[2px] hover:border-[#CC5500] transition-all duration-200"
              >
                <div className="mb-4">
                  <Icon
                    className="w-8 h-8"
                    style={{ color: card.color || "#1A1612" }}
                    strokeWidth={1.5}
                  />
                </div>
                <h3
                  className="text-[1.25rem] text-[#1A1612] mb-2 font-bold"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {card.title}
                </h3>
                <p
                  className="text-[#6B6459] text-[0.95rem] leading-relaxed"
                  style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 400 }}
                >
                  {card.desc}
                </p>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
