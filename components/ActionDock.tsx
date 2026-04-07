"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Snowflake, MessageSquare, Sparkles, Languages } from 'lucide-react';
import { useLanguage } from './LanguageProvider';

/**
 * HASSAAN AI ARCHITECT — ActionDock v3.0
 * Signature 3-Button Layout: [Language, Snow, AI Chat]
 * Aesthetic: Apple Lightning Glass (Warm-Neutral / Fine-Border)
 */
export function ActionDock() {
  const { language, setLanguage } = useLanguage();
  const [isSnowing, setIsSnowing] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  useEffect(() => {
    const snowPref = localStorage.getItem('panaversity-snow') === 'true';
    setIsSnowing(snowPref);
  }, []);

  const toggleSnow = () => {
    const newState = !isSnowing;
    setIsSnowing(newState);
    localStorage.setItem('panaversity-snow', String(newState));
    window.dispatchEvent(new Event('snow-toggle'));
  };

  const toggleChat = () => {
    window.dispatchEvent(new Event('toggle-aira'));
  };

  const languages = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'ur', label: 'Urdu', native: 'اردو' },
    { code: 'ru', label: 'Roman Urdu', native: 'Urdu' }
  ];

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[10000] flex items-center gap-3">
      {/* Container with High-Fidelity Humanist Glass */}
      <div className="flex items-center gap-2 p-2 bg-[#FAF9F6]/85 backdrop-blur-2xl border-[0.8px] border-[#E5E0D8]/60 rounded-[32px] shadow-[0_20px_50px_-12px_rgba(45,41,38,0.12)]">
        
        {/* Language Protocol Button */}
        <div className="relative group">
          <button
            onClick={() => setActiveMenu(activeMenu === 'lang' ? null : 'lang')}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
              activeMenu === 'lang' ? 'bg-[#D97757] text-white shadow-md' : 'text-[#8A857D] hover:bg-white/80 hover:text-[#38312E]'
            }`}
          >
            <Languages size={20} strokeWidth={1.8} />
          </button>
          
          <AnimatePresence>
            {activeMenu === 'lang' && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.9 }}
                className="absolute bottom-16 left-0 min-w-[160px] bg-[#FAF9F6]/95 backdrop-blur-3xl border-[0.8px] border-[#E5E0D8] rounded-2xl shadow-float p-1.5 overflow-hidden"
              >
                <div className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-[#D97757]/80 opacity-60 font-mono mb-1">Language Protocol</div>
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLanguage(l.code as any);
                      setActiveMenu(null);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                      language === l.code ? 'bg-[#D97757]/10 text-[#D97757] font-bold' : 'text-[#38312E] hover:bg-white shadow-sm'
                    }`}
                  >
                    <span className="text-xs">{l.label}</span>
                    <span className="text-[10px] opacity-40 italic">{l.native}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Atmospheric Snow Button */}
        <button
          onClick={toggleSnow}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
            isSnowing ? 'bg-[#F0EBE1] text-[#D97757] shadow-inner font-bold border-[0.8px] border-[#D97757]/20 scale-[0.95]' : 'text-[#8A857D] hover:bg-white/80 hover:text-[#38312E]'
          }`}
        >
          <Snowflake size={20} strokeWidth={1.8} className={isSnowing ? "animate-pulse" : ""} />
        </button>

        {/* Divider */}
        <div className="w-[1px] h-8 bg-[#E5E0D8]/40 mx-1" />

        {/* AI Catalyst Button */}
        <button
          onClick={toggleChat}
          className="w-14 h-12 bg-gradient-to-br from-[#D97757] to-[#8C3F2F] text-white rounded-full flex items-center justify-center transition-all duration-500 hover:scale-[1.05] active:scale-[0.98] shadow-[0_8px_20px_-4px_rgba(217,119,87,0.4)] group overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
          <div className="relative flex items-center justify-center gap-1">
             <MessageSquare size={18} strokeWidth={2.2} />
             <Sparkles size={10} className="absolute -top-1 -right-1 text-white animate-pulse" />
          </div>
        </button>

      </div>
    </div>
  );
}
