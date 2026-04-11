"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Search, 
  Terminal, 
  Zap, 
  BarChart3, 
  ShieldAlert, 
  MessageSquare, 
  Send,
  Loader2,
  Cpu,
  ArrowRight
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAriaAgent } from "@/lib/hooks/useAriaAgent";
import { 
  ARIA_SUPPORT_AGENT, 
  ARIA_CLASSIFIER_AGENT, 
  ARIA_SUGGESTER_AGENT, 
  ARIA_ANALYST_AGENT, 
  ARIA_ESCALATION_AGENT 
} from "@/lib/agents/systemPrompts";

const AGENTS = [
  {
    id: "support",
    name: "ARIA",
    role: "Senior Support Specialist",
    description: "Expert in deep-care customer resolution and warm, detailed communication.",
    icon: <User className="w-5 h-5" />,
    prompt: ARIA_SUPPORT_AGENT,
    color: "bg-blue-50 text-blue-700 border-blue-100",
    accent: "#3b82f6"
  },
  {
    id: "classifier",
    name: "INTELLIGENCE",
    role: "Ticket Classifier",
    description: "Real-time categorization, priority mapping, and emotional sentiment analysis.",
    icon: <Cpu className="w-5 h-5" />,
    prompt: ARIA_CLASSIFIER_AGENT,
    color: "bg-purple-50 text-purple-700 border-purple-100",
    accent: "#a855f7"
  },
  {
    id: "suggester",
    name: "PREDICTIVE",
    role: "User Assistance",
    description: "Smart suggestion engine that predicts user needs and accelerates input.",
    icon: <Zap className="w-5 h-5" />,
    prompt: ARIA_SUGGESTER_AGENT,
    color: "bg-amber-50 text-amber-700 border-amber-100",
    accent: "#f59e0b"
  },
  {
    id: "analyst",
    name: "ANALYST",
    role: "Operations Analyst",
    description: "Generates executive intelligence reports and operational performance metrics.",
    icon: <BarChart3 className="w-5 h-5" />,
    prompt: ARIA_ANALYST_AGENT,
    color: "bg-green-50 text-green-700 border-green-100",
    accent: "#10b981"
  },
  {
    id: "escalation",
    name: "ESCALATION",
    role: "Senior Specialist",
    description: "Precision escalation intelligence for high-risk and complex scenarios.",
    icon: <ShieldAlert className="w-5 h-5" />,
    prompt: ARIA_ESCALATION_AGENT,
    color: "bg-red-50 text-red-700 border-red-100",
    accent: "#ef4444"
  }
];

const QUICK_COMMANDS: Record<string, string[]> = {
  support: ["Draft Greeting", "Handle Refund Request", "Explain ARIA AI"],
  classifier: ["Analyze Current Tickets", "Priority Audit", "Sentiment Overview"],
  suggester: ["Rewrite Email", "Draft Follow-up", "Suggest Templates"],
  analyst: ["Weekly Operations Report", "Efficiency Metrics", "Risk Assessment"],
  escalation: ["Emergency Response Draft", "Legal Liaison Note", "Executive Briefing"]
};

