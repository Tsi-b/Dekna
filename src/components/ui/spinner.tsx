import React, { useEffect, useRef, useState } from 'react';
import { SPINNER_FRAMES, SPINNER_INTERVAL_MS } from '@/lib/spinner';
import { cn } from '@/lib/utils';

// Type definitions
export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type SpinnerVariant = 'text' | 'visual';
export type SpinnerColor = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'white' | 'current';

export interface SpinnerProps {
  size?: SpinnerSize;
  variant?: SpinnerVariant;
  color?: SpinnerColor;
  label?: string;
  className?: string;
  'aria-label'?: string;
}

// Size mappings
const TEXT_SIZE_CLASSES: Record<SpinnerSize, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
};

const VISUAL_SIZE_CLASSES: Record<SpinnerSize, string> = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
  '2xl': 'w-16 h-16',
};

const VISUAL_BORDER_CLASSES: Record<SpinnerSize, string> = {
  xs: 'border-2',
  sm: 'border-2',
  md: 'border-2',
  lg: 'border-[3px]',
  xl: 'border-[3px]',
  '2xl': 'border-4',
};

// Color mappings - aligned with design tokens
const COLOR_CLASSES: Record<SpinnerColor, string> = {
  primary: 'text-foreground',                      // Design token: --foreground
  secondary: 'text-muted-foreground',              // Design token: --muted-foreground
  success: 'text-green-600 dark:text-green-400',   // Semantic color
  warning: 'text-amber-600 dark:text-amber-400',   // Semantic color
  danger: 'text-red-600 dark:text-red-400',        // Semantic color
  white: 'text-primary-foreground',                // Design token: --primary-foreground
  current: 'text-current',                         // Inherit from parent
};

/**
 * Text-based spinner using braille characters
 */
const TextSpinnerInternal: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'primary',
  label,
  className,
  'aria-label': ariaLabel,
}) => {
  const [frame, setFrame] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    timerRef.current = window.setInterval(() => {
      setFrame((f) => (f + 1) % SPINNER_FRAMES.length);
    }, SPINNER_INTERVAL_MS);

    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  return (
    <span
      className={cn('inline-flex items-center gap-2', className)}
      role="status"
      aria-live="polite"
      aria-label={ariaLabel || label || 'Loading'}
    >
      <span
        className={cn('font-mono', TEXT_SIZE_CLASSES[size], COLOR_CLASSES[color])}
        aria-hidden="true"
      >
        {SPINNER_FRAMES[frame]}
      </span>
      {label && (
        <span className={cn('font-medium', TEXT_SIZE_CLASSES[size], COLOR_CLASSES[color])}>
          {label}
        </span>
      )}
    </span>
  );
};

/**
 * Visual (SVG) spinner with rotating arc
 */
const VisualSpinnerInternal: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'primary',
  label,
  className,
  'aria-label': ariaLabel,
}) => {
  return (
    <span
      className={cn('inline-flex flex-col items-center gap-2', className)}
      role="status"
      aria-live="polite"
      aria-label={ariaLabel || label || 'Loading'}
    >
      <svg
        className={cn(
          VISUAL_SIZE_CLASSES[size],
          'animate-spin',
          'motion-reduce:animate-pulse'
        )}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className={COLOR_CLASSES[color]}
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      {label && (
        <span className={cn('font-medium', TEXT_SIZE_CLASSES[size], COLOR_CLASSES[color])}>
          {label}
        </span>
      )}
    </span>
  );
};

/**
 * Base Spinner component - supports both text and visual variants
 */
export const Spinner: React.FC<SpinnerProps> = ({ variant = 'text', ...props }) => {
  if (variant === 'visual') {
    return <VisualSpinnerInternal {...props} />;
  }
  return <TextSpinnerInternal {...props} />;
};

export default Spinner;
