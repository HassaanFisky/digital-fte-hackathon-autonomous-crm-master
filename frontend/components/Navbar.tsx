"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/support", label: "Support" },
  { href: "/dashboard", label: "Dashboard" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800">
      {/* Logo */}
      <Link href="/" className="text-white font-black text-lg tracking-tight select-none">
        ARIA
      </Link>

      {/* Center nav links */}
      <div className="hidden md:flex items-center gap-8">
        {navLinks.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`text-sm font-medium transition-colors duration-200 ${
              pathname === href
                ? "text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Right CTA */}
      <Link
        href="/support"
        className="text-sm font-bold px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg transition-colors duration-200"
      >
        Submit Ticket
      </Link>
    </nav>
  );
}
