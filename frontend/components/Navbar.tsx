'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bot, AlertCircle } from 'lucide-react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function Navbar() {
  const pathname = usePathname();

  const { data: health, error } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/health`,
    fetcher,
    { refreshInterval: 60000, keepPreviousData: true }
  );

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Submit Ticket', href: '/support' },
    { name: 'Dashboard', href: '/dashboard' },
  ];

  const isHealthy = health?.status === 'healthy';
  const dotColor = error || (health && !isHealthy) ? 'bg-red' : 'bg-em';

  return (
    <nav className="sticky top-0 z-[999] bg-bg/85 backdrop-blur-xl border-b border-border h-[56px] flex items-center justify-between mt-0 pt-0">
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 font-head text-lg font-extrabold tracking-tight hover:opacity-80 transition-opacity">
          <div className={`w-2.5 h-2.5 rounded-full ${dotColor} ${isHealthy ? 'animate-pulse-live' : ''} shadow-[0_0_8px_currentColor] opacity-90`} />
          ARIA<span className="text-em">FTE</span>
        </Link>
        {health && (
          <div className="hidden md:flex ml-4 gap-2 items-center">
             <span className="text-[10px] font-mono text-text3 tracking-wider bg-surface px-2 py-0.5 rounded-md border border-border2">DB: {health.database.toUpperCase()}</span>
          </div>
        )}
      </div>
      
      <div className="flex gap-1">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`px-3.5 py-1.5 rounded-lg font-body text-[13px] font-medium transition-all ${
              pathname === link.href 
                ? 'bg-card text-em border border-border2 shadow-sm' 
                : 'text-text2 hover:bg-card hover:text-text border border-transparent'
            }`}
          >
            {link.name}
          </Link>
        ))}
      </div>

      <Link href="/support">
        <button className="bg-em hover:bg-em2 text-bg px-4.5 py-1.5 rounded-lg font-body text-[13px] font-semibold transition-all shadow-em-glow hover:shadow-lg active:translate-y-px">
          Get Support →
        </button>
      </Link>
    </nav>
  );
}
