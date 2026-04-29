import React from 'react';

interface BestOfferNoticeProps {
  /** If false, render nothing. */
  show: boolean;
  /** Optional additional helper copy under the headline. */
  helperText?: string;
  className?: string;
}

/**
 * Centralized banner used anywhere we auto-select an offer among multiple sellers.
 * Keeps copy + styling consistent across Quick View, Cart, and Checkout.
 */
export const BestOfferNotice: React.FC<BestOfferNoticeProps> = ({ show, helperText, className }) => {
  if (!show) return null;

  return (
    <div className={`rounded-xl border border-border bg-indigo-50 dark:bg-indigo-900/20 p-3 ${className || ''}`.trim()}>
      <div className="text-sm font-semibold text-indigo-900 dark:text-indigo-100">Best offer selected</div>
      <div className="text-xs text-indigo-700 dark:text-indigo-300 mt-0.5">
        {helperText ?? 'We automatically pick the best offer based on price, delivery speed, and seller rating.'}
      </div>
    </div>
  );
};

export default BestOfferNotice;