export default function AgentsPage() {
  const [selectedAgent, setSelectedAgent] = useState<typeof AGENTS[0] | null>(null);
  const [command, setCommand] = useState("");
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<any>(null);
  const [rawOutput, setRawOutput] = useState<string>("");
  const { runAgentCommand } = useAriaAgent();

  const handleCommand = async (e?: React.FormEvent, manualCmd?: string) => {
    if (e) e.preventDefault();
    const cmdToRun = manualCmd || command;
    if (!cmdToRun.trim() || !selectedAgent || loading) return;

    setLoading(true);
    setOutput(null);
    setRawOutput("");

    try {
      const res = await runAgentCommand(selectedAgent.id, cmdToRun);
      setOutput(res.data);
      setRawOutput(JSON.stringify(res.data, null, 2));
    } catch (err) {
      console.error("Agent command failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-bg-base text-text-primary flex flex-col">
      <Navbar />

      <div className="max-w-[1200px] mx-auto w-full px-6 pt-32 pb-20 flex-grow grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Agent Roster */}
        <div className="lg:col-span-4 space-y-6">
          <div className="mb-8">
             <h1 className="text-3xl font-serif text-text-primary mb-2">Team Operations</h1>
             <p className="text-text-muted text-sm tracking-wide uppercase">Manage and command your AI agents.</p>
          </div>

          <div className="space-y-4">
            {AGENTS.map((agent) => (
              <button
                key={agent.id}
                onClick={() => {
                  setSelectedAgent(agent);
                  setOutput(null);
                  setRawOutput("");
                  setCommand("");
                }}
                className={`w-full p-5 rounded-[2rem] border transition-all text-left flex items-start gap-4 group ${
                  selectedAgent?.id === agent.id 
                    ? "bg-bg-surface border-accent shadow-float ring-1 ring-accent" 
                    : "bg-bg-elevated/40 border-border-fine hover:border-accent/50 hover:bg-bg-surface shadow-sm"
                }`}
              >
                <div className={`p-3 rounded-2xl border ${agent.color} transition-transform group-hover:scale-110`}>
                  {agent.icon}
                </div>
                <div>
                  <div className="text-sm font-bold tracking-tight text-text-primary uppercase">{agent.name}</div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent mb-1">{agent.role}</div>
                  <div className="text-[11px] text-text-muted leading-relaxed line-clamp-2 italic">{agent.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Command Terminal */}
        <div className="lg:col-span-8 flex flex-col h-full">

          <AnimatePresence mode="wait">
            {selectedAgent ? (
              <motion.div
                key={selectedAgent.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col h-full space-y-6"
              >
                {/* Agent Header */}
                <div className="document-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                   <div className="flex items-center gap-4">
                      <div className={`p-4 rounded-2xl border ${selectedAgent.color}`}>
                        {selectedAgent.icon}
                      </div>
                      <div>
                        <h2 className="text-2xl font-serif">{selectedAgent.name} Agent</h2>
                        <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-accent uppercase">
                           <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                           Personnel Status: Active
                        </div>
                      </div>
                   </div>
                      <div className="flex flex-col md:items-end">
                        <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest">System Persona</div>
                        <div className="text-[11px] font-medium text-text-secondary max-w-[250px] md:text-right italic">
                          &quot;{selectedAgent.description}&quot;
                        </div>
                     </div>
                </div>

                {/* Response Log */}
                <div className="flex-grow document-card p-6 bg-text-primary text-bg-base font-mono text-sm overflow-hidden flex flex-col relative group">
                  <div className="flex items-center gap-2 text-[10px] text-text-muted mb-4 uppercase tracking-[0.2em] font-bold">
                     <Terminal className="w-3 h-3" /> Agent Output Stream
                  </div>
                  
                  <div className="flex-grow overflow-y-auto space-y-4 scrollbar-hide">
                    {!output && !loading && (
                      <div className="h-full flex flex-col items-center justify-center text-text-muted/40 space-y-4">
                        <MessageSquare className="w-12 h-12 opacity-20" />
                        <div className="text-center font-serif text-lg italic">Waiting for user command...</div>
                      </div>
                    )}

                    {loading && (
                      <div className="flex items-center gap-3 text-accent">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-[10px] uppercase tracking-widest font-bold">Processing Intelligence Request...</span>
                      </div>
                    )}

                    {output && (
                      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex gap-2">
                          <span className="text-accent">❯</span>
                          <span className="text-bg-base whitespace-pre-wrap">
                            {typeof output === 'string' ? output : JSON.stringify(output, null, 2)}
                          </span>
                        </div>
                        <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[10px] text-text-muted">
                           <span>COMMAND_SUCCESS: {selectedAgent.id.toUpperCase()}</span>
                           <span>{new Date().toLocaleTimeString()}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Glass Accent */}
                  <div className="absolute inset-x-0 bottom-0 pointer-events-none h-20 bg-gradient-to-t from-text-primary to-transparent" />
                </div>

                {/* Command Input */}
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {QUICK_COMMANDS[selectedAgent.id]?.map((cmd) => (
                      <button
                        key={cmd}
                        onClick={() => {
                          setCommand(cmd);
                          handleCommand(undefined, cmd);
                        }}
                        disabled={loading}
                        className="px-3 py-1.5 bg-bg-surface border border-border-fine rounded-xl text-[10px] font-bold text-accent hover:bg-accent hover:text-white hover:border-accent transition-all active:scale-95 disabled:opacity-50 shadow-sm uppercase tracking-wider"
                      >
                         {cmd}
                      </button>
                    ))}
                  </div>

                  <form 
                    onSubmit={(e) => handleCommand(e)}
                    className="relative group h-20"
                  >
                    <input
                      type="text"
                      value={command}
                      onChange={(e) => setCommand(e.target.value)}
                      placeholder={`Command ${selectedAgent.name}...`}
                      className="w-full h-full bg-bg-surface border-2 border-border-fine rounded-[1.5rem] px-6 pr-16 text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent transition-all shadow-float group-hover:border-accent/40"
                      disabled={loading}
                      autoFocus
                    />
                    <button
                      type="submit"
                      disabled={loading || !command.trim()}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-accent text-white rounded-2xl flex items-center justify-center hover:brightness-110 transition-all disabled:opacity-50 active:scale-95 shadow-lg shadow-accent/20"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </form>
                </div>

              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-full text-center p-12 space-y-6"
              >
                <div className="w-24 h-24 bg-bg-elevated rounded-full flex items-center justify-center text-text-muted animate-pulse">
                  <User className="w-12 h-12" />
                </div>
                <div>
                  <h2 className="text-2xl font-serif text-text-primary mb-2">Select an Employee</h2>
                  <p className="text-text-muted max-w-sm mx-auto italic text-sm">
                    Choose one of your AI specialists from the roster to start a direct command session.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-accent uppercase tracking-[0.2em]">
                   Select from left to engage roster
                   <ArrowRight className="w-4 h-4 animate-bounce-x" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </main>
  );
}
