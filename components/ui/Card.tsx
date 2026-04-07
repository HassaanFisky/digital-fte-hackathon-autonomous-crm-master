'use client';

import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { HTMLMotionProps } from 'framer-motion';

interface CardProps extends HTMLMotionProps<"div"> {
  variant?: 'solid' | 'glass' | 'indigo' | 'emerald';
  hoverable?: boolean;
}

export const Card = ({
  className,
  variant = 'solid',
  hoverable = false,
  children,
  ...props
}: CardProps) => {
  const variants = {
    solid: 'bg-slate-900 border-slate-800 shadow-xl',
    glass: 'bg-white/5 backdrop-blur-md border-white/10 shadow-2xl',
    indigo: 'bg-indigo-500/5 border-indigo-500/10 shadow-xl shadow-indigo-500/5',
    emerald: 'bg-emerald-500/5 border-emerald-500/10 shadow-xl shadow-emerald-500/5',
  };

  return (
    <motion.div
      initial={hoverable ? { y: 0 } : undefined}
      whileHover={hoverable ? { y: -4, scale: 1.01 } : undefined}
      transition={{ duration: 0.2 }}
      className={cn(
        'group relative overflow-hidden rounded-3xl border p-6 transition-all',
        variants[variant],
        hoverable ? 'hover:border-emerald-500/30' : '',
        className
      )}
      {...props}
    >
      {/* Glow highlight for hoverable cards */}
      {hoverable && (
        <span className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      )}
      {children as React.ReactNode}
    </motion.div>
  );
};

export const CardHeader = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn('mb-6 flex items-center justify-between', className)}>
    {children}
  </div>
);

export const CardTitle = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <h3 className={cn('text-lg font-bold text-white', className)}>{children}</h3>
);

export const CardDescription = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <p className={cn('text-xs font-medium text-slate-500 uppercase tracking-widest', className)}>{children}</p>
);

export const CardContent = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn('space-y-4', className)}>{children}</div>
);

export const CardFooter = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn('mt-8 flex items-center justify-end gap-3', className)}>{children}</div>
);
