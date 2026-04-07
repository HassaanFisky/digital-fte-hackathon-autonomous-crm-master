import Link from "next/link";

/**
 * HASSAAN AI ARCHITECT — Footer Component
 * Refactored for semantic theme switching and consistent branding.
 */
export default function Footer() {
  return (
    <footer className="w-full border-t border-border py-24 bg-card transition-colors duration-400">
      <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row justify-between gap-16">
        <div className="flex flex-col items-center md:items-start gap-6 flex-1">
          <div className="flex flex-col">
            <span className="text-sm font-serif font-bold tracking-[0.1em] text-foreground uppercase">HASSAAN</span>
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary">AI ARCHITECT</span>
          </div>
          <p className="text-muted-foreground text-sm max-w-[280px] text-center md:text-left leading-relaxed font-serif italic opacity-70">
            Designing human-centered autonomous infrastructure for the next generation of global interfaces.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-16 sm:gap-32 text-center sm:text-left">
          <div className="flex flex-col gap-6">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.5em] text-foreground opacity-40">Documentation</h4>
            <div className="flex flex-col gap-4">
              <Link href="/docs" className="text-[13px] font-medium text-muted-foreground hover:text-primary transition-colors">Protocol Home</Link>
              <Link href="/docs/getting-started" className="text-[13px] font-medium text-muted-foreground hover:text-primary transition-colors">Getting Started</Link>
              <Link href="/docs/api-hooks" className="text-[13px] font-medium text-muted-foreground hover:text-primary transition-colors">API Reference</Link>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.5em] text-foreground opacity-40">Trust Node</h4>
            <div className="flex flex-col gap-4">
              <Link href="/security" className="text-[13px] font-medium text-muted-foreground hover:text-primary transition-colors">Security Node</Link>
              <Link href="/privacy" className="text-[13px] font-medium text-muted-foreground hover:text-primary transition-colors">Privacy Protocol</Link>
              <Link href="/status" className="text-[13px] font-medium text-muted-foreground hover:text-primary transition-colors">System Status</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 mt-24 pt-10 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground/40">
          © 2026 HASSAAN AI ARCHITECT PLATFORM. ALL RIGHTS RESERVED.
        </p>
        <div className="flex items-center gap-8 text-muted-foreground/30">
           <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
           <span className="text-[9px] font-bold uppercase tracking-widest">Autonomous Sync: Active</span>
        </div>
      </div>
    </footer>
  );
}
