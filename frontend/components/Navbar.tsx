"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { useLanguage } from "./LanguageProvider";

/**
 * HASSAAN AI ARCHITECT — Navbar Component
 * Fully reactive for Dark/Light mode with semantic design tokens and Multi-Language support.
 */
export default function Navbar() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "https://panaversity-h0-portfolio.vercel.app/", label: t.nav.portfolio },
    { href: "/support", label: t.nav.support },
    { href: "/dashboard", label: t.nav.dashboard },
    { href: "/docs", label: t.nav.docs },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] border-b border-[#E5E0D8]/50 bg-[#FAF9F6]/80 backdrop-blur-xl transition-all duration-300">
      <div className="max-w-[1200px] mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-12">
          <Link 
            href="/" 
            className="flex items-center gap-3 transition-opacity hover:opacity-80 group"
          >
            <div className="flex flex-col">
              <span className="text-sm font-serif font-bold tracking-[0.1em] text-[#38312E] uppercase">HASSAAN</span>
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#D97757]">AI ARCHITECT</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(({ href, label }) => {
              const isActive = pathname === href || (href === "/docs" && pathname.startsWith("/docs"));
              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative py-1 text-[14px] font-bold tracking-tight transition-all duration-200 ${
                    isActive
                      ? "text-[#38312E]"
                      : "text-[#8A857D] hover:text-[#38312E]"
                  }`}
                >
                  {label}
                  {isActive && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute inset-x-0 -bottom-[4px] h-[1.5px] bg-[#D97757] rounded-full"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/support"
            className="hidden md:flex text-[11px] font-bold px-6 py-2.5 bg-[#D97757] text-white hover:bg-[#8C3F2F] transition-all rounded-xl tracking-widest uppercase shadow-lg shadow-[#D97757]/20 active:scale-95"
          >
            {t.nav.submit}
          </Link>
          <ThemeToggle />

          <button 
            className="md:hidden p-2 text-[#8A857D] hover:text-[#38312E]"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-[#38312E]/20 z-[110] backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="fixed top-0 right-0 bottom-0 w-[300px] bg-[#FAF9F6] border-l border-[#E5E0D8] z-[120] p-8 flex flex-col md:hidden"
            >
              <div className="flex justify-between items-center mb-12">
                <span className="font-serif text-xl tracking-tight text-[#38312E] italic font-bold">Navigation Hub</span>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-[#8A857D] hover:text-[#38312E]">
                  <X className="w-7 h-7" />
                </button>
              </div>

              <div className="flex flex-col gap-6">
                {navLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`text-[18px] font-bold tracking-tight py-1 transition-colors ${pathname === item.href ? "text-[#D97757]" : "text-[#38312E]"}`}
                  >
                    {item.label}
                  </Link>
                ))}
                
                <div className="w-full h-[1px] bg-[#E5E0D8] my-6 opacity-60" />
                
                <Link
                  href="/support"
                  onClick={() => setMobileMenuOpen(false)}
                  className="mt-4 flex text-[13px] justify-center font-bold px-6 py-5 bg-[#D97757] text-white hover:bg-[#8C3F2F] transition-all rounded-2xl tracking-[0.2em] uppercase shadow-lg shadow-[#D97757]/20"
                >
                  {t.nav.submit}
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
