"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Clock, CheckCircle, AlertTriangle, MessageSquare, ExternalLink, RefreshCw, Send } from "lucide-react";
import toast from "react-hot-toast";

const StatusBadge = ({ status }: { status: string }) => {
  const configs: Record<string, { label: string, color: string, icon: any }> = {
    open: { label: "Open", color: "bg-blue-500/10 text-blue-500 border-blue-500/30", icon: Clock },
    processing: { label: "Processing", color: "bg-amber-500/10 text-amber-500 border-amber-500/30", icon: RefreshCw },
    resolved: { label: "Resolved", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30", icon: CheckCircle },
    escalated: { label: "Escalated", color: "bg-red-500/10 text-red-500 border-red-500/30", icon: AlertTriangle },
  };

  const config = configs[status.toLowerCase()] || configs.open;
  const Icon = config.icon;

  return (
    <div className={`px-3 py-1.5 rounded-full border flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${config.color}`}>
      <Icon className={`w-3.5 h-3.5 ${status.toLowerCase() === 'processing' ? 'animate-spin' : ''}`} />
      {config.label}
    </div>
  );
};

export default function TicketStatusPage() {
  const { id } = useParams();
  const router = useRouter();
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchTicket = async () => {
    try {
      const res = await fetch(`/api/support/ticket/${id}`);
      if (!res.ok) throw new Error("Ticket not found");
      const data = await res.json();
      setTicket(data);
      setError(false);
    } catch (e) {
      console.error(e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
    // Auto-refresh every 15 seconds as per instructions
    const interval = setInterval(() => {
        if (ticket?.status !== 'resolved') fetchTicket();
    }, 15000);
    return () => clearInterval(interval);
  }, [id, ticket?.status]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
           <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
           <p className="text-text-muted font-medium">Fetching details for {id}...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
           <AlertTriangle className="text-red-500 w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold mb-4">Ticket Not Found</h2>
        <p className="text-text-muted mb-8">Invalid or expired ticket ID.</p>
        <button onClick={() => router.push("/support")} className="px-6 py-3 bg-slate-800 text-white rounded-xl">Go Back</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
           <div>
             <button onClick={() => router.push("/")} className="text-text-muted hover:text-white mb-4 flex items-center text-sm"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Home</button>
             <h1 className="text-3xl font-extrabold flex items-center gap-4">
               Ticket #{id}
               <StatusBadge status={ticket.status} />
             </h1>
           </div>
           
           <div className="flex items-center gap-4 text-sm font-medium">
             <div className="flex items-center text-text-muted"><MessageSquare className="w-4 h-4 mr-2" /> {ticket.source_channel}</div>
             <div className="w-px h-4 bg-slate-800" />
             <div className="text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-lg">94% Confidence</div>
           </div>
        </div>

        {/* Conversation Thread */}
        <div className="space-y-6 mb-12">
           <AnimatePresence initial={false}>
             {ticket.messages?.map((msg: any, i: number) => {
               const isAgent = msg.role === 'agent' || msg.direction === 'outbound';
               return (
                 <motion.div 
                   key={msg.id || i}
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   className={`flex ${isAgent ? 'justify-start' : 'justify-end'}`}
                 >
                   <div className={`max-w-[85%] md:max-w-[70%] p-6 rounded-3xl ${isAgent ? 'bg-slate-800 border border-slate-700 rounded-bl-none' : 'bg-emerald-500 text-slate-950 font-medium rounded-br-none'}`}>
                      {isAgent && (
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-[10px] font-black tracking-tighter text-slate-950">ARIA</div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Autonomous System</span>
                        </div>
                      )}
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      <div className={`text-[10px] sm:text-xs mt-3 ${isAgent ? 'text-text-muted' : 'text-slate-950/60 font-bold'}`}>
                        {new Date(msg.created_at).toLocaleTimeString()}
                      </div>
                   </div>
                 </motion.div>
               );
             })}
           </AnimatePresence>
        </div>

        {/* Action Panel */}
        <div className="sticky bottom-6 p-4 bg-slate-900/80 backdrop-blur-xl border border-slate-700 rounded-3xl shadow-2xl">
           <div className="flex items-center gap-4">
              <input 
                type="text"
                placeholder="Reply to this ticket..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-2xl px-6 py-4 focus:outline-none focus:border-emerald-500 transition-all font-medium"
              />
              <button className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 p-4 rounded-2xl shadow-lg transition-transform hover:scale-105 active:scale-95">
                 <Send className="w-6 h-6" />
              </button>
           </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 text-center pb-20">
           <p className="text-text-muted mb-6">Need help with something else?</p>
           <button onClick={() => router.push("/support")} className="px-10 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold transition-all border border-slate-700 shadow-xl">
             Submit New Request
           </button>
        </div>
      </div>
    </div>
  );
}
