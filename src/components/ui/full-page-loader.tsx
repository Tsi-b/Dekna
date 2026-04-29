import React from 'react';
import { Spinner, SpinnerSize, SpinnerVariant } from './spinner';
import { cn } from '@/lib/utils';

export interface FullPageLoaderProps {
  label?: string;
  size?: Extract<SpinnerSize, 'xl' | '2xl'>;
  variant?: SpinnerVariant;
  className?: string;
}

/**
 * Full-page loader with overlay
 * - Fixed positioning covering entire viewport
 * - Backdrop blur effect
 * - Centered spinner + label
 * - z-50 to appear above all content
 */
export const FullPageLoader: React.FC<FullPageLoaderProps> = ({
  label = 'Loading...',
  size = 'xl',
  variant = 'visual',
  className,
}) => {
  return (
    <div
      className={cn(
        'fixed inset-0 z-50',
        'bg-black/60 dark:bg-black/80 backdrop-blur-sm',
        'flex items-center justify-center',
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-4">
        <Spinner
          variant={variant}
          size={size}
          color="white"
          label={label}
          className="flex flex-col items-center text-white"
        />
      </div>
    </div>
  );
};

export default FullPageLoader;
