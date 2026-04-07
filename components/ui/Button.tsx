'use client';

import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'premium';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = ({
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  ...props
}: ButtonProps) => {
  const variants = {
    primary: 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-lg shadow-emerald-500/20 font-bold',
    secondary: 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-700 font-bold',
    ghost: 'bg-transparent text-slate-400 hover:text-white hover:bg-white/5 font-medium',
    outline: 'bg-transparent text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/10 font-bold',
    danger: 'bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20 font-bold',
    premium: 'bg-gradient-to-r from-indigo-500 to-emerald-500 text-white font-extrabold hover:opacity-90 shadow-xl shadow-indigo-500/20',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs rounded-lg',
    md: 'px-5 py-2.5 text-sm rounded-xl',
    lg: 'px-8 py-4 text-base rounded-2xl',
    icon: 'p-2.5 rounded-xl aspect-square flex items-center justify-center',
  };

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      disabled={isLoading || disabled}
      className={cn(
        'group relative inline-flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          {leftIcon && <span className="transition-transform group-hover:-translate-x-0.5">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="transition-transform group-hover:translate-x-0.5">{rightIcon}</span>}
        </>
      )}
      
      {/* Glare effect for premium variant */}
      {variant === 'premium' && (
        <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[inherit] pointer-events-none" />
      )}
    </motion.button>
  );
};
