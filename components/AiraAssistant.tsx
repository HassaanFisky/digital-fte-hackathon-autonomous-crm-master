"use client";
/**
 * AiraAssistant — H4 Autonomous AI Interface
 * v5.0: Hybrid streaming (WebLLM on-device → Groq SSE fallback), multi-agent routing,
 *       routing badge, streaming bubble with cursor, aira-prefill event, WebLLM status dot.
 *
 * Preserves all existing structure. Existing useAiraAgent is kept for
 * classifier/suggester calls (non-streaming, backward compat).
 */
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Sparkles, Loader2, Bookmark, MessageCircle, Bot, Eraser } from "lucide-react";
import { useLanguage } from "./LanguageProvider";
import { useAiraAgent } from "@/lib/hooks/useAiraAgent";
import { useHybridAgent } from "@/lib/hooks/useHybridAgent";
import { useWebLLM } from "@/lib/hooks/useWebLLM";

export type AgentType = "support" | "classifier" | "suggester" | "analyst" | "escalation";

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
  const [activeTab, setActiveTab] = useState<"chat" | "notebook">("chat");
  const [notes, setNotes] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Legacy hook — used for classifier/suggester (non-streaming)
  const { runAgent, isLoading: isLegacyLoading, error: legacyError, result: legacyResult } = useAiraAgent();

  // New hybrid hook — primary chat path (WebLLM → Groq SSE)
  const { tokens, isStreaming, source, routedTo, error: hybridError, sendMessage, reset } = useHybridAgent();

  // WebLLM status for header indicator
  const { status: webLLMStatus, progress: webLLMProgress } = useWebLLM();

  // ── Global Event Bus ───────────────────────────────────────────────────────
  useEffect(() => {
    const handleToggle = () => setIsOpen(prev => !prev);
    const handleNotebook = () => { setIsOpen(true); setActiveTab("notebook"); };

    // aira-prefill: fired by CommandPalette to auto-send a command
    const handlePrefill = (e: Event) => {
      const { query, agentType } = (e as CustomEvent<{ query: string; agentType: string }>).detail;
      setInput(query);
      setIsOpen(true);
      setActiveTab("chat");
      // Short delay to let the panel animate open
      setTimeout(() => {
        sendMessage(query, agentType as "auto" | "support" | "research" | "sales" | "technical");
      }, 160);
    };

    window.addEventListener("toggle-chat", handleToggle);
    window.addEventListener("toggle-aira", handleToggle);
    window.addEventListener("toggle-notebook", handleNotebook);
    window.addEventListener("aira-prefill", handlePrefill);

    return () => {
      window.removeEventListener("toggle-chat", handleToggle);
      window.removeEventListener("toggle-aira", handleToggle);
      window.removeEventListener("toggle-notebook", handleNotebook);
      window.removeEventListener("aira-prefill", handlePrefill);
    };
  }, [sendMessage]);

  // ── Persistence ───────────────────────────────────────────────────────────
  useEffect(() => {
    const savedMessages = localStorage.getItem(`aira-session-${platform}`);
    const savedNotes = localStorage.getItem(`aira-notes-${platform}`);

    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    } else {
      setMessages([{
        role: "assistant",
        content: t.aira?.greeting || `Greetings. I am Aira, synchronized with the ${platform} node.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }]);
    }
    if (savedNotes) setNotes(savedNotes);
  }, [platform, language, t.aira?.greeting]);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(`aira-session-${platform}`, JSON.stringify(messages));
    }
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, platform]);

  useEffect(() => {
    localStorage.setItem(`aira-notes-${platform}`, notes);
  }, [notes, platform]);

  // ── Commit streamed tokens to messages when streaming ends ────────────────
  const prevIsStreaming = useRef(false);
  useEffect(() => {
    if (prevIsStreaming.current && !isStreaming && tokens) {
      const assistantMsg: Message = {
        role: "assistant",
        content: tokens,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages(prev => [...prev, assistantMsg]);
      reset();
      setInput("");
    }
    prevIsStreaming.current = isStreaming;
  }, [isStreaming, tokens, reset]);

  // ── Legacy result handler (for non-streaming classifier etc.) ─────────────
  useEffect(() => {
    if (legacyResult) {
      const assistantMsg: Message = {
        role: "assistant",
        content: typeof legacyResult === "string" ? legacyResult : JSON.stringify(legacyResult, null, 2),
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages(prev => [...prev, assistantMsg]);
    }
  }, [legacyResult]);

  useEffect(() => {
    if (legacyError) {
      const errorMsg: Message = {
        role: "assistant",
        content: `Agent Protocol Error: ${legacyError}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages(prev => [...prev, errorMsg]);
    }
  }, [legacyError]);

  useEffect(() => {
    if (hybridError) {
      const errorMsg: Message = {
        role: "assistant",
        content: `Stream Error: ${hybridError}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages(prev => [...prev, errorMsg]);
    }
  }, [hybridError]);

  // ── Send message ──────────────────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    if (!input.trim() || isStreaming || isLegacyLoading) return;

    const currentInput = input;
    const userMsg: Message = {
      role: "user",
      content: currentInput,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    // Use hybrid agent (WebLLM → Groq SSE) for all chat messages
    await sendMessage(currentInput, "auto");
  }, [input, isStreaming, isLegacyLoading, sendMessage]);

  const clearSession = () => {
    const defaultMsg: Message = {
      role: "assistant",
      content: t.aira?.greeting || `Greetings. I am Aira, synchronized with the ${platform} node.`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages([defaultMsg]);
    reset();
    localStorage.removeItem(`aira-session-${platform}`);
  };

  // ── WebLLM status indicator in header ────────────────────────────────────
  const webLLMLabel = () => {
    switch (webLLMStatus) {
      case "ready":       return { text: "⬡ ON-DEVICE", color: "text-emerald-500" };
      case "loading":     return { text: `⬡ ${webLLMProgress}%`, color: "text-amber-500" };
      case "unsupported": return { text: "⬡ CLOUD", color: "text-text-muted" };
      default:            return { text: "⬡ INIT", color: "text-text-muted" };
    }
  };
  const wllm = webLLMLabel();
  const isActivelyLoading = isStreaming || isLegacyLoading;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[10000]"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-4 md:inset-x-0 bottom-24 md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-full md:w-[560px] md:h-[780px] max-h-[92vh] glass-apple rounded-[2.5rem] shadow-float z-[10001] flex flex-col overflow-hidden border border-white/20 dark:border-white/8"
          >
            {/* Header */}
            <div className="px-7 py-4 border-b border-border-fine bg-bg-base/40 flex items-center justify-between">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold tracking-[0.3em] text-accent uppercase font-mono">
                    {platform} NODE REGISTRY
                  </span>
                  <div className={`w-1.5 h-1.5 rounded-full ${isActivelyLoading ? "bg-accent animate-pulse" : "bg-emerald-500"}`} />
                  <span className={`text-[8px] font-mono font-bold ${wllm.color} ml-1`}>{wllm.text}</span>
                </div>
                <h3 className="text-xl font-serif font-bold text-text-primary mt-0.5">Aira Assistant</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-10 h-10 rounded-full bg-white/10 border border-border-fine flex items-center justify-center text-text-muted hover:text-text-primary transition-all active:scale-90"
              >
                <X size={18} />
              </button>
            </div>

            {/* Tabs */}
            <div className="mx-8 mt-4 flex border border-border-fine rounded-2xl p-1 bg-bg-elevated/30">
              <button
                onClick={() => setActiveTab("chat")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === "chat" ? "bg-bg-base text-accent shadow-sm" : "text-text-muted hover:text-text-primary"}`}
              >
                <MessageCircle size={14} strokeWidth={2.4} /> Protocol
              </button>
              <button
                onClick={() => setActiveTab("notebook")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === "notebook" ? "bg-bg-base text-accent shadow-sm" : "text-text-muted hover:text-text-primary"}`}
              >
                <Bookmark size={14} strokeWidth={2.4} /> Notebook
              </button>
            </div>

            {/* Routing badge */}
            <AnimatePresence>
              {routedTo && isStreaming && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="mx-7 mt-3 px-3 py-1.5 rounded-xl bg-accent/10 border border-accent/20 flex items-center gap-2"
                >
                  <Sparkles size={10} className="text-accent" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-accent">
                    Routed → {routedTo} Agent
                    {source === "webllm" ? " · On-Device" : " · Cloud"}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Content area */}
            <div className="flex-1 overflow-y-auto px-7 py-4 space-y-5 scrollbar-hide">
              {activeTab === "chat" ? (
                <>
                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                      className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                    >
                      <div className={`max-w-[85%] px-5 py-4 rounded-[22px] text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-accent text-white rounded-tr-none shadow-sm"
                          : "bg-bg-elevated/60 border border-border-fine text-text-secondary rounded-tl-none font-serif italic shadow-sm"
                      }`}>
                        {msg.content}
                      </div>
                      <span className="text-[8px] font-bold text-text-muted mt-2 tracking-widest uppercase opacity-60 px-1">
                        {msg.timestamp}
                      </span>
                    </motion.div>
                  ))}

                  {/* Streaming bubble */}
                  <AnimatePresence>
                    {isStreaming && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-start"
                      >
                        <div className="max-w-[85%] px-5 py-4 rounded-[22px] bg-bg-elevated/60 border border-border-fine text-text-secondary rounded-tl-none font-serif italic shadow-sm text-sm leading-relaxed">
                          {tokens || (
                            <span className="flex items-center gap-2 text-[10px]">
                              <Loader2 size={12} className="animate-spin text-accent" />
                              Aira is synthesizing...
                            </span>
                          )}
                          {tokens && (
                            <span className="inline-block w-1.5 h-4 bg-accent/60 ml-0.5 align-middle animate-pulse rounded-sm" />
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <div className="h-full flex flex-col space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-bg-surface rounded-lg flex items-center justify-center text-accent shadow-sm border border-border-fine">
                        <Bot size={18} />
                      </div>
                      <h4 className="font-serif text-sm font-bold text-text-primary">Architect Notes</h4>
                    </div>
                    <span className="text-[8px] font-bold text-text-muted uppercase tracking-widest bg-bg-elevated px-2 py-1 rounded">
                      Persistent Sync
                    </span>
                  </div>

                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Log your research findings, architecture decisions, or module progress here..."
                    className="flex-1 w-full bg-bg-elevated/40 border border-border-fine rounded-2xl p-6 text-sm text-text-secondary leading-relaxed focus:outline-none focus:border-accent/40 resize-none font-serif italic scrollbar-hide"
                  />

                  <div className="flex items-center gap-2 text-[9px] font-bold text-text-muted uppercase tracking-widest opacity-60 px-2 pb-2">
                    <Sparkles size={10} className="text-accent" /> Notes are auto-synced to your local node.
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input footer */}
            <div className="p-8 border-t border-border-fine bg-bg-base/30 backdrop-blur-md">
              <div className="relative group">
                <input
                  type="text"
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  onChange={(e) => setInput(e.target.value)}
                  value={input}
                  placeholder={t.aira?.placeholder || "Ask Aira anything..."}
                  className="w-full pl-6 pr-24 py-4 rounded-2xl bg-bg-surface border border-border-fine text-sm text-text-primary focus:outline-none focus:border-accent/40 focus:shadow-inner transition-all placeholder:text-text-muted/40"
                  disabled={isActivelyLoading}
                />

                <div className="absolute right-2 top-2 bottom-2 flex items-center gap-2">
                  <button
                    onClick={clearSession}
                    title="Terminate Protocol Context"
                    className="w-10 h-full rounded-xl flex items-center justify-center text-text-muted hover:text-error hover:bg-error/10 transition-all opacity-0 group-hover:opacity-100"
                    disabled={isActivelyLoading}
                  >
                    <Eraser size={16} />
                  </button>
                  <button
                    onClick={handleSend}
                    className={`px-4 h-full bg-accent text-white rounded-xl shadow-md shadow-accent/20 hover:brightness-110 transition-all flex items-center justify-center active:scale-95 ${isActivelyLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                    disabled={isActivelyLoading}
                  >
                    {isActivelyLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} strokeWidth={2.4} />}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
