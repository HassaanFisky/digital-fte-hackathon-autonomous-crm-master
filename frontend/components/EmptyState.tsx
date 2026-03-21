import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  message: string;
  subMessage?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export default function EmptyState({
  icon: Icon,
  message,
  subMessage,
  ctaLabel,
  ctaHref,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-6">
        <Icon className="w-7 h-7 text-slate-500" />
      </div>
      <p className="text-white font-semibold text-lg mb-2">{message}</p>
      {subMessage && (
        <p className="text-slate-500 text-sm max-w-xs mx-auto mb-8">{subMessage}</p>
      )}
      {ctaLabel && ctaHref && (
        <Link
          href={ctaHref}
          className="inline-flex items-center px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-bold rounded-lg transition-colors duration-200"
        >
          {ctaLabel}
        </Link>
      )}
    </div>
  );
}
