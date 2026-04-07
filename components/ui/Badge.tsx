'use client';

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'outline' | 'ghost';
  dot?: boolean;
}

export const Badge = ({
  className,
  variant = 'primary',
  dot = false,
  children,
  ...props
}: BadgeProps) => {
  const variants = {
    primary: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    secondary: 'bg-slate-800 text-slate-400 border-slate-700',
    success: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    error: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    outline: 'bg-transparent text-slate-400 border border-slate-700',
    ghost: 'bg-white/5 text-slate-400 border border-transparent',
  };

  const dotColors = {
    primary: 'bg-indigo-500',
    secondary: 'bg-slate-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    error: 'bg-rose-500',
    outline: 'bg-slate-500',
    ghost: 'bg-slate-500',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-widest transition-all',
        variants[variant],
        className
      )}
      {...props}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', dotColors[variant])} />}
      {children}
    </div>
  );
};
