"use client";

/**
 * ActionDock — v5.0
 * High-fidelity floating action dock.
 *
 * The Chat button now carries layoutId="companion-orb" so Framer Motion's
 * FLIP animation can organically morph it into the CompanionWindow when opened.
 * State is sourced from CompanionContext (shared with CompanionShell) so both
 * ends of the morph share the same boolean.
 *
 * All other buttons (Language, Snow, Notebook, Command) remain unchanged.
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Languages, Snowflake, MessageSquare, BookOpen, Command } from "lucide-react";
import { useLanguage } from "./LanguageProvider";
import { useCompanion } from "./companion/CompanionContext";

const SPRING_BUTTON = {
  type:      "spring",
  stiffness: 400,
  damping:   28,
} as const;

export function ActionDock({ isPortfolio = false }: { isPortfolio?: boolean }) {
  const { language, setLanguage, t } = useLanguage();
  const { isOpen: companionOpen, toggle: toggleCompanion } = useCompanion();

  const [showLanguage, setShowLanguage] = useState(false);
  const [isSnowing,    setIsSnowing]    = useState(false);

  const languageRef = useRef<HTMLDivElement>(null);

  // ── Hydrate snow state + click-outside for language dropdown ─────────────
  useEffect(() => {
    const savedSnow = localStorage.getItem("h1_snow_enabled") === "true";
    setIsSnowing(savedSnow);

    const handleClickOutside = (e: MouseEvent) => {
      if (
        showLanguage &&
        languageRef.current &&
        !languageRef.current.contains(e.target as Node)
      ) {
        setShowLanguage(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showLanguage]);

  // ── Snow toggle ───────────────────────────────────────────────────────────
  const toggleSnow = () => {
    const next = !isSnowing;
    setIsSnowing(next);
    localStorage.setItem("h1_snow_enabled", next.toString());
    window.dispatchEvent(new CustomEvent("toggle-snow", { detail: { enabled: next } }));
    window.dispatchEvent(new Event("snow-toggle")); // compat with older H4 events
  };

  const languages = [
    { code: "en", name: "English" },
    { code: "ur", name: "Urdu" },
    { code: "ru", name: "Roman Urdu" },
  ];

  // ── Nav items — "chat" has isCompanionOrb: true for layoutId wiring ───────
  type NavItem = {
    id:              string;
    icon:            React.ReactNode;
    label:           string;
    action:          () => void;
    active:          boolean;
    isCompanionOrb?: boolean;
  };

  const navItems: NavItem[] = [
    {
      id:     "lang",
      icon:   <Languages size={20} />,
      label:  t.ui?.language || "Language",
      action: () => setShowLanguage((v) => !v),
      active: showLanguage,
    },
    {
      id:     "snow",
      icon:   (
        <Snowflake
          size={20}
          className={isSnowing ? "text-accent animate-spin-slow" : ""}
        />
      ),
      label:  t.ui?.snow || "Atmosphere",
      action: toggleSnow,
      active: isSnowing,
    },
    {
      id:            "chat",
      icon:          <MessageSquare size={20} />,
      label:         t.ui?.companion || "Aira Chat",
      action:        toggleCompanion,
      active:        companionOpen,
      isCompanionOrb: true,
    },
    ...(!isPortfolio
      ? [
          {
            id:     "notebook",
            icon:   <BookOpen size={20} />,
            label:  t.ui?.notebook || "Notebook",
            action: () =>
              window.dispatchEvent(new CustomEvent("toggle-notebook")),
            active: false,
          } satisfies NavItem,
        ]
      : []),
    {
      id:     "cmd",
      icon:   <Command size={20} />,
      label:  "Command ⌘K",
      action: () =>
        window.dispatchEvent(new CustomEvent("toggle-command-palette")),
      active: false,
    },
  ];

  const dockSide =
    language === "ur" ? "left-10" : "right-10";
  const tooltipSide =
    language === "ur" ? "left-full ml-4" : "right-full mr-4";

  return (
    <div
      className={`fixed bottom-10 z-[9999] flex flex-col items-center gap-4 ${dockSide}`}
    >
      {/* Language dropdown */}
      <AnimatePresence>
        {showLanguage && (
          <motion.div
            ref={languageRef}
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1,   y: 0  }}
            exit={{    opacity: 0, scale: 0.9, y: 10 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-2 glass-apple p-2 rounded-2xl shadow-float mb-2"
          >
            {languages.map((l) => (
              <button
                key={l.code}
                onClick={() => {
                  setLanguage(l.code as "en" | "ur" | "ru");
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

      {/* Dock pill */}
      <div className="flex flex-col gap-3 glass-apple p-2.5 rounded-full shadow-float border-white/20 dark:border-white/10">
        {navItems.map((item) => {
          const isOrb    = !!item.isCompanionOrb;
          const isGhost  = isOrb && companionOpen; // orb "flew" to the window

          return (
            <motion.button
              key={item.id}
              /* ── The magic: same layoutId on button AND on the window container */
              layoutId={isOrb ? "companion-orb" : undefined}
              onClick={item.action}
              /* While the window is open the button is a ghost — invisible but
                 still occupying layout space so the dock doesn't shift */
              aria-hidden={isGhost ? true : undefined}
              style={{
                willChange:    "transform, border-radius",
                pointerEvents: isGhost ? "none" : "auto",
                opacity:       isGhost ? 0 : 1,
              }}
              whileHover={!isGhost ? { scale: 1.12, y: -3 } : {}}
              whileTap={!isGhost ? { scale: 0.82 } : {}}
              transition={SPRING_BUTTON}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors relative group ${
                item.active
                  ? "bg-accent text-white shadow-lg"
                  : "text-text-secondary hover:bg-white dark:hover:bg-white/10 hover:text-accent hover:shadow-md"
              }`}
              title={item.label}
            >
              {item.icon}

              {/* Tooltip */}
              {!isGhost && (
                <div
                  className={`absolute ${tooltipSide} px-3 py-1.5 bg-text-primary text-bg-base text-[9px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none uppercase tracking-[0.2em] font-bold shadow-xl border border-white/20`}
                >
                  {item.label}
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
