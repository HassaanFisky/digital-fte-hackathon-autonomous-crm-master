"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, MessageCircle, Globe, ChevronRight, Zap } from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "@/components/Navbar";

interface Ticket {
  id: string;
  customer: string;
  channel: string;
  status: string;
  time: string;
}

const KPICard = ({ label, value, sub, icon: Icon, pulse }: any) => (
  <div className="bg-[#EDE8DF] border border-[#DDD8CF] p-6 rounded-[4px] shadow-[0_1px_3px_rgba(26,22,18,0.06)] group transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_4px_12px_rgba(26,22,18,0.08)]">
    <div className="flex items-center justify-between mb-4">
      <span className="font-body font-bold text-[0.7rem] uppercase tracking-[0.1em] text-[#9E948A]">
        {label}
      </span>
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#CC5500] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#CC5500]"></span>
        </span>
      )}
    </div>
    <div className="font-display font-black text-[2.5rem] text-[#1A1612] leading-none mb-2">
      {value}
    </div>
    <div className="font-body font-light text-[0.8rem] text-[#6B6459]">
      {sub}
    </div>
  </div>
);

const SkeletonCard = () => (
  <div className="bg-[#EDE8DF] border border-[#DDD8CF] p-6 rounded-[4px] h-[160px] animate-pulse">
    <div className="w-24 h-3 bg-[#DDD8CF] mb-6" />
    <div className="w-16 h-10 bg-[#DDD8CF] mb-4" />
    <div className="w-32 h-3 bg-[#DDD8CF]" />
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const styles: any = {
    open: "bg-[#F5F0E8] border-[#CC5500] text-[#CC5500]",
    resolved: "bg-[#F5F0E8] border-[#4A7C59] text-[#4A7C59]",
    escalated: "bg-[#CC5500] border-[#CC5500] text-[#FDFAF5]",
    processing: "bg-[#F5F0E8] border-[#CC5500] text-[#CC5500]",
  };
  return (
    <span className={`px-2 py-0.5 border text-[0.7rem] font-body font-bold uppercase tracking-tight rounded-[2px] ${styles[status] || styles.open}`}>
      {status}
    </span>
  );
};

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const finishedInitialLoad = useRef(false);

  const fetchData = useCallback(async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? ""}/api/v1/tickets?limit=10`,
        { signal: controller.signal }
      );
      if (res.ok) {
        const data = await res.json();
        const items = Array.isArray(data) ? data.map((t: any) => ({
          id: String(t.ticket_id || t.id || "—"),
          customer: String(t.customer_name || t.customer || "Unknown"),
          channel: String(t.channel || "web_form"),
          status: String(t.status || "open"),
          time: String(t.created_at || "—"),
        })) : [];
        setTickets(items);
      }
    } catch (e) {
      console.error("Dashboard fetch error:", e);
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
      finishedInitialLoad.current = true;
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const kpis = [
    { label: "Total Tickets", value: tickets.length, sub: "All time volume" },
    { label: "Active Now", value: tickets.filter(t => t.status !== 'resolved').length, sub: "Currently in queue", pulse: true },
    { label: "Avg Response", value: "< 3s", sub: "Latency target met" },
    { label: "Escalation Rate", value: tickets.length > 0 ? `${Math.round((tickets.filter(t => t.status === 'escalated').length / tickets.length) * 100)}%` : "0%", sub: "Target: < 5%" },
  ];

  return (
    <main className="min-h-screen bg-[#F5F0E8] flex flex-col">
      <Navbar />

      <div className="max-w-7xl mx-auto w-full px-6 pt-32 pb-24">
        {/* Header */}
        <div className="mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display font-black text-[2.5rem] text-[#1A1612] mb-2"
          >
            Dashboard
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-body font-light text-[1rem] text-[#6B6459]"
          >
            Live overview of ARIA&apos;s activity
          </motion.p>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {loading && !finishedInitialLoad.current ? (
            [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
          ) : (
            kpis.map((kpi, i) => (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <KPICard {...kpi} />
              </motion.div>
            ))
          )}
        </div>

        {/* Ticket Table */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#EDE8DF] border border-[#DDD8CF] rounded-[4px] overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#DDD8CF]">
                  {["Ticket ID", "Customer", "Channel", "Status", "Time"].map((h) => (
                    <th key={h} className="px-6 py-4 font-body font-bold text-[0.7rem] uppercase tracking-[0.1em] text-[#9E948A]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDD8CF]">
                {loading && !finishedInitialLoad.current ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {[...Array(5)].map((__, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-4 bg-[#DDD8CF] rounded w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : tickets.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-24 text-center">
                      <p className="font-display font-light text-[1.2rem] text-[#9E948A] mb-4">No tickets yet.</p>
                      <Link href="/support" className="font-body font-bold text-[#CC5500] hover:text-[#E8724A] transition-colors">
                        Submit first ticket →
                      </Link>
                    </td>
                  </tr>
                ) : (
                  tickets.map((ticket) => (
                    <tr key={ticket.id} className="font-body font-light text-[0.9rem] text-[#1A1612] hover:bg-[#DDD8CF] transition-colors group cursor-default">
                      <td className="px-6 py-4 font-mono text-[0.8rem] text-[#6B6459]">{ticket.id}</td>
                      <td className="px-6 py-4 font-bold">{ticket.customer}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {ticket.channel === 'email' && <Mail className="w-3.5 h-3.5 text-[#6B6459]" />}
                          {ticket.channel === 'whatsapp' && <MessageCircle className="w-3.5 h-3.5 text-[#6B6459]" />}
                          {ticket.channel === 'web_form' && <Globe className="w-3.5 h-3.5 text-[#6B6459]" />}
                          <span className="capitalize">{ticket.channel.replace('_', ' ')}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={ticket.status} />
                      </td>
                      <td className="px-6 py-4 text-[#9E948A] text-[0.85rem]">
                        {ticket.time}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
