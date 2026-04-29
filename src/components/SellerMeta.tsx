import React from 'react';

import type { CartItem } from '@/types';

interface SellerMetaProps {
  item: CartItem;
  onChangeSeller: (productId: string, offerId?: string) => void;
  /** Allows callers to preserve their existing typography sizing. */
  className?: string;
}

/**
 * Shared UI for displaying seller + delivery + "Change seller" affordance.
 * This is intentionally a presentational component (no business logic) to avoid changing behavior.
 */
const SellerMeta: React.FC<SellerMetaProps> = ({ item, onChangeSeller, className }) => {
  const sellerLabel =
    item.selectedOffer?.sellerName ?? `Seller ${item.selectedOffer?.supplierId ?? item.product.supplierId}`;

  const leadTimeDays = item.selectedOffer?.leadTimeDays ?? item.product.leadTimeDays;
  const showLeadTime = leadTimeDays != null;

  const hasOtherSellers = (item.product.offers?.length ?? 0) > 1;

  return (
    <div className={className}>
      <span className="font-medium text-muted-foreground">Sold by</span>{' '}
      <span className="text-foreground">{sellerLabel}</span>
      {showLeadTime ? (
        <>
          {' '}•{' '}
          <span className="text-muted-foreground">Delivers in {leadTimeDays} days</span>
        </>
      ) : null}
      {hasOtherSellers && (
        <>
          {' '}•{' '}
          <button
            type="button"
            onClick={() => onChangeSeller(item.product.id, item.selectedOffer?.id)}
            className="font-semibold text-primary hover:text-primary/90"
          >
            Compare sellers
          </button>
        </>
      )}
    </div>
  );
};

export default SellerMeta;
