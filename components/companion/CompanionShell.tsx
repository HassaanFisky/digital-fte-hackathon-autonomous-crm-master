"use client";

/**
 * CompanionShell — The morph engine for the Lightning Glass companion.
 *
 * This component renders into document.body via createPortal so it can sit
 * above all z-index layers while still living inside the React tree that
 * shares CompanionContext and LanguageProvider.
 *
 * Framer Motion layoutId="companion-orb" FLIP:
 *   • Closed: ActionDock renders motion.button layoutId="companion-orb"
 *   • Open:   This component renders motion.div   layoutId="companion-orb"
 *
 * Framer Motion records the button's bounding box on unmount, records the
 * window's bounding box on mount, and interpolates position / size /
 * border-radius between them in a single spring — zero pixel math needed.
 *
 * Positioning:
 *   • desktop: fixed bottom-24 right-10  (RTL: left-10)
 *   • mobile:  full-width bottom sheet, rounded-b-none
 *
 * useCompanionEvents() is registered here so that the global custom-event
 * bus (toggle-aira, toggle-chat, toggle-notebook) continues to work as-is
 * without any changes to CommandPalette or other callers.
 */

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import { useCompanion } from "./CompanionContext";
import { useCompanionEvents } from "./hooks/useCompanionEvents";
import { CompanionWindow } from "./CompanionWindow";
import { useLanguage } from "@/components/LanguageProvider";
import type { CompanionPlatform } from "@/types/companion";

interface CompanionShellProps {
  platform:     CompanionPlatform;
  context:      string;
  isPortfolio?: boolean;
}

const SPRING_MORPH = {
  type:      "spring",
  stiffness: 380,
  damping:   30,
  mass:      1.1,
} as const;

export function CompanionShell({
  platform,
  context,
  isPortfolio = false,
}: CompanionShellProps) {
  const { isOpen, open, close, toggle } = useCompanion();
  const { language }                    = useLanguage();

  // Bridge legacy event bus — no changes needed in any other component
  useCompanionEvents({ open, close, toggle });

  // Avoid portal render on server (createPortal requires document)
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isRTL  = language === "ur";
  const side   = isRTL ? "left-10" : "right-10";

  return createPortal(
    <MotionConfig reducedMotion="user">
      {/* ── Backdrop — independent fade, not part of layoutId ─────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="companion-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={  { opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={close}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[10000]"
          />
        )}
      </AnimatePresence>

      {/* ── Window — shares layoutId with ActionDock chat button ─────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="companion-window"
            layoutId="companion-orb"
            transition={SPRING_MORPH}
            style={{
              willChange:   "transform, border-radius, width, height",
              // Ensure origin aligns with the dock (bottom-right)
              transformOrigin: isRTL ? "bottom left" : "bottom right",
            }}
            className={`
              fixed z-[10001]
              inset-x-0 bottom-0 rounded-t-[2rem] rounded-b-none h-[88vh]
              md:inset-x-auto md:bottom-24 ${isRTL ? "md:left-10" : "md:right-10"}
              md:w-[760px] md:h-[660px] md:rounded-[2rem]
              glass-companion shadow-float
              flex overflow-hidden
              border border-white/20 dark:border-white/8
            `}
          >
            <CompanionWindow
              platform={platform}
              context={context}
              isPortfolio={isPortfolio}
              onClose={close}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>,
    document.body
  );
}
