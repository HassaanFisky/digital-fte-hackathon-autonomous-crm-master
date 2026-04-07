"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Globe, User, LogOut, LogIn } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

// Unified Supabase fallback - handles cases where env isn't defined gracefully
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://panaversity-auth-placeholder.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";
const supabaseContext = createClient(supabaseUrl, supabaseKey);

const ECOSYSTEM_APPS = [
  { name: "Portfolio Hub", image: "https://raw.githubusercontent.com/Hassaanfisky/hassaanfisky-panaversity-portfolio/main/public/blueprint-footer.png", url: "https://panaversity-h0-portfolio.vercel.app", id: "h0" },
  { name: "Physical AI & Robotics", image: "https://panaversity-h1-robotics.vercel.app/h1-thumb.png", url: "https://panaversity-h1-robotics.vercel.app", id: "h1" },
  { name: "Evolution of Todo", image: "https://hackathon-2-todo-iota.vercel.app/h2-thumb.png", url: "https://hackathon-2-todo-iota.vercel.app", id: "h2" },
  { name: "LearnFlow Engine", image: "https://hassaanfisky-panaversity-learnflow.vercel.app/h2-thumb.png", url: "https://hassaanfisky-panaversity-learnflow.vercel.app", id: "h3" },
  { name: "Companion FTE", image: "https://panaversity-h4-companion.vercel.app/h4-thumb.png", url: "https://panaversity-h4-companion.vercel.app", id: "h4" },
];

export function EcosystemNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabaseContext.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    
    const { data: { subscription } } = supabaseContext.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    
    return () => subscription.unsubscribe();
  }, []);

  const handleSignIn = () => {
    if (typeof window !== 'undefined') {
       window.location.href = "https://panaversity-h0-portfolio.vercel.app/auth?redirect=" + encodeURIComponent(window.location.href);
    }
  };

  const handleSignOut = async () => {
    await supabaseContext.auth.signOut();
  };

  return (
    <>
      <div className="fixed top-6 right-6 z-[10000]">
        <div className="relative flex flex-col items-end">
          <button 
            onClick={() => setIsAuthOpen(!isAuthOpen)}
            className="w-12 h-12 bg-[#FAF9F6]/90 backdrop-blur-[18px] border border-[#E5E0D8] rounded-full shadow-[0_8px_24px_-4px_rgba(217,119,87,0.18)] flex items-center justify-center text-[#5C564D] hover:text-[#D97757] hover:border-[#D97757]/50 transition-all hover:scale-105 active:scale-95 group"
          >
            <User size={20} className={user ? "text-[#D97757]" : ""} />
            {user && <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#FAF9F6] shadow-sm animate-pulse" />}
          </button>
          
          <AnimatePresence>
            {isAuthOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute top-16 right-0 w-72 bg-[#FAF9F6]/95 backdrop-blur-[24px] border border-[#E5E0D8]/80 rounded-2xl shadow-[0_24px_56px_-12px_rgba(45,41,38,0.14)] overflow-hidden p-2 origin-top-right mt-2"
              >
                <div className="px-3 py-2 text-[9.5px] font-bold uppercase tracking-[0.25em] text-[#D97757] border-b border-[#E5E0D8]/60 mb-2 font-mono">
                  Network Identity
                </div>
                {user ? (
                  <div className="flex flex-col gap-1">
                    <div className="px-3 py-3 bg-white rounded-[12px] mb-1 border border-[#E5E0D8]/50 shadow-sm flex flex-col items-center text-center">
                       <div className="w-10 h-10 bg-[#D97757]/10 rounded-full mb-2 flex items-center justify-center text-[#D97757]">
                         <User size={18} />
                       </div>
                       <span className="text-xs font-bold text-[#2D2926] break-all max-w-[240px] leading-tight block">{user.email}</span>
                       <span className="text-[10px] text-emerald-600 uppercase tracking-widest block mt-1 font-serif italic flex items-center gap-1 justify-center"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Verified Architect Node</span>
                    </div>
                    <button onClick={handleSignOut} className="flex flex-row-reverse justify-center items-center gap-3 px-3 py-3 rounded-[12px] bg-red-50 hover:bg-red-100 text-red-600 transition-all text-[11px] font-bold w-full mt-1 border border-red-100">
                      Terminate Session <LogOut size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 p-1">
                    <div className="text-center py-2">
                       <p className="text-[11.5px] font-medium text-[#5C564D] leading-relaxed px-2">Global ecosystem verification is required. Connect your identity to access full functionality.</p>
                    </div>
                    <button onClick={handleSignIn} className="flex justify-center items-center gap-2 px-3 py-3 rounded-xl bg-gradient-to-r from-[#D97757] to-[#c86444] text-white transition-all text-xs font-bold w-full shadow-[0_8px_16px_-4px_rgba(217,119,87,0.3)] hover:shadow-[0_12px_24px_-4px_rgba(217,119,87,0.4)]">
                      Initialize Uplink <LogIn size={15} />
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="fixed bottom-8 left-8 z-[10000]">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="absolute bottom-16 left-0 w-72 bg-[#FAF9F6]/95 backdrop-blur-[24px] border border-[#E5E0D8]/80 rounded-2xl shadow-[0_24px_56px_-12px_rgba(45,41,38,0.14)] overflow-hidden p-2 origin-bottom-left"
            >
              <div className="px-3 py-2 text-[9.5px] font-bold uppercase tracking-[0.25em] text-[#D97757] border-b border-[#E5E0D8]/60 mb-2 font-mono flex items-center justify-between">
                <span>Ecosystem Grid</span>
                <span className="text-[8px] tracking-widest opacity-60">Status: WIRED</span>
              </div>
              <div className="space-y-1">
                {ECOSYSTEM_APPS.map((app) => (
                  <a
                    key={app.id}
                    href={app.url}
                    className="flex items-center gap-4 px-3 py-3 rounded-[12px] hover:bg-white shadow-sm hover:shadow-md transition-all group border border-transparent hover:border-[#E5E0D8]/80 cursor-pointer"
                  >
                    <div className="relative w-10 h-10 rounded-lg bg-white border border-[#E5E0D8]/50 flex items-center justify-center overflow-hidden transition-all shadow-sm">
                      <img 
                        src={app.image} 
                        alt={app.name}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.15] transition-transform duration-700 opacity-95 group-hover:opacity-100"
                      />
                    </div>
                    <div className="flex flex-col flex-1">
                      <span className="text-xs font-bold text-[#2D2926] group-hover:text-[#D97757] transition-colors">{app.name}</span>
                      <span className="text-[9px] text-[#8A857D] uppercase tracking-widest font-serif italic mt-0.5">{app.id.toUpperCase()} Production Node</span>
                    </div>
                  </a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 bg-[#FAF9F6] border border-[#E5E0D8] rounded-full shadow-[0_12px_24px_-8px_rgba(45,41,38,0.12)] flex items-center justify-center text-[#2D2926] hover:text-[#D97757] hover:border-[#D97757]/50 group relative transition-all active:scale-95"
        >
          <Globe size={22} className={isOpen ? "rotate-180" : "animate-[spin_20s_linear_infinite]"} strokeWidth={1.5} />
          <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-[#D97757] rounded-full border-2 border-[#FAF9F6] shadow-md animate-pulse" />
        </button>
      </div>
    </>
  );
}

export default EcosystemNav;
