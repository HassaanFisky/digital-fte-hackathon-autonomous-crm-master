"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Languages, Snowflake, MessageSquare, BookOpen, Command } from "lucide-react";
import { useLanguage } from "./LanguageProvider";

/**
 * HASSAAN AI ARCHITECT — ActionDock Node
 * v4.0: Unified High-fidelity dock with Humanist aesthetics.
 */
export function ActionDock({ isPortfolio = false }: { isPortfolio?: boolean }) {
  const { language, setLanguage, t } = useLanguage();
  const [showLanguage, setShowLanguage] = useState(false);
  const [isSnowing, setIsSnowing] = useState(false);
  
  const dockRef = useRef<HTMLDivElement>(null);
  const languageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedSnow = localStorage.getItem("h1_snow_enabled") === "true";
    setIsSnowing(savedSnow);

    const handleClickOutside = (event: MouseEvent) => {
      if (showLanguage && languageRef.current && !languageRef.current.contains(event.target as Node)) {
        setShowLanguage(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showLanguage]);

  const toggleSnow = () => {
    const newState = !isSnowing;
    setIsSnowing(newState);
    localStorage.setItem("h1_snow_enabled", newState.toString());
    window.dispatchEvent(new CustomEvent("toggle-snow", { detail: { enabled: newState } }));
    window.dispatchEvent(new Event('snow-toggle')); // Compatibility with older H4 internal events
  };

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'ur', name: 'Urdu' },
    { code: 'ru', name: 'Roman Urdu' }
  ];

  const navItems = [
    { 
      id: "lang", 
      icon: <Languages size={20} />, 
      label: t.ui?.language || "Language", 
      action: () => setShowLanguage(!showLanguage),
      active: showLanguage 
    },
    { 
      id: "snow", 
      icon: <Snowflake size={20} className={isSnowing ? "text-accent animate-spin-slow" : ""} />, 
      label: t.ui?.snow || "Atmosphere", 
      action: toggleSnow,
      active: isSnowing 
    },
    { 
      id: "chat", 
      icon: <MessageSquare size={20} />, 
      label: t.ui?.companion || "Aira Chat", 
      action: () => window.dispatchEvent(new CustomEvent("toggle-aira")),
      active: false 
    },
    ...(!isPortfolio ? [{
      id: "notebook",
      icon: <BookOpen size={20} />,
      label: t.ui?.notebook || "Notebook",
      action: () => window.dispatchEvent(new CustomEvent("toggle-notebook")),
      active: false
    }] : []),
    {
      id: "cmd",
      icon: <Command size={20} />,
      label: "Command ⌘K",
      action: () => window.dispatchEvent(new CustomEvent("toggle-command-palette")),
      active: false
    }
  ];

  return (
    <div ref={dockRef} className={`fixed bottom-10 z-[9999] flex flex-col items-center gap-4 ${language === 'ur' ? 'left-10' : 'right-10'}`}>
      <AnimatePresence>
        {showLanguage && (
          <motion.div
            ref={languageRef}
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="flex flex-col gap-2 glass-apple p-2 rounded-2xl shadow-float mb-2"
          >
            {languages.map((l) => (
              <button
                key={l.code}
                onClick={() => {
                  setLanguage(l.code as any);
                  setShowLanguage(false);
                }}
                className={`px-5 py-2.5 rounded-xl text-[11px] font-bold transition-all uppercase tracking-widest ${
                  language === l.code 
                    ? "bg-accent text-white shadow-md scale-105" 
                    : "text-text-secondary hover:bg-bg-base hover:text-accent"
                }`}
              >
                {l.name}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-3 glass-apple p-2.5 rounded-full shadow-float border-white/20 dark:border-white/10">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={item.action}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all relative group ${
              item.active 
                ? "bg-accent text-white shadow-lg" 
                : "text-text-secondary hover:bg-white dark:hover:bg-white/10 hover:text-accent hover:shadow-md"
            }`}
            title={item.label}
          >
            {item.icon}
            <div className={`absolute ${language === 'ur' ? 'left-full ml-4' : 'right-full mr-4'} px-3 py-1.5 bg-text-primary text-bg-base text-[9px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none uppercase tracking-[0.2em] font-bold shadow-xl border border-white/20`}>
              {item.label}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

