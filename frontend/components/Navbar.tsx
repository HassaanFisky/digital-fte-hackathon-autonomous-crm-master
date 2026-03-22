"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

const navLinks = [
  { href: "/support", label: "Support" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/docs", label: "Docs" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [trustOpen, setTrustOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const trustRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (trustRef.current && !trustRef.current.contains(event.target as Node)) {
        setTrustOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu when pathname changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] border-b border-[#E5E0D8]/50 bg-[#FAF9F6]/80 backdrop-blur-md transition-all duration-300">
      <div className="max-w-[1200px] mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-12">
          <Link 
            href="/" 
            className="flex items-center gap-3 transition-opacity hover:opacity-80"
          >
            <div className="w-8 h-8 rounded-xl bg-[#E8E4DB] flex items-center justify-center border border-[#DCD6CA]">
              <span className="text-[#373330] font-serif font-medium text-lg italic">A</span>
            </div>
            <span className="font-serif text-xl tracking-tight text-[#2D2926]">
              Aria
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(({ href, label }) => {
              const isActive = pathname === href || (href === "/docs" && pathname.startsWith("/docs"));
              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative py-1 text-[15px] font-medium transition-colors duration-200 ${
                    isActive
                      ? "text-[#2D2926]"
                      : "text-[#8A857D] hover:text-[#2D2926]"
                  }`}
                >
                  {label}
                  {isActive && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute inset-x-0 -bottom-[4px] h-[2px] bg-[#D97757] rounded-full"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}

            {/* Trust Dropdown */}
            <div className="relative" ref={trustRef}>
              <button
                onClick={() => setTrustOpen(!trustOpen)}
                onMouseEnter={() => setTrustOpen(true)}
                className={`relative py-1 text-[15px] font-medium transition-colors duration-200 ${
                  trustOpen || ["/security", "/privacy", "/status"].includes(pathname)
                    ? "text-[#2D2926]"
                    : "text-[#8A857D] hover:text-[#2D2926]"
                }`}
              >
                Trust ▾
                {["/security", "/privacy", "/status"].includes(pathname) && (
                  <motion.div
                    layoutId="nav-underline"
                    className="absolute inset-x-0 -bottom-[4px] h-[2px] bg-[#D97757] rounded-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </button>

              <AnimatePresence>
                {trustOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    onMouseLeave={() => setTrustOpen(false)}
                    className="absolute top-full left-0 mt-2 w-48 bg-[#EDE8DF] border border-[#DDD8CF] rounded-[8px] p-2 shadow-[0_4px_20px_rgba(26,22,18,0.08)] flex flex-col gap-1 z-50"
                  >
                    {[
                      { label: "Security", href: "/security" },
                      { label: "Privacy Policy", href: "/privacy" },
                      { label: "System Status", href: "/status" },
                    ].map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`px-4 py-2 text-[14px] rounded-md transition-colors ${
                          pathname === item.href ? "bg-[#F5F0E8] text-[#D97757] font-medium" : "text-[#1A1612] hover:bg-[#F5F0E8]"
                        }`}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/support"
            className="hidden md:flex text-[14px] font-medium px-5 py-2.5 bg-[#F0EBE1] text-[#4A4541] hover:bg-[#E5E0D8] transition-all rounded-xl"
          >
            Submit Request
          </Link>

          <button 
            className="md:hidden p-2 text-[#8A857D]"
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
              className="fixed inset-0 bg-[#1A1612]/20 z-[110] backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="fixed top-0 right-0 bottom-0 w-[280px] bg-[#FAF9F6] border-l border-[#E5E0D8] z-[120] p-6 flex flex-col md:hidden"
            >
              <div className="flex justify-between items-center mb-8">
                <span className="font-serif text-lg tracking-tight text-[#2D2926]">Menu</span>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-[#8A857D]">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {navLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`text-[16px] font-medium py-2 ${pathname === item.href || (item.href === "/docs" && pathname.startsWith("/docs")) ? "text-[#D97757]" : "text-[#2D2926]"}`}
                  >
                    {item.label}
                  </Link>
                ))}
                
                <div className="w-full h-[1px] bg-[#E5E0D8] my-2" />
                <span className="text-[12px] uppercase tracking-wider text-[#8A857D] font-bold">Trust Center</span>
                
                {[
                  { label: "Security", href: "/security" },
                  { label: "Privacy Policy", href: "/privacy" },
                  { label: "System Status", href: "/status" },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`text-[16px] font-medium py-2 ${pathname === item.href ? "text-[#D97757]" : "text-[#2D2926]"}`}
                  >
                    {item.label}
                  </Link>
                ))}

                <Link
                  href="/support"
                  className="mt-6 flex text-[15px] justify-center font-medium px-5 py-3 bg-[#D97757] text-white hover:bg-[#C86444] transition-all rounded-xl"
                >
                  Submit Request
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
