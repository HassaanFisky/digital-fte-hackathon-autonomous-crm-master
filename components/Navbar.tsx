"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Globe } from "lucide-react";
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
    <nav className="fixed top-0 left-0 right-0 z-[100] border-b border-border-fine bg-bg-base/80 backdrop-blur-xl transition-all duration-300">
      <div className="max-w-[1200px] mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-12">
          <Link 
            href="/" 
            className="flex items-center gap-3 transition-opacity hover:opacity-80 group"
          >
            <div className="flex flex-col">
              <span className="text-sm font-serif font-bold tracking-[0.1em] text-text-primary uppercase">HASSAAN</span>
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-accent">AI ARCHITECT</span>
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
                      ? "text-text-primary"
                      : "text-text-muted hover:text-text-primary"
                  }`}
                >
                  {label}
                  {isActive && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute inset-x-0 -bottom-[4px] h-[1.5px] bg-accent rounded-full"
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
            href="https://panaversity-h0-portfolio.vercel.app"
            className="navbar-cta-primary hidden md:flex items-center gap-2 px-6 py-2.5 bg-accent text-white rounded-full font-bold text-[10px] uppercase tracking-widest ring-1 ring-white/20 hover:brightness-110 hover:ring-white/40 active:scale-95 transition-all duration-300"
          >
            <Globe size={14} className="animate-globe-spin shrink-0" />
            Portfolio Hub
          </Link>
          <div className="relative z-[110]">
            <ThemeToggle />
          </div>

          <button 
            className="md:hidden p-2 text-text-muted hover:text-text-primary"
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
              className="fixed inset-0 bg-text-primary/20 z-[110] backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="fixed top-0 right-0 bottom-0 w-[300px] bg-bg-base border-l border-border-fine z-[120] p-8 flex flex-col md:hidden"
            >
              <div className="flex justify-between items-center mb-12">
                <span className="font-serif text-xl tracking-tight text-text-primary italic font-bold">Navigation Hub</span>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-text-muted hover:text-text-primary">
                  <X className="w-7 h-7" />
                </button>
              </div>

              <div className="flex flex-col gap-6">
                {navLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`text-[18px] font-bold tracking-tight py-1 transition-colors ${pathname === item.href ? "text-accent" : "text-text-primary"}`}
                  >
                    {item.label}
                  </Link>
                ))}
                
                <div className="w-full h-[1px] bg-border-fine my-6 opacity-60" />
                
                <Link
                  href="https://panaversity-h0-portfolio.vercel.app"
                  onClick={() => setMobileMenuOpen(false)}
                  className="mt-4 flex items-center gap-2 justify-center text-[13px] font-bold px-6 py-5 bg-accent text-white hover:brightness-110 transition-all rounded-2xl tracking-[0.2em] uppercase shadow-lg shadow-accent/20"
                >
                  <Globe className="w-4 h-4 animate-globe-spin" />
                  Portfolio Hub
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
