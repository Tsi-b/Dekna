/**
 * Unified Spinner/Loading System
 * 
 * Centralized exports for all spinner and loader components.
 * Provides consistent, reusable, and scalable loading indicators.
 */

// Base components
export { Spinner } from './spinner';
export type { SpinnerProps, SpinnerSize, SpinnerVariant, SpinnerColor } from './spinner';

// Composite components
export { ButtonSpinner } from './button-spinner';
export type { ButtonSpinnerProps } from './button-spinner';

export { SectionLoader } from './section-loader';
export type { SectionLoaderProps, SectionLoaderHeight } from './section-loader';

export { FullPageLoader } from './full-page-loader';
export type { FullPageLoaderProps } from './full-page-loader';

// Legacy component (enhanced with new features, backward compatible)
export { TextSpinner } from './text-spinner';
