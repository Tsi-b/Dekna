import { useEffect, useRef, useState } from "react";
import { SPINNER_FRAMES, SPINNER_INTERVAL_MS } from "@/lib/spinner";

type TextSpinnerProps = {
  label: string;
  frameClassName?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'white' | 'current';
};

// Size mappings for backward compatibility
const SIZE_CLASSES = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

// Color mappings - aligned with design tokens
const COLOR_CLASSES = {
  primary: 'text-foreground',                      // Design token: --foreground
  secondary: 'text-muted-foreground',              // Design token: --muted-foreground
  white: 'text-primary-foreground',                // Design token: --primary-foreground
  current: 'text-current',                         // Inherit from parent
};

/**
 * Text-based spinner that uses the exact same frames/cadence as the browser-tab spinner.
 * Designed to match RouteTitleManager behavior 1:1.
 * 
 * Enhanced with size and color variants for consistency.
 * Maintains backward compatibility with existing usage.
 */
export function TextSpinner({ 
  label, 
  frameClassName = "font-mono",
  size = 'md',
  color = 'current',
}: TextSpinnerProps) {
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

  const sizeClass = SIZE_CLASSES[size];
  const colorClass = COLOR_CLASSES[color];

  return (
    <span className="inline-flex items-center gap-2" role="status" aria-live="polite">
      <span 
        className={`${frameClassName} ${sizeClass} ${colorClass}`} 
        aria-hidden="true"
      >
        {SPINNER_FRAMES[frame]}
      </span>
      <span className={`font-medium ${sizeClass} ${colorClass}`}>{label}</span>
    </span>
  );
}
