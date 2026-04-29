import React from 'react';
import { Spinner, SpinnerSize, SpinnerVariant } from './spinner';
import { cn } from '@/lib/utils';

export type SectionLoaderHeight = 'compact' | 'default' | 'tall';

export interface SectionLoaderProps {
  label?: string;
  size?: Extract<SpinnerSize, 'md' | 'lg' | 'xl'>;
  variant?: SpinnerVariant;
  minHeight?: SectionLoaderHeight;
  className?: string;
}

const HEIGHT_CLASSES: Record<SectionLoaderHeight, string> = {
  compact: 'min-h-[120px]',
  default: 'min-h-[200px]',
  tall: 'min-h-[400px]',
};

const GAP_CLASSES: Record<SectionLoaderHeight, string> = {
  compact: 'gap-2',
  default: 'gap-3',
  tall: 'gap-4',
};

/**
 * Section-level loader
 * - Relative positioning (no overlay)
 * - Centered content
 * - Configurable min-height
 * - Inherits background from parent
 */
export const SectionLoader: React.FC<SectionLoaderProps> = ({
  label = 'Loading...',
  size = 'lg',
  variant = 'text',
  minHeight = 'default',
  className,
}) => {
  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-center',
        HEIGHT_CLASSES[minHeight],
        GAP_CLASSES[minHeight],
        className
      )}
      role="status"
      aria-live="polite"
    >
      <Spinner
        variant={variant}
        size={size}
        color="primary"
        label={label}
        className="flex flex-col items-center"
      />
    </div>
  );
};

export default SectionLoader;
