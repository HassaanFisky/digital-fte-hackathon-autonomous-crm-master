"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Sparkles, Loader2, Bookmark, MessageCircle, Bot, Eraser } from "lucide-react";
import { useLanguage } from "./LanguageProvider";
import { useAiraAgent } from "@/lib/hooks/useAiraAgent";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface AiraAssistantProps {
  platform: "H0" | "H1" | "H2" | "H3" | "H4";
  context: string;
}

export function AiraAssistant({ platform, context }: AiraAssistantProps) {
  const { language, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "notebook">("chat");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { runAgent, isLoading: isAgentLoading, error: agentError, result: agentResult } = useAiraAgent();

  // Sync with ActionDock toggle
  useEffect(() => {
    const handleToggle = () => setIsOpen(prev => !prev);
    window.addEventListener('toggle-aira', handleToggle);
    return () => window.removeEventListener('toggle-aira', handleToggle);
  }, []);

  // Persistence (The Study Notebook feature)
  useEffect(() => {
    const saved = localStorage.getItem(`aira-session-${platform}`);
    if (saved) {
      setMessages(JSON.parse(saved));
    } else {
      setMessages([{ 
        role: "assistant", 
        content: t.aira.greeting,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }
  }, [platform, t.aira.greeting]);

  // Effect to handle agent result when it updates
  useEffect(() => {
    if (agentResult) {
      const assistantMsg: Message = { 
        role: "assistant", 
        content: agentResult,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, assistantMsg]);
    }
  }, [agentResult]);

  // Effect to handle agent error
  useEffect(() => {
    if (agentError) {
      const errorMsg: Message = { 
        role: "assistant", 
        content: `Error: ${agentError}. Please check your connection or HF_TOKEN.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    }
  }, [agentError]);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(`aira-session-${platform}`, JSON.stringify(messages));
    }
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, messages.length, platform]);

  const handleSend = async () => {
    if (!input.trim() || isAgentLoading) return;

    const currentInput = input;
    const userMsg: Message = { 
      role: "user", 
      content: currentInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    
    // Execute real agent logic
    await runAgent(currentInput, platform === "H1" ? "architect" : "marketing");
  };

  const clearSession = () => {
    const defaultMsg: Message = { 
      role: "assistant", 
      content: t.aira.greeting,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([defaultMsg]);
    localStorage.removeItem(`aira-session-${platform}`);
  };

  return (
    <div className="fixed bottom-[100px] right-[40px] z-[9999]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            className="w-[420px] max-w-[90vw] h-[650px] max-h-[80vh] flex flex-col bg-[#FAF9F6]/98 backdrop-blur-3xl border-[0.8px] border-[#E5E0D8] rounded-[32px] overflow-hidden shadow-[0_32px_120px_-12px_rgba(45,41,38,0.22)]"
          >
            {/* Header: High-Fidelity Humanist */}
            <div className="px-8 py-6 border-b border-[#E5E0D8]/60 bg-white/40 flex items-center justify-between">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold tracking-[0.3em] text-[#D97757] uppercase font-mono">
                    {platform === "H1" ? "Architect Node" : "Marketing Node"}
                  </span>
                  <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isAgentLoading ? 'bg-orange-500' : 'bg-emerald-500'}`} />
                </div>
                <h3 className="text-xl font-serif font-bold text-[#38312E] mt-0.5">Aira Assistant</h3>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-10 h-10 rounded-full bg-white/80 border border-[#E5E0D8]/60 flex items-center justify-center text-[#8A857D] hover:text-[#38312E] hover:border-[#D97757]/40 transition-all active:scale-90"
              >
                <X size={18} />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="mx-8 mt-4 flex border-[0.8px] border-[#E5E0D8] rounded-2xl p-1 bg-[#F0EBE1]/30">
              <button 
                onClick={() => setActiveTab('chat')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all ${
                  activeTab === 'chat' ? 'bg-white text-[#D97757] shadow-sm' : 'text-[#8A857D] hover:text-[#38312E]'
                }`}
              >
                <MessageCircle size={14} strokeWidth={2.4} /> Chat Protocol
              </button>
              <button 
                onClick={() => setActiveTab('notebook')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all ${
                  activeTab === 'notebook' ? 'bg-white text-[#D97757] shadow-sm' : 'text-[#8A857D] hover:text-[#38312E]'
                }`}
              >
                <Bookmark size={14} strokeWidth={2.4} /> Study Notebook
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6 scrollbar-hide">
              {activeTab === 'chat' ? (
                <>
                  {messages.map((msg, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div className={`max-w-[85%] px-5 py-4 rounded-[22px] text-sm leading-relaxed ${
                        msg.role === 'user' 
                        ? 'bg-[#D97757] text-white rounded-tr-none shadow-[0_8px_24px_-4px_rgba(217,119,87,0.35)]' 
                        : 'bg-white border-[0.8px] border-[#E5E0D8] text-[#38312E] rounded-tl-none font-serif italic shadow-sm'
                      }`}>
                        {msg.content}
                      </div>
                      <span className="text-[9px] font-bold text-[#8A857D] mt-2 tracking-widest uppercase opacity-60 px-1">{msg.timestamp}</span>
                    </motion.div>
                  ))}
                  {isAgentLoading && (
                    <div className="flex items-center gap-2 text-[#8A857D] font-serif italic text-xs animate-pulse">
                      <Loader2 size={12} className="animate-spin" /> {t.aira.typing}
                    </div>
                  )}
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                   <div className="w-16 h-16 bg-[#F0EBE1] rounded-[24px] flex items-center justify-center text-[#D97757]">
                      <Bot size={32} strokeWidth={1.5} />
                   </div>
                   <h4 className="font-serif text-lg font-bold text-[#38312E]">Persistent Intelligence</h4>
                   <p className="text-xs text-[#8A857D] leading-relaxed max-w-[240px]">This notebook persists across all sessions, documenting your progress as an Architect.</p>
                   
                   <div className="w-full bg-white border border-[#E5E0D8] rounded-2xl p-4 text-left space-y-2">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-[#D97757] uppercase tracking-widest opacity-60"><Bookmark size={10}/> Last Log Entry</div>
                      <p className="text-xs font-serif italic text-[#38312E] opacity-80">"{messages[messages.length-1]?.content.substring(0, 80)}..."</p>
                   </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Footer */}
            <div className="p-8 border-t border-[#E5E0D8]/60 bg-white/40">
              <div className="relative group">
                <input 
                  type="text"
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  onChange={(e) => setInput(e.target.value)}
                  value={input}
                  placeholder={t.aira.placeholder}
                  className="w-full pl-6 pr-24 py-4 rounded-2xl bg-white border-[0.8px] border-[#E5E0D8] text-sm text-[#38312E] focus:outline-none focus:border-[#D97757]/80 focus:shadow-[0_0_0_4px_rgba(217,119,87,0.06)] transition-all placeholder:text-[#8A857D]/60"
                  disabled={isAgentLoading}
                />
                
                <div className="absolute right-2 top-2 bottom-2 flex items-center gap-2">
                  <button 
                    onClick={clearSession}
                    title="Terminate Protocol Context"
                    className="w-10 h-full rounded-xl flex items-center justify-center text-[#8A857D] hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                    disabled={isAgentLoading}
                  >
                    <Eraser size={16} />
                  </button>
                  <button 
                    onClick={handleSend}
                    className={`px-4 h-full bg-[#D97757] text-white rounded-xl shadow-lg shadow-[#D97757]/20 hover:bg-[#8C3F2F] transition-all flex items-center justify-center active:scale-95 ${isAgentLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={isAgentLoading}
                  >
                    {isAgentLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} strokeWidth={2.4} />}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
