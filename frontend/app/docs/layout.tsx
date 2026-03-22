"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import DocsSidebar from "@/components/DocsSidebar";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#F5F0E8] text-[#1A1612]">
      {/* Mobile Sidebar Overlay & Toggle */}
      <div className="md:hidden">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="fixed top-24 left-6 z-[60] p-2 bg-[#EDE8DF] border border-[#DDD8CF] rounded-full shadow-sm text-[#6B6459]"
        >
          <Menu className="w-5 h-5" />
        </button>

        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 bg-[#1A1612]/20 z-[70] backdrop-blur-sm"
              />
              <motion.div
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="fixed top-0 left-0 bottom-0 w-[280px] z-[80] bg-[#EDE8DF] border-r border-[#DDD8CF] shadow-xl pt-24"
              >
                <div className="absolute top-24 right-4">
                  <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-[#6B6459]">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <DocsSidebar />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block w-[280px] shrink-0 sticky top-0 h-screen overflow-y-auto bg-[#EDE8DF] border-r border-[#DDD8CF] pt-[100px] pb-8">
        <DocsSidebar />
      </div>

      {/* Main Content */}
      <main className="flex-1 w-[100%] max-w-[800px] px-6 py-12 md:px-16 md:py-24 pt-32 md:pt-32">
        {children}
      </main>
    </div>
  );
}
