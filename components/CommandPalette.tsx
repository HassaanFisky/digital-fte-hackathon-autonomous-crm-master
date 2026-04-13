"use client";
/**
 * CommandPalette — ⌘K Spotlight for the H4 Autonomous Assistant Ecosystem.
 * Uses installed cmdk@1.1.1. Triggered by Cmd+K / Ctrl+K or custom event.
 * Dispatches to AiraAssistant via aira-prefill custom event.
 */
import React, { useState, useEffect, useCallback } from "react";
import { Command } from "cmdk";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Brain, Search, Mail, Database, BarChart2, Plus,
  LayoutDashboard, Terminal, Sparkles, Moon, Sun,
  Command as CommandIcon, X,
} from "lucide-react";
import { useWebLLM } from "@/lib/hooks/useWebLLM";

type AgentType = "research" | "sales" | "technical" | "support" | "auto";

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const { status: webLLMStatus, progress } = useWebLLM();

  // ── Open/close via event bus and keyboard shortcut ───────────────────────
  useEffect(() => {
    const onToggle = () => setIsOpen(prev => !prev);
    window.addEventListener("toggle-command-palette", onToggle);
    return () => window.removeEventListener("toggle-command-palette", onToggle);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery("");
  }, []);

  // ── Dispatch agent command to AiraAssistant ───────────────────────────────
  const dispatchAgent = useCallback((agentType: AgentType, userQuery: string) => {
    close();
    const prefillQuery = userQuery.trim() || `Use the ${agentType} agent to help me.`;

    // Open AiraAssistant then prefill
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("toggle-aira"));
      setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent("aira-prefill", {
            detail: { query: prefillQuery, agentType },
          })
        );
      }, 120);
    }, 80);
  }, [close]);

  const navigate = useCallback((path: string) => {
    close();
    router.push(path);
  }, [close, router]);

  const toggleTheme = useCallback(() => {
    close();
    const html = document.documentElement;
    const isDark = html.getAttribute("data-theme") === "dark";
    html.setAttribute("data-theme", isDark ? "light" : "dark");
  }, [close]);

  const runAnalysis = useCallback(() => {
    close();
    window.dispatchEvent(new CustomEvent("run-analysis"));
  }, [close]);

  // ── WebLLM status footer label ────────────────────────────────────────────
  const engineLabel = () => {
    switch (webLLMStatus) {
      case "ready":       return "⬡ ON-DEVICE · Llama-3-8B";
      case "loading":     return `⬡ LOADING ENGINE ${progress}%`;
      case "detecting":   return "⬡ DETECTING HARDWARE...";
      case "unsupported": return "⬡ CLOUD · Groq (3-key pool)";
      default:            return "⬡ INITIALISING...";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={close}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[20000]"
          />

          {/* Palette */}
          <motion.div
            key="palette"
            initial={{ opacity: 0, y: -16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-[18%] left-1/2 -translate-x-1/2 w-[640px] max-w-[calc(100vw-2rem)] z-[20001]"
          >
            <Command
              className="glass-apple shadow-float rounded-[2rem] overflow-hidden border border-white/20 dark:border-white/8 flex flex-col"
              shouldFilter={true}
              loop
            >
              {/* Search input */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-border-fine">
                <CommandIcon className="w-4 h-4 text-accent shrink-0" />
                <Command.Input
                  value={query}
                  onValueChange={setQuery}
                  placeholder="Command ARIA… search, draft, analyse, navigate"
                  className="flex-1 bg-transparent text-base text-text-primary placeholder:text-text-muted/50 focus:outline-none font-serif"
                  autoFocus
                />
                <button
                  onClick={close}
                  className="w-7 h-7 rounded-lg bg-bg-elevated flex items-center justify-center text-text-muted hover:text-text-primary transition-all"
                >
                  <X size={13} />
                </button>
              </div>

              {/* Commands list */}
              <Command.List className="max-h-[360px] overflow-y-auto p-2 scrollbar-hide">
                <Command.Empty className="py-8 text-center text-sm text-text-muted font-serif italic">
                  No commands match. Press Enter to send to ARIA.
                </Command.Empty>

                {/* AI AGENTS */}
                <Command.Group
                  heading="AI AGENTS"
                  className="[&>div[cmdk-group-heading]]:px-3 [&>div[cmdk-group-heading]]:py-2 [&>div[cmdk-group-heading]]:text-[9px] [&>div[cmdk-group-heading]]:font-bold [&>div[cmdk-group-heading]]:tracking-[0.3em] [&>div[cmdk-group-heading]]:text-text-muted [&>div[cmdk-group-heading]]:uppercase"
                >
                  <PaletteItem
                    icon={<Brain className="w-4 h-4 text-violet-500" />}
                    label="Route to Best Agent"
                    description="Let the Manager decide which specialist handles your query"
                    onSelect={() => dispatchAgent("auto", query)}
                    value="route best agent auto manager"
                  />
                  <PaletteItem
                    icon={<Search className="w-4 h-4 text-blue-500" />}
                    label="Research & Web Search"
                    description="Tavily + Serper parallel search with synthesis"
                    onSelect={() => dispatchAgent("research", query)}
                    value="research web search tavily serper"
                  />
                  <PaletteItem
                    icon={<Mail className="w-4 h-4 text-emerald-500" />}
                    label="Draft Marketing Copy / Email"
                    description="Sales agent — email drafts, pitch writing, creative copy"
                    onSelect={() => dispatchAgent("sales", query)}
                    value="draft email marketing copy pitch sales"
                  />
                  <PaletteItem
                    icon={<Database className="w-4 h-4 text-accent" />}
                    label="Technical Analysis & Data"
                    description="pgvector search, SQL queries, statistics, math"
                    onSelect={() => dispatchAgent("technical", query)}
                    value="technical analysis data sql pgvector math"
                  />
                  <PaletteItem
                    icon={<Sparkles className="w-4 h-4 text-accent" />}
                    label="Customer Support"
                    description="ARIA senior support — warm, precise, actionable responses"
                    onSelect={() => dispatchAgent("support", query)}
                    value="support customer service help"
                  />
                </Command.Group>

                {/* NAVIGATION */}
                <Command.Group
                  heading="NAVIGATION"
                  className="[&>div[cmdk-group-heading]]:px-3 [&>div[cmdk-group-heading]]:py-2 [&>div[cmdk-group-heading]]:text-[9px] [&>div[cmdk-group-heading]]:font-bold [&>div[cmdk-group-heading]]:tracking-[0.3em] [&>div[cmdk-group-heading]]:text-text-muted [&>div[cmdk-group-heading]]:uppercase"
                >
                  <PaletteItem
                    icon={<LayoutDashboard className="w-4 h-4 text-text-secondary" />}
                    label="Open Dashboard"
                    description="Command Center with bento analytics"
                    onSelect={() => navigate("/dashboard")}
                    value="dashboard home analytics"
                  />
                  <PaletteItem
                    icon={<Plus className="w-4 h-4 text-text-secondary" />}
                    label="Submit Support Ticket"
                    description="New customer inquiry via Aira support form"
                    onSelect={() => navigate("/support")}
                    value="support ticket new inquiry"
                  />
                  <PaletteItem
                    icon={<Terminal className="w-4 h-4 text-text-secondary" />}
                    label="Agent Operations Center"
                    description="Manage your Digital FTE agent roster"
                    onSelect={() => navigate("/dashboard/agents")}
                    value="agents operations center manage"
                  />
                </Command.Group>

                {/* ACTIONS */}
                <Command.Group
                  heading="ACTIONS"
                  className="[&>div[cmdk-group-heading]]:px-3 [&>div[cmdk-group-heading]]:py-2 [&>div[cmdk-group-heading]]:text-[9px] [&>div[cmdk-group-heading]]:font-bold [&>div[cmdk-group-heading]]:tracking-[0.3em] [&>div[cmdk-group-heading]]:text-text-muted [&>div[cmdk-group-heading]]:uppercase"
                >
                  <PaletteItem
                    icon={<BarChart2 className="w-4 h-4 text-text-secondary" />}
                    label="Run Intelligence Report"
                    description="Trigger ARIA analyst — operations metrics"
                    onSelect={runAnalysis}
                    value="run analysis intelligence report analytics"
                  />
                  <PaletteItem
                    icon={<Moon className="w-4 h-4 text-text-secondary" />}
                    label="Toggle Dark / Light Mode"
                    description="Switch between High-Fidelity Humanist themes"
                    onSelect={toggleTheme}
                    value="toggle theme dark light mode"
                  />
                </Command.Group>
              </Command.List>

              {/* Footer: engine status */}
              <div className="px-5 py-3 border-t border-border-fine flex items-center justify-between">
                <span className="text-[9px] font-bold font-mono tracking-widest text-text-muted uppercase">
                  {engineLabel()}
                </span>
                <div className="flex items-center gap-3 text-[9px] font-mono text-text-muted">
                  <span>↑↓ navigate</span>
                  <span>↵ select</span>
                  <span>ESC close</span>
                </div>
              </div>
            </Command>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── PaletteItem ───────────────────────────────────────────────────────────────
interface PaletteItemProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  onSelect: () => void;
  value: string;
}

function PaletteItem({ icon, label, description, onSelect, value }: PaletteItemProps) {
  return (
    <Command.Item
      value={value}
      onSelect={onSelect}
      className="flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-colors
        data-[selected=true]:bg-accent/10 data-[selected=true]:text-accent
        hover:bg-bg-elevated/60 text-text-primary group"
    >
      <div className="w-8 h-8 rounded-xl bg-bg-elevated border border-border-fine flex items-center justify-center shrink-0 group-data-[selected=true]:bg-accent/10 group-data-[selected=true]:border-accent/20 transition-colors">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-tight">{label}</p>
        <p className="text-[10px] text-text-muted leading-tight mt-0.5 truncate">{description}</p>
      </div>
    </Command.Item>
  );
}
