"use client";

/**
 * CompanionChat — Right-pane chat interface for the Companion Window.
 *
 * Fully migrated from AiraAssistant v5.0, preserving:
 *   • useHybridAgent (WebLLM → Groq SSE streaming)
 *   • useAiraAgent   (legacy non-streaming classifier/suggester)
 *   • useWebLLM      (on-device status dot + progress)
 *   • Routing badge  (routedTo agent + source while streaming)
 *   • Streaming bubble with cursor pulse
 *   • aira-prefill event listener
 *   • Dual tabs: Protocol (chat) | Notebook
 *
 * Key change vs AiraAssistant: this component does NOT own `isOpen`.
 * It receives `session` and calls `onUpdateMessages` instead of writing
 * to a local messages array.
 */

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Send,
  Sparkles,
  Loader2,
  Bookmark,
  MessageCircle,
  Bot,
  Eraser,
  PanelLeftOpen,
  PanelLeftClose,
} from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { useAiraAgent } from "@/lib/hooks/useAiraAgent";
import { useHybridAgent } from "@/lib/hooks/useHybridAgent";
import { useWebLLM } from "@/lib/hooks/useWebLLM";
import type { CompanionSession, CompanionMessage, CompanionPlatform } from "@/types/companion";

interface CompanionChatProps {
  platform:        CompanionPlatform;
  context:         string;
  session:         CompanionSession | null;
  onUpdateMessages:(messages: CompanionMessage[]) => void;
  onClose:         () => void;
  sidebarOpen:     boolean;
  onToggleSidebar: () => void;
}

const GREETING = (platform: CompanionPlatform): CompanionMessage => ({
  role:      "assistant",
  content:   `Greetings, Architect. I am Aira, synchronised with the ${platform} node.`,
  timestamp: new Date().toISOString(),
});

