import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full border-t border-[#E5E0D8] py-16 mt-20 bg-white">
      <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row justify-between gap-12">
        <div className="flex flex-col items-center md:items-start gap-4 flex-1">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#F0EBE1]">
             <span className="font-serif italic text-lg text-[#4A4541]">A</span>
          </div>
          <p className="text-[#8A857D] text-sm max-w-[200px] text-center md:text-left leading-relaxed">
            Human-centered autonomous infrastructure.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-12 sm:gap-24 text-center sm:text-left">
          <div className="flex flex-col gap-4">
            <h4 className="font-serif text-[#2D2926] font-medium tracking-wide">Documentation</h4>
            <div className="flex flex-col gap-3">
              <Link href="/docs" className="text-sm text-[#8A857D] hover:text-[#2D2926] transition-colors">Docs Home</Link>
              <Link href="/docs/getting-started" className="text-sm text-[#8A857D] hover:text-[#2D2926] transition-colors">Getting Started</Link>
              <Link href="/docs/api-hooks" className="text-sm text-[#8A857D] hover:text-[#2D2926] transition-colors">API Reference</Link>
              <Link href="/docs/changelog" className="text-sm text-[#8A857D] hover:text-[#2D2926] transition-colors">Changelog</Link>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="font-serif text-[#2D2926] font-medium tracking-wide">Trust Center</h4>
            <div className="flex flex-col gap-3">
              <Link href="/security" className="text-sm text-[#8A857D] hover:text-[#2D2926] transition-colors">Security</Link>
              <Link href="/privacy" className="text-sm text-[#8A857D] hover:text-[#2D2926] transition-colors">Privacy Policy</Link>
              <Link href="/status" className="text-sm text-[#8A857D] hover:text-[#2D2926] transition-colors">System Status</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 mt-16 pt-8 border-t border-[#E5E0D8] text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-sm text-[#8A857D]">
          © 2026 Aria Platform. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
