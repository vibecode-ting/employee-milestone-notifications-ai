import React from 'react';
import { Sparkles, Shield, Zap } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Role } from '../../types';

interface GeminiBadgeProps {
  role: Role;
  size?: 'sm' | 'md';
  className?: string;
  showIcon?: boolean;
}

export function GeminiBadge({ role, size = 'sm', className, showIcon = true }: GeminiBadgeProps) {
  if (role === 'pro_plus') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 font-semibold rounded-full transition-all select-none',
          // Dark Mode: glowing, translucent dark pill badge with white text
          'dark:bg-[#0b1329]/90 dark:border dark:border-[#00b4ff]/40 dark:text-white dark:shadow-[0_0_10px_rgba(0,180,255,0.4)]',
          // Light Mode: Material Design crisp solid surface, subtle neutral border, vibrant primary accent gradient text
          'bg-white border border-slate-200 shadow-xs text-slate-800',
          size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
          className
        )}
      >
        {showIcon && (
          <Sparkles
            size={size === 'sm' ? 11 : 13}
            className="text-[#00b4ff] dark:text-[#38bdf8] shrink-0 animate-pulse"
          />
        )}
        <span className="font-extrabold tracking-wide dark:text-white bg-gradient-to-r from-[#1a73e8] via-[#6366f1] to-[#9333ea] dark:from-white dark:to-white bg-clip-text text-transparent">
          Ultra
        </span>
      </span>
    );
  }

  if (role === 'pro') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 font-semibold rounded-full transition-all select-none',
          // Dark Mode: glowing translucent dark pill with white text
          'dark:bg-[#0b1329]/90 dark:border dark:border-blue-500/40 dark:text-white dark:shadow-[0_0_8px_rgba(59,130,246,0.35)]',
          // Light Mode: Material Design crisp solid surface, subtle neutral border, vibrant primary text
          'bg-white border border-slate-200 shadow-xs text-[#1a73e8]',
          size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
          className
        )}
      >
        {showIcon && <Zap size={size === 'sm' ? 10 : 12} className="text-blue-500 dark:text-blue-400 shrink-0" />}
        <span className="font-bold tracking-wide">Pro</span>
      </span>
    );
  }

  if (role === 'admin') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 font-semibold rounded-full transition-all select-none',
          'dark:bg-emerald-950/70 dark:border dark:border-emerald-500/40 dark:text-emerald-300 dark:shadow-[0_0_8px_rgba(16,185,129,0.3)]',
          'bg-white border border-slate-200 shadow-xs text-emerald-700',
          size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
          className
        )}
      >
        {showIcon && <Shield size={size === 'sm' ? 10 : 12} className="text-emerald-500 shrink-0" />}
        <span className="font-bold">Admin</span>
      </span>
    );
  }

  // Free user
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium rounded-full transition-all select-none',
        'dark:bg-zinc-800/80 dark:border dark:border-zinc-700 dark:text-zinc-400',
        'bg-slate-100 border border-slate-200 text-slate-600',
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-xs',
        className
      )}
    >
      <span>Free</span>
    </span>
  );
}

interface GeminiAvatarRingProps {
  role?: Role;
  children: React.ReactNode;
  className?: string;
  sizeClass?: string;
}

export function GeminiAvatarRing({ role, children, className, sizeClass = 'p-[2px]' }: GeminiAvatarRingProps) {
  if (role === 'pro_plus') {
    return (
      <div
        className={cn(
          'rounded-full transition-all flex items-center justify-center shrink-0',
          // Dark Mode: neon blue/purple gradient profile ring + glow
          'dark:bg-gradient-to-tr dark:from-[#00b4ff] dark:via-[#1a73e8] dark:to-[#9333ea] dark:shadow-[0_0_12px_rgba(0,180,255,0.6)]',
          // Light Mode: Material Design crisp surface with vibrant primary accent ring
          'bg-white border border-slate-200 ring-2 ring-[#1a73e8]/50 shadow-xs',
          sizeClass,
          className
        )}
      >
        {children}
      </div>
    );
  }

  if (role === 'pro') {
    return (
      <div
        className={cn(
          'rounded-full transition-all flex items-center justify-center shrink-0',
          // Dark Mode: neon blue gradient
          'dark:bg-gradient-to-tr dark:from-[#38bdf8] dark:to-[#6366f1] dark:shadow-[0_0_8px_rgba(56,189,248,0.5)]',
          // Light Mode: crisp solid surface with neutral border and blue ring
          'bg-white border border-slate-200 ring-1.5 ring-blue-500/40 shadow-xs',
          sizeClass,
          className
        )}
      >
        {children}
      </div>
    );
  }

  if (role === 'admin') {
    return (
      <div
        className={cn(
          'rounded-full transition-all flex items-center justify-center shrink-0',
          'dark:bg-emerald-500 dark:shadow-[0_0_8px_rgba(16,185,129,0.5)]',
          'bg-white border border-emerald-400 ring-1 ring-emerald-500/40 shadow-xs',
          sizeClass,
          className
        )}
      >
        {children}
      </div>
    );
  }

  return (
    <div className={cn('rounded-full shrink-0', className)}>
      {children}
    </div>
  );
}
