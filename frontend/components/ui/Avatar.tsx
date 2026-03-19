'use client';

import { motion } from 'framer-motion';
import { Bot, User } from 'lucide-react';
import Image from 'next/image';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AvatarProps {
  src?: string;
  name?: string;
  status?: 'online' | 'busy' | 'offline' | 'away';
  type?: 'bot' | 'human';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Avatar = ({
  src,
  name,
  status,
  type = 'human',
  size = 'md',
  className,
}: AvatarProps) => {
  const sizes = {
    sm: 'w-8 h-8 rounded-lg',
    md: 'w-10 h-10 rounded-xl',
    lg: 'w-12 h-12 rounded-2xl',
    xl: 'w-16 h-16 rounded-3xl',
  };

  const statusColors = {
    online: 'bg-emerald-500',
    busy: 'bg-rose-500',
    offline: 'bg-slate-700',
    away: 'bg-amber-500',
  };

  return (
    <div className={cn('relative inline-flex shrink-0', className)}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        className={cn(
          'flex items-center justify-center overflow-hidden border-2 transition-all',
          sizes[size],
          type === 'bot' 
            ? 'bg-emerald-500/10 border-emerald-500/30' 
            : 'bg-slate-800 border-white/5 shadow-inner'
        )}
      >
        {src ? (
          <Image
            src={src}
            alt={name || 'Avatar'}
            width={64}
            height={64}
            className="w-full h-full object-cover"
          />
        ) : type === 'bot' ? (
          <Bot className={cn('text-emerald-500', size === 'sm' ? 'w-4 h-4' : 'w-6 h-6')} />
        ) : (
          <User className={cn('text-slate-400', size === 'sm' ? 'w-4 h-4' : 'w-6 h-6')} />
        )}
      </motion.div>

      {/* Pulse effect for bot avatars */}
      {type === 'bot' && (
        <span className={cn('absolute inset-0 rounded-[inherit] border border-emerald-500 animate-[pulse_2s_infinite] opacity-30', sizes[size])} />
      )}

      {/* Online Status Indicator */}
      {status && (
        <span className={cn(
          'absolute border-2 border-slate-950 rounded-full',
          statusColors[status],
          size === 'sm' ? 'w-2.5 h-2.5 -right-0.5 -bottom-0.5' : 'w-3.5 h-3.5 -right-1 -bottom-1'
        )} />
      )}
    </div>
  );
};
