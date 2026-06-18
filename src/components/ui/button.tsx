'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type Size = 'sm' | 'md' | 'lg' | 'icon';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variants: Record<Variant, string> = {
  primary:
    'bg-gradient-to-b from-primary-500 to-primary-600 text-white shadow-sm shadow-primary-600/30 ' +
    'hover:from-primary-500 hover:to-primary-700 hover:shadow-md hover:shadow-primary-600/40 ' +
    'active:from-primary-600 active:to-primary-800',
  secondary:
    'bg-primary-50/80 text-primary-700 backdrop-blur-sm hover:bg-primary-100 active:bg-primary-200',
  ghost: 'text-slate-600 hover:bg-slate-500/10 active:bg-slate-500/20',
  danger:
    'bg-gradient-to-b from-red-500 to-red-600 text-white shadow-sm shadow-red-600/30 ' +
    'hover:from-red-500 hover:to-red-700 hover:shadow-md hover:shadow-red-600/40 active:to-red-800',
  outline:
    'border border-slate-200/80 bg-white/70 text-slate-700 backdrop-blur-sm ' +
    'hover:bg-white hover:border-slate-300 active:bg-slate-50',
};

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
  icon: 'h-10 w-10',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex items-center justify-center rounded-xl font-medium',
        'transition-all duration-200 ease-out hover:-translate-y-px active:translate-y-0 active:scale-[0.98]',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500',
        'disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = 'Button';
