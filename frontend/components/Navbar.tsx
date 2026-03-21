"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Menu } from "lucide-react";

const navLinks = [
  { href: "/support", label: "Support" },
  { href: "/dashboard", label: "Dashboard" },
];

export default function Navbar() {
  const pathname = usePathname();

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
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`relative py-1 text-[15px] font-medium transition-colors duration-200 ${
                  pathname === href
                    ? "text-[#2D2926]"
                    : "text-[#8A857D] hover:text-[#2D2926]"
                }`}
              >
                {label}
                {pathname === href && (
                  <motion.div
                    layoutId="nav-underline"
                    className="absolute inset-x-0 -bottom-[4px] h-[2px] bg-[#D97757] rounded-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/support"
            className="hidden md:flex text-[14px] font-medium px-5 py-2.5 bg-[#F0EBE1] text-[#4A4541] hover:bg-[#E5E0D8] transition-all rounded-xl"
          >
            Submit Request
          </Link>

          <button className="md:hidden p-2 text-[#8A857D]">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </nav>
  );
}
