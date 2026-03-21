"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/support", label: "Support" },
  { href: "/dashboard", label: "Dashboard" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-[#1A1612] border-b border-[#2A2420] transition-all duration-300">
      {/* Left: Logo */}
      <Link href="/" className="font-display font-black text-2xl text-[#CC5500] tracking-tight transition-transform hover:scale-105 active:scale-95">
        ARIA
      </Link>

      {/* Center: Nav links */}
      <div className="hidden md:flex items-center gap-12">
        {navLinks.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`font-body font-light text-sm tracking-wide transition-colors duration-200 ${
              pathname === href
                ? "text-[#FDFAF5]"
                : "text-[#9E948A] hover:text-[#FDFAF5]"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Right: CTA Button */}
      <Link
        href="/support"
        className="font-body font-bold text-sm px-5 py-2 bg-[#CC5500] text-[#FDFAF5] border-radius-[2px] hover:bg-[#E8724A] transition-all duration-200 active:scale-95"
        style={{ borderRadius: '2px' }}
      >
        Submit Ticket
      </Link>
    </nav>
  );
}
