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

export default function AgentsPage() {
  const [selectedAgent, setSelectedAgent] = useState<typeof AGENTS[0] | null>(null);
  const [command, setCommand] = useState("");
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<any>(null);
  const [rawOutput, setRawOutput] = useState<string>("");
  const { runAgentCommand } = useAriaAgent();

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim() || !selectedAgent || loading) return;

    setLoading(true);
    setOutput(null);
    setRawOutput("");

    try {
      const res = await runAgentCommand(selectedAgent.id, command);
      setOutput(res.data);
      setRawOutput(JSON.stringify(res.data, null, 2));
    } catch (err) {
      console.error("Agent command failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF9F6] text-[#2D2926] flex flex-col">
      <Navbar />

      <div className="max-w-[1200px] mx-auto w-full px-6 pt-32 pb-20 flex-grow grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Agent Roster */}
        <div className="lg:col-span-4 space-y-6">
          <div className="mb-8">
             <h1 className="text-3xl font-serif text-[#2D2926] mb-2">Team Operations</h1>
             <p className="text-[#8A857D] text-sm tracking-wide">Manage and command your AI agents.</p>
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
                className={`w-full p-4 rounded-2xl border transition-all text-left flex items-start gap-4 group ${
                  selectedAgent?.id === agent.id 
                    ? "bg-white border-[#D97757] shadow-xl shadow-[#D97757]/5 ring-1 ring-[#D97757]" 
                    : "bg-white/50 border-[#E5E0D8] hover:border-[#D97757]/50 hover:bg-white"
                }`}
              >
                <div className={`p-3 rounded-xl border ${agent.color} transition-transform group-hover:scale-110`}>
                  {agent.icon}
                </div>
                <div>
                  <div className="text-sm font-bold tracking-tight text-[#2D2926]">{agent.name}</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[#8A857D] mb-1">{agent.role}</div>
                  <div className="text-xs text-[#5C564D] leading-relaxed line-clamp-1">{agent.description}</div>
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
                        <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-[#D97757] uppercase">
                           <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                           Personnel Status: Active
                        </div>
                      </div>
                   </div>
                   <div className="flex flex-col md:items-end">
                      <div className="text-[10px] font-bold text-[#8A857D] uppercase tracking-tighter">System Persona</div>
                      <div className="text-[11px] font-medium text-[#5C564D] max-w-[250px] md:text-right italic">
                        &quot;{selectedAgent.description}&quot;
                      </div>
                   </div>
                </div>

                {/* Response Log */}
                <div className="flex-grow document-card p-6 bg-[#2D2926] text-[#E5E0D8] font-mono text-sm overflow-hidden flex flex-col relative group">
                  <div className="flex items-center gap-2 text-[10px] text-[#8A857D] mb-4 uppercase tracking-widest font-bold">
                     <Terminal className="w-3 h-3" /> Agent Output Stream
                  </div>
                  
                  <div className="flex-grow overflow-y-auto space-y-4 scrollbar-hide">
                    {!output && !loading && (
                      <div className="h-full flex flex-col items-center justify-center text-[#5C564D] space-y-4 opacity-50">
                        <MessageSquare className="w-12 h-12" />
                        <div className="text-center font-serif text-lg">Waiting for user command...</div>
                      </div>
                    )}

                    {loading && (
                      <div className="flex items-center gap-3 text-[#D97757]">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{selectedAgent.name} is thinking...</span>
                      </div>
                    )}

                    {output && (
                      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex gap-2">
                          <span className="text-[#D97757]">❯</span>
                          <span className="text-[#FAF9F6] whitespace-pre-wrap">
                            {typeof output === 'string' ? output : JSON.stringify(output, null, 2)}
                          </span>
                        </div>
                        <div className="pt-4 border-t border-[#38312E] flex items-center justify-between text-[10px] text-[#8A857D]">
                           <span>COMMAND_SUCCESS: {selectedAgent.id.toUpperCase()}</span>
                           <span>{new Date().toLocaleTimeString()}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Glass Accent */}
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-[#2D2926]/50" />
                </div>

                {/* Command Input */}
                <form 
                  onSubmit={handleCommand}
                  className="relative group h-20"
                >
                  <input
                    type="text"
                    value={command}
                    onChange={(e) => setCommand(e.target.value)}
                    placeholder={`Command ${selectedAgent.name}... (e.g. "Draft a response to a frustrated customer named John")`}
                    className="w-full h-full bg-white border-2 border-[#E5E0D8] rounded-2xl px-6 pr-16 text-[#2D2926] placeholder-[#8A857D] focus:outline-none focus:border-[#D97757] transition-all shadow-lg group-hover:shadow-xl group-hover:shadow-[#D97757]/5"
                    disabled={loading}
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={loading || !command.trim()}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#D97757] text-white rounded-xl flex items-center justify-center hover:bg-[#8C3F2F] transition-all disabled:opacity-50 active:scale-95"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>

              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-full text-center p-12 space-y-6"
              >
                <div className="w-24 h-24 bg-[#E5E0D8] rounded-full flex items-center justify-center text-[#8A857D] animate-pulse">
                  <User className="w-12 h-12" />
                </div>
                <div>
                  <h2 className="text-2xl font-serif text-[#2D2926] mb-2">Select an Employee</h2>
                  <p className="text-[#8A857D] max-w-sm mx-auto">
                    Choose one of your AI specialists from the roster to start a direct command session.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-[#D97757] uppercase tracking-widest">
                   Select from the left to engage roster
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
