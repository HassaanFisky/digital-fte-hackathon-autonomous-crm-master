"use client";
/**
 * BentoCell — Reusable framer-motion bento card wrapper.
 * Maps colSpan to static Tailwind classes (avoids JIT purge issues).
 * Apply glass-apple + shadow styling consistently across the dashboard.
 */
import { motion } from "framer-motion";
import { ReactNode } from "react";
import { clsx } from "clsx";

// Static map to avoid dynamic class generation which gets purged
const COL_SPAN_MAP: Record<number, string> = {
  1:  "col-span-1",
  2:  "col-span-2",
  3:  "col-span-3",
  4:  "col-span-4",
  5:  "col-span-5",
  6:  "col-span-6",
  7:  "col-span-7",
  8:  "col-span-8",
  9:  "col-span-9",
  10: "col-span-10",
  11: "col-span-11",
  12: "col-span-12",
};

const ROW_SPAN_MAP: Record<number, string> = {
  1: "row-span-1",
  2: "row-span-2",
  3: "row-span-3",
};

interface BentoCellProps {
  colSpan?: number;
  rowSpan?: number;
  delay?: number;
  className?: string;
  children: ReactNode;
  /** Skip glass-apple — use for custom background cells */
  noGlass?: boolean;
}

export function BentoCell({
  colSpan = 12,
  rowSpan = 1,
  delay = 0,
  className,
  children,
  noGlass = false,
}: BentoCellProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.45,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{ y: -2, transition: { duration: 0.18, ease: "easeOut" } }}
      className={clsx(
        COL_SPAN_MAP[colSpan] ?? "col-span-12",
        ROW_SPAN_MAP[rowSpan] ?? "row-span-1",
        !noGlass && "glass-apple shadow-soft border border-white/20 dark:border-white/5",
        "rounded-[2rem] overflow-hidden",
        className
      )}
    >
      {children}
    </motion.div>
  );
}
