"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Lock, Shield, Key, UserCheck, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const accordions = [
  {
    title: "Encryption",
    content: "PostgreSQL data encrypted at rest with AES-256. All API calls over TLS 1.3. Credentials stored as environment variables — never in code or git history. Neon PostgreSQL enforces SSL with sslmode=require."
  },
  {
    title: "Message Security",
    content: "Confluent Kafka uses SASL_SSL with PLAIN mechanism. API key + secret required for all producers and consumers. Consumer group isolation prevents cross-customer data leaks. Dead letter queue (fte.dlq) captures failed messages for review."
  },
  {
    title: "AI Guardrails",
    content: "Temperature clamped to 0.3 — balances empathy and reliability. System prompt explicitly prohibits pricing discussion, refund processing, and promises about unconfirmed features. All agent responses routed through send_response tool — no raw LLM output ever reaches customers directly. Knowledge base search enforced before answering product questions."
  },
  {
    title: "Human-in-the-Loop Gates",
    content: "Every escalated ticket requires human approval before action. Approval files written to /vault/Pending_Approval/. Agent will not proceed until file moved to /Approved. All actions logged to audit_log table with timestamp, actor, target, parameters, and result. Payments > $100 always require explicit human approval."
  }
];

export default function SecurityPage() {
  const [timestamp, setTimestamp] = useState<string>("");
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  useEffect(() => {
    fetch("https://spotty-agneta-hassaanfisky-2a742a92.koyeb.app/api/v1/health")
      .then(res => res.json())
      .then(data => {
        if (data.timestamp) setTimestamp(data.timestamp);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F0E8] text-[#1A1612]">
      <Navbar />

      <main className="flex-1 w-full max-w-[900px] mx-auto px-6 py-32 md:py-40 relative">
        {timestamp && (
          <div 
            className="absolute top-28 right-6 text-[0.8rem] text-[#6B6459]"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            Last System Check: {new Date(timestamp).toLocaleString()}
          </div>
        )}

        <h1
          className="text-[2.5rem] md:text-[3.5rem] font-black text-[#1A1612] leading-tight mb-4"
          style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900 }}
        >
          Security & Trust Center
        </h1>
        <p
          className="text-[#6B6459] text-[1.25rem] mb-16 leading-relaxed max-w-[600px]"
          style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 300 }}
        >
          ARIA is built on enterprise-grade security primitives.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-16">
          {[
            { label: "Encryption at Rest", value: "AES-256", icon: Lock },
            { label: "In Transit", value: "TLS 1.3", icon: Shield },
            { label: "Kafka Security", value: "SASL/SSL", icon: Key },
            { label: "Escalation Gate", value: "Human Required", icon: UserCheck },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="bg-[#EDE8DF] border border-[#DDD8CF] rounded-lg p-8 shadow-sm">
                <Icon className="w-8 h-8 text-[#1A1612] mb-6" strokeWidth={1.5} />
                <div
                  className="text-[2rem] font-black text-[#CC5500] leading-none mb-2"
                  style={{ fontFamily: "'Playfair Display', serif", fontWeight: 800 }}
                >
                  {card.value}
                </div>
                <div
                  className="text-[0.85rem] font-bold tracking-wide text-[#6B6459] uppercase"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {card.label}
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-4">
          {accordions.map((acc, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div key={idx} className="overflow-hidden">
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between text-left bg-[#EDE8DF] border border-[#DDD8CF] rounded-md px-5 py-4 cursor-pointer hover:border-[#CC5500] transition-colors"
                >
                  <span
                    className="text-[1.1rem] text-[#1A1612]"
                    style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
                  >
                    {acc.title}
                  </span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-5 h-5 text-[#6B6459]" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="border-x border-b border-[#DDD8CF] bg-[#F5F0E8] rounded-b-md -mt-1"
                    >
                      <div
                        className="px-6 py-5 text-[#6B6459] text-[0.95rem] leading-[1.7]"
                        style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 300 }}
                      >
                        {acc.content}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

      </main>

      <Footer />
    </div>
  );
}
