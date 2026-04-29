import React from 'react';
import { Spinner, SpinnerVariant } from './spinner';

export interface ButtonSpinnerProps {
  label: string;
  size?: 'sm' | 'md';
  variant?: SpinnerVariant;
  color?: 'primary' | 'white' | 'current';
}

/**
 * Optimized spinner for button contexts
 * - Horizontal layout (spinner + label inline)
 * - Appropriate sizing for buttons
 * - Maintains button dimensions during loading
 */
export const ButtonSpinner: React.FC<ButtonSpinnerProps> = ({
  label,
  size = 'sm',
  variant = 'text',
  color = 'current',
}) => {
  return (
    <Spinner
      variant={variant}
      size={size}
      color={color}
      label={label}
      className="inline-flex items-center gap-2"
    />
  );
};

export default ButtonSpinner;