export function CompanionChat({
  platform,
  context,
  session,
  onUpdateMessages,
  onClose,
  sidebarOpen,
  onToggleSidebar,
}: CompanionChatProps) {
  const { language, t } = useLanguage();

  const [input,     setInput]     = useState("");
  const [activeTab, setActiveTab] = useState<"chat" | "notebook">("chat");
  const [notes,     setNotes]     = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef       = useRef<HTMLInputElement>(null);

  // ── Legacy hook (classifier / suggester — non-streaming) ─────────────────
  const {
    runAgent,
    isLoading:  isLegacyLoading,
    error:      legacyError,
    result:     legacyResult,
  } = useAiraAgent();

  // ── Primary streaming hook (WebLLM → Groq SSE) ───────────────────────────
  const {
    tokens,
    isStreaming,
    source,
    routedTo,
    error:      hybridError,
    sendMessage,
    reset,
  } = useHybridAgent();

  // ── WebLLM on-device status ───────────────────────────────────────────────
  const { status: webLLMStatus, progress: webLLMProgress } = useWebLLM();

  const messages = session?.messages ?? [];

  // ── Scroll to latest message ──────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming, tokens]);

  // ── Focus input on open ───────────────────────────────────────────────────
  useEffect(() => {
    if (activeTab === "chat") inputRef.current?.focus();
  }, [activeTab]);

  // ── Persist notes ─────────────────────────────────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem(`aira-notes-${platform}`);
    if (saved) setNotes(saved);
  }, [platform]);

  useEffect(() => {
    localStorage.setItem(`aira-notes-${platform}`, notes);
  }, [notes, platform]);

  // ── aira-prefill event → auto-populate input and send ─────────────────────
  useEffect(() => {
    const handler = (e: Event) => {
      const { query, agentType } = (
        e as CustomEvent<{ query: string; agentType: string }>
      ).detail ?? {};
      if (!query) return;
      setInput(query);
      setActiveTab("chat");
      setTimeout(() => {
        sendMessage(query, (agentType ?? "auto") as "auto" | "support" | "research" | "sales" | "technical");
      }, 160);
    };
    window.addEventListener("aira-prefill", handler);
    return () => window.removeEventListener("aira-prefill", handler);
  }, [sendMessage]);

  // ── Commit streamed tokens to session when streaming ends ─────────────────
  const prevIsStreaming = useRef(false);
  useEffect(() => {
    if (prevIsStreaming.current && !isStreaming && tokens) {
      const msg: CompanionMessage = {
        role:      "assistant",
        content:   tokens,
        timestamp: new Date().toISOString(),
      };
      onUpdateMessages([...messages, msg]);
      reset();
      setInput("");
    }
    prevIsStreaming.current = isStreaming;
  }, [isStreaming, tokens, reset, messages, onUpdateMessages]);

  // ── Legacy result handler ─────────────────────────────────────────────────
  useEffect(() => {
    if (!legacyResult) return;
    const msg: CompanionMessage = {
      role:      "assistant",
      content:   typeof legacyResult === "string"
        ? legacyResult
        : JSON.stringify(legacyResult, null, 2),
      timestamp: new Date().toISOString(),
    };
    onUpdateMessages([...messages, msg]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [legacyResult]);

  // ── Error handlers ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!legacyError) return;
    onUpdateMessages([...messages, {
      role:      "assistant",
      content:   `Agent Protocol Error: ${legacyError}`,
      timestamp: new Date().toISOString(),
    }]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [legacyError]);

  useEffect(() => {
    if (!hybridError) return;
    onUpdateMessages([...messages, {
      role:      "assistant",
      content:   `Stream Error: ${hybridError}`,
      timestamp: new Date().toISOString(),
    }]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hybridError]);

  // ── Send ──────────────────────────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    if (!input.trim() || isStreaming || isLegacyLoading) return;
    const content = input.trim();
    const userMsg: CompanionMessage = {
      role:      "user",
      content,
      timestamp: new Date().toISOString(),
    };
    onUpdateMessages([...messages, userMsg]);
    setInput("");
    await sendMessage(content, "auto");
  }, [input, isStreaming, isLegacyLoading, sendMessage, messages, onUpdateMessages]);

  // ── Clear session ─────────────────────────────────────────────────────────
  const clearSession = () => {
    onUpdateMessages([GREETING(platform)]);
    reset();
  };

  // ── WebLLM status label ───────────────────────────────────────────────────
  const wllmLabel = (() => {
    switch (webLLMStatus) {
      case "ready":       return { text: "⬡ ON-DEVICE",              color: "text-emerald-500" };
      case "loading":     return { text: `⬡ ${webLLMProgress}%`,     color: "text-amber-500"   };
      case "unsupported": return { text: "⬡ CLOUD",                  color: "text-text-muted"  };
      default:            return { text: "⬡ INIT",                   color: "text-text-muted"  };
    }
  })();

  const isActivelyLoading = isStreaming || isLegacyLoading;
  const rtl               = language === "ur";

  return (
    <div className="flex flex-col flex-1 h-full min-w-0 overflow-hidden">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="px-5 py-3.5 border-b border-border-fine bg-bg-base/40 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          {/* Sidebar toggle */}
          <button
            onClick={onToggleSidebar}
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-surface transition-all active:scale-90"
          >
            {sidebarOpen ? <PanelLeftClose size={15} /> : <PanelLeftOpen size={15} />}
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold tracking-[0.3em] text-accent uppercase font-mono">
                {platform} NODE REGISTRY
              </span>
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  isActivelyLoading ? "bg-accent animate-pulse" : "bg-emerald-500"
                }`}
              />
              <span className={`text-[8px] font-mono font-bold ${wllmLabel.color} ml-1`}>
                {wllmLabel.text}
              </span>
            </div>
            <h3 className="text-lg font-serif font-bold text-text-primary mt-0.5 leading-tight">
              {session?.title ?? "Aira Assistant"}
            </h3>
          </div>
        </div>

        <button
          onClick={onClose}
          aria-label="Close companion"
          className="w-9 h-9 rounded-full bg-white/10 border border-border-fine flex items-center justify-center text-text-muted hover:text-text-primary transition-all active:scale-90"
        >
          <X size={16} />
        </button>
      </div>

      {/* ── Tabs ───────────────────────────────────────────────────────────── */}
      <div className="mx-6 mt-3.5 flex border border-border-fine rounded-2xl p-1 bg-bg-elevated/30 flex-shrink-0">
        <button
          onClick={() => setActiveTab("chat")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
            activeTab === "chat"
              ? "bg-bg-base text-accent shadow-sm"
              : "text-text-muted hover:text-text-primary"
          }`}
        >
          <MessageCircle size={13} strokeWidth={2.4} /> Protocol
        </button>
        <button
          onClick={() => setActiveTab("notebook")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
            activeTab === "notebook"
              ? "bg-bg-base text-accent shadow-sm"
              : "text-text-muted hover:text-text-primary"
          }`}
        >
          <Bookmark size={13} strokeWidth={2.4} /> Notebook
        </button>
      </div>

      {/* ── Routing badge ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {routedTo && isStreaming && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -4 }}
            animate={{ opacity: 1, scale: 1,   y: 0  }}
            exit={  { opacity: 0, scale: 0.9, y: -4  }}
            transition={{ duration: 0.2 }}
            className="mx-6 mt-2.5 px-3 py-1.5 rounded-xl bg-accent/10 border border-accent/20 flex items-center gap-2 flex-shrink-0"
          >
            <Sparkles size={10} className="text-accent" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-accent">
              Routed → {routedTo} Agent
              {source === "webllm" ? " · On-Device" : " · Cloud"}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 scrollbar-hide">
        {activeTab === "chat" ? (
          <>
            {messages.map((msg, i) => (
              <motion.div
                key={`${session?.id ?? "s"}-${i}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0  }}
                transition={{ duration: 0.22 }}
                className={`flex flex-col ${
                  msg.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[85%] px-4 py-3.5 rounded-[20px] text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-accent text-white rounded-tr-none shadow-sm"
                      : "bg-bg-elevated/60 border border-border-fine text-text-secondary rounded-tl-none font-serif italic shadow-sm"
                  }`}
                >
                  {msg.content}
                </div>
                <span className="text-[8px] font-bold text-text-muted mt-1.5 tracking-widest uppercase opacity-60 px-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour:   "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </motion.div>
            ))}

            {/* Streaming bubble */}
            <AnimatePresence>
              {isStreaming && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0  }}
                  exit={  { opacity: 0          }}
                  className="flex flex-col items-start"
                >
                  <div className="max-w-[85%] px-4 py-3.5 rounded-[20px] bg-bg-elevated/60 border border-border-fine text-text-secondary rounded-tl-none font-serif italic shadow-sm text-sm leading-relaxed">
                    {tokens || (
                      <span className="flex items-center gap-2 text-[10px]">
                        <Loader2 size={12} className="animate-spin text-accent" />
                        {t.aira?.typing ?? "Aira is thinking…"}
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
          /* ── Notebook tab ───────────────────────────────────────────────── */
          <div className="h-full flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-bg-surface rounded-lg flex items-center justify-center text-accent shadow-sm border border-border-fine">
                  <Bot size={16} />
                </div>
                <h4 className="font-serif text-sm font-bold text-text-primary">
                  Architect Notes
                </h4>
              </div>
              <span className="text-[8px] font-bold text-text-muted uppercase tracking-widest bg-bg-elevated px-2 py-1 rounded">
                Local Sync
              </span>
            </div>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Log research findings, architecture decisions, or module progress…"
              className="flex-1 w-full bg-bg-elevated/40 border border-border-fine rounded-2xl p-5 text-sm text-text-secondary leading-relaxed focus:outline-none focus:border-accent/40 resize-none font-serif italic scrollbar-hide"
            />

            <div className="flex items-center gap-2 text-[9px] font-bold text-text-muted uppercase tracking-widest opacity-60 px-1 pb-2">
              <Sparkles size={10} className="text-accent" />
              Notes are auto-synced to your local node.
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Input footer ───────────────────────────────────────────────────── */}
      <div className="px-5 py-4 border-t border-border-fine bg-bg-base/30 backdrop-blur-md flex-shrink-0">
        <div className="relative group">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={t.aira?.placeholder ?? "Ask Aira anything…"}
            disabled={isActivelyLoading}
            dir={rtl ? "rtl" : "ltr"}
            className="w-full pl-5 pr-24 py-3.5 rounded-2xl bg-bg-surface border border-border-fine text-sm text-text-primary focus:outline-none focus:border-accent/40 focus:shadow-inner transition-all placeholder:text-text-muted/40"
          />

          <div className="absolute right-2 top-2 bottom-2 flex items-center gap-1.5">
            <button
              onClick={clearSession}
              title="Clear session"
              disabled={isActivelyLoading}
              className="w-9 h-full rounded-xl flex items-center justify-center text-text-muted hover:text-red-400 hover:bg-red-400/10 transition-all opacity-0 group-hover:opacity-100"
            >
              <Eraser size={15} />
            </button>
            <button
              onClick={handleSend}
              disabled={isActivelyLoading || !input.trim()}
              className={`px-3.5 h-full bg-accent text-white rounded-xl shadow-md shadow-accent/20 hover:brightness-110 transition-all flex items-center justify-center active:scale-95 ${
                isActivelyLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isActivelyLoading
                ? <Loader2 size={16} className="animate-spin" />
                : <Send size={16} strokeWidth={2.4} />
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
