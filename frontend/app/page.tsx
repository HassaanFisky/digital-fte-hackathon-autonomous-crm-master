"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, MessageSquare, Globe } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const features = [
  {
    icon: Mail,
    title: "Email",
    desc: "Auto-monitored Gmail threads with formal AI responses.",
  },
  {
    icon: MessageSquare,
    title: "WhatsApp",
    desc: "Real-time Twilio integration for instant customer messaging.",
  },
  {
    icon: Globe,
    title: "Web Form",
    desc: "Structured ticket intake with smart priority routing.",
  },
];

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col bg-slate-950 overflow-x-hidden">
      <Navbar />

      {/* Hero */}
      <section className="flex flex-col items-center text-center justify-center min-h-screen px-6 pt-24 pb-32 max-w-5xl mx-auto w-full">
        <motion.h1
          className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.08] mb-6"
          style={{ fontSize: "clamp(2.5rem, 7vw, 4.5rem)" }}
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          Customer Support.{" "}
          <span className="text-emerald-500">Handled.</span>
        </motion.h1>

        <motion.p
          className="text-lg text-slate-400 max-w-xl mb-12 leading-relaxed"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.12 }}
        >
          ARIA resolves every ticket across Email, WhatsApp &amp; Web. Instantly.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.24 }}
        >
          <Link
            href="/support"
            className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-lg rounded-xl transition-colors duration-200 shadow-[0_0_32px_rgba(16,185,129,0.3)] hover:shadow-[0_0_48px_rgba(16,185,129,0.45)]"
          >
            Get Started
            <span className="ml-1">→</span>
          </Link>
        </motion.div>
      </section>

      {/* Feature Cards */}
      <section className="w-full max-w-5xl mx-auto px-6 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {features.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut", delay: i * 0.1 }}
              className="p-6 bg-slate-800 border border-slate-700 rounded-2xl hover:border-emerald-500/40 transition-colors duration-300"
            >
              <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-emerald-500" />
              </div>
              <h3 className="text-white font-semibold text-base mb-1">{title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
