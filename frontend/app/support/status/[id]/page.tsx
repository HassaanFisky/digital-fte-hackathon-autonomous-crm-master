"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
  RefreshCw,
} from "lucide-react";

interface Message {
  id: string;
  role: string;
  direction: string;
  content: string;
  created_at: string;
}

interface Ticket {
  id: string;
  status: string;
  source_channel: string;
  subject: string;
  created_at: string;
  messages: Message[];
}

const StatusBadge = ({ status }: { status: string }) => {
  const configs: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    open: { label: "Open", color: "bg-blue-500/10 text-blue-400 border-blue-500/30", icon: Clock },
    processing: {
      label: "Processing",
      color: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      icon: RefreshCw,
    },
    resolved: {
      label: "Resolved",
      color: "bg-[#EDF2EE] text-[#4A5D4E] border-[#4A7C59]/30",
      icon: CheckCircle,
    },
    escalated: {
      label: "Escalated",
      color: "bg-[#FDF1E7] text-[#D97757] border-[#D97757]/30",
      icon: AlertTriangle,
    },
  };

  const config = configs[status.toLowerCase()] ?? configs.open;
  const Icon = config.icon;

  return (
    <div
      className={`px-3 py-1.5 rounded-full border flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${config.color}`}
    >
      <Icon
        className={`w-3.5 h-3.5 ${status.toLowerCase() === "processing" ? "animate-spin" : ""}`}
      />
      {config.label}
    </div>
  );
};

export default function TicketStatusPage() {
  const { id } = useParams();
  const router = useRouter();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchTicket = useCallback(async () => {
    try {
      // FIXED: was "/api/support/ticket/${id}" — corrected to the proper Next.js proxy path
      const res = await fetch(`/api/backend/v1/tickets/${id}`);
      if (!res.ok) throw new Error("Ticket not found");
      const raw = await res.json();

      // Normalise UUID / datetime fields returned by asyncpg
      const normalised: Ticket = {
        id: String(raw.id),
        status: String(raw.status ?? "open"),
        source_channel: String(raw.source_channel ?? "web_form"),
        subject: String(raw.subject ?? "Support Request"),
        created_at: raw.created_at
          ? new Date(raw.created_at).toISOString()
          : new Date().toISOString(),
        messages: Array.isArray(raw.messages)
          ? raw.messages.map((m: Record<string, unknown>) => ({
              id: String(m.id ?? Math.random()),
              role: String(m.role ?? "customer"),
              direction: String(m.direction ?? "inbound"),
              content: String(m.content ?? ""),
              created_at: m.created_at
                ? new Date(m.created_at as string).toISOString()
                : new Date().toISOString(),
            }))
          : [],
      };

      setTicket(normalised);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTicket();
    // Poll every 10 seconds while ticket is not resolved
    const interval = setInterval(() => {
      if (ticket?.status !== "resolved") fetchTicket();
    }, 10000);
    return () => clearInterval(interval);
  }, [fetchTicket, ticket?.status]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 text-[#D97757] animate-spin" />
          <p className="text-[#8A857D] font-medium">Loading ticket…</p>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 bg-[#FDF1E7] rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="text-[#D97757] w-8 h-8" />
        </div>
        <h2 className="text-2xl font-serif text-[#2D2926] mb-4">Ticket Not Found</h2>
        <p className="text-[#8A857D] mb-8">Invalid or expired ticket ID.</p>
        <button
          onClick={() => router.push("/support")}
          className="btn-primary"
        >
          Submit New Request
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#2D2926] py-12 px-4">
      <div className="max-w-[800px] mx-auto">
        {/* Header */}
        <div className="mb-10">
          <button
            onClick={() => router.push("/")}
            className="text-[#8A857D] hover:text-[#2D2926] mb-8 flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-serif text-[#2D2926] mb-1">{ticket.subject}</h1>
              <div className="flex items-center gap-3 text-sm text-[#8A857D]">
                <MessageSquare className="w-4 h-4" />
                <span className="capitalize">{ticket.source_channel.replace(/_/g, " ")}</span>
                <span>·</span>
                <span className="font-mono">{ticket.id.split("-")[0]}</span>
              </div>
            </div>
            <StatusBadge status={ticket.status} />
          </div>
        </div>

        {/* Conversation Thread */}
        <div className="space-y-4 mb-12">
          {ticket.messages.length === 0 ? (
            <div className="document-card p-10 text-center">
              <RefreshCw className="w-6 h-6 text-[#D97757] animate-spin mx-auto mb-4" />
              <p className="text-[#8A857D]">ARIA is processing your request…</p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {ticket.messages.map((msg, i) => {
                const isAgent = msg.role === "agent" || msg.direction === "outbound";
                return (
                  <motion.div
                    key={msg.id || i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isAgent ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`max-w-[85%] md:max-w-[70%] p-5 rounded-2xl text-[0.95rem] leading-relaxed ${
                        isAgent
                          ? "bg-white border border-[#E5E0D8] rounded-bl-none shadow-sm"
                          : "bg-[#D97757] text-white rounded-br-none"
                      }`}
                    >
                      {isAgent && (
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-5 h-5 bg-[#D97757] rounded-full flex items-center justify-center text-[8px] font-black text-white">
                            A
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#8A857D]">
                            ARIA
                          </span>
                        </div>
                      )}
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      <div
                        className={`text-[10px] mt-2 ${
                          isAgent ? "text-[#8A857D]" : "text-white/70"
                        }`}
                      >
                        {new Date(msg.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>

        {/* Bottom CTA */}
        <div className="pt-8 border-t border-[#E5E0D8] text-center">
          <p className="text-[#8A857D] mb-6 text-sm">Need to submit another request?</p>
          <button
            onClick={() => router.push("/support")}
            className="btn-secondary"
          >
            New Support Request
          </button>
        </div>
      </div>
    </div>
  );
}
