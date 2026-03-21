export default function Footer() {
  return (
    <footer className="w-full border-t border-[#E5E0D8] py-16 mt-20 bg-white">
      <div className="max-w-[1200px] mx-auto px-6 flex flex-col items-center justify-between gap-8 md:flex-row">
        <div className="flex flex-col items-center md:items-start gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#F0EBE1] mb-2">
             <span className="font-serif italic text-sm text-[#4A4541]">A</span>
          </div>
          <p className="text-[#8A857D] text-sm">
            Human-centered autonomous infrastructure.
          </p>
        </div>

        <div className="flex gap-8">
          <a href="#" className="text-sm font-medium text-[#8A857D] hover:text-[#2D2926] transition-colors">Documentation</a>
          <a href="#" className="text-sm font-medium text-[#8A857D] hover:text-[#2D2926] transition-colors">Security</a>
          <a href="#" className="text-sm font-medium text-[#8A857D] hover:text-[#2D2926] transition-colors">Privacy</a>
        </div>

        <p className="text-sm text-[#8A857D]">
          © 2026 Aria Platform
        </p>
      </div>
    </footer>
  );
}
