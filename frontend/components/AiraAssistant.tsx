"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Sparkles, Loader2 } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AiraAssistantProps {
  platform: "H0" | "H1" | "H2" | "H3" | "H4";
  context: string;
}

export function AiraAssistant({ platform, context }: AiraAssistantProps) {
  const { lang, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: "assistant", 
      content: `Greetings. I am Aira, synchronized with the ${platform} platform. How can I facilitate your productivity today?` 
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    const handleToggle = () => setIsOpen(prev => !prev);
    window.addEventListener("toggle-chat", handleToggle);
    return () => window.removeEventListener("toggle-chat", handleToggle);
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
          context: context,
        }),
      });

      const data = await response.json();

      if (data.error) {
         setMessages(prev => [...prev, { 
          role: "assistant", 
          content: `Protocol Error: ${data.error}. Please ensure environment variables are synchronized.` 
        }]);
      } else {
        setMessages(prev => [...prev, { role: "assistant", content: data.content }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "Core Protocol Failure: I am unable to connect to the intelligence node." 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[10000]"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 40 }}
            className="fixed inset-x-4 md:inset-x-0 bottom-24 md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-full md:w-[600px] h-[600px] max-h-[80vh] glass-apple rounded-[2.5rem] shadow-float z-[10001] flex flex-col overflow-hidden border-white/20 dark:border-white/10"
          >
            <div className="px-8 py-6 border-b border-border-fine flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                   <Sparkles size={20} className="animate-pulse" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-text-primary">Aira Intelligence</span>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-accent opacity-80">{platform} Node Registry</span>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-10 h-10 rounded-full hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-center text-text-muted transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 flex flex-col gap-8 scrollbar-hide">
              {messages.map((msg, i) => (
                <div 
                  key={i} 
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[85%] rounded-[1.5rem] px-6 py-4 text-sm leading-relaxed shadow-sm ${
                    msg.role === "user" 
                      ? "bg-accent text-white font-medium" 
                      : "bg-bg-elevated/60 text-text-secondary font-serif italic border border-border-fine"
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-bg-elevated/40 rounded-full px-4 py-3 flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin text-accent" />
                    <span className="text-[10px] uppercase tracking-widest font-bold text-text-muted">Aira is thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-8 border-t border-border-fine bg-bg-base/30 backdrop-blur-md">
              <div className="relative flex items-center">
                <input 
                  autoFocus
                  className="w-full bg-white dark:bg-black/20 border border-border-fine rounded-2xl px-6 py-4 text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent/40 shadow-inner transition-colors"
                  placeholder="Ask Aira anything about this platform..."
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  onChange={(e) => setInput(e.target.value)}
                  value={input}
                />
                <button 
                  onClick={handleSend}
                  className="absolute right-3 w-10 h-10 bg-accent text-white rounded-xl flex items-center justify-center hover:brightness-110 active:scale-95 transition-all shadow-md shadow-accent/20"
                >
                  <Send size={18} />
                </button>
              </div>
              <div className="mt-4 flex justify-between px-2">
                 <span className="text-[8px] font-bold uppercase tracking-widest text-text-muted opacity-40">Agent Arch v4.0.2</span>
                 <span className="text-[8px] font-bold uppercase tracking-widest text-text-muted opacity-40">Secured Node Connection</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
