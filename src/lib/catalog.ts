import type { Product } from "@/types";

/**
 * Frontend-only helper to expand a small mock product list into a larger catalog.
 *
 * Goals:
 * - Deterministic: stable ids so cart/wishlist/quick-view work consistently.
 * - Phase 2 friendly: preserves supplier/offer fields.
 * - No backend changes.
 */
export function expandCatalog(base: Product[], countPerBucket: number): Product[] {
  if (countPerBucket <= 0) return [];

  const expanded: Product[] = [];

  for (const p of base) {
    // Each base product becomes a "bucket" that we clone into variations.
    for (let i = 0; i < countPerBucket; i++) {
      const suffix = String(i + 1).padStart(2, "0");

      // Slight deterministic variance for price/rating to avoid identical grids.
      const priceDelta = ((i % 5) - 2) * 1.5; // -3, -1.5, 0, +1.5, +3
      const ratingDelta = ((i % 3) - 1) * 0.1; // -0.1,0,+0.1

      const variantId = `${p.id}--v${suffix}`;

      const baseOffers = (p.offers?.length ? p.offers : [
        {
          id: `${p.id}::default`,
          productId: p.id,
          supplierId: p.supplierId,
          price: p.price,
          currency: p.currency,
          stockStatus: p.stockStatus,
          leadTimeDays: p.leadTimeDays,
          sellerRating: p.rating,
          sellerName: 'DEKNA Verified',
        },
      ]) as any[];

      // Ensure every product has 10 seller options (offers).
      // Deterministic variations by index.
      const offers = Array.from({ length: 10 }).map((_, offerIdx) => {
        const template = baseOffers[offerIdx % baseOffers.length];
        const offerSuffix = String(offerIdx + 1).padStart(2, '0');
        const offerPriceDelta = ((offerIdx % 5) - 2) * 2; // -4,-2,0,+2,+4
        const lead = (template.leadTimeDays ?? 3) + (offerIdx % 4); // 0..3 days added
        const rating = Math.min(5, Math.max(3.5, (template.sellerRating ?? p.rating) - 0.2 + (offerIdx % 3) * 0.2));

        return {
          ...template,
          id: `${template.id}--o${offerSuffix}--v${suffix}`,
          productId: variantId,
          supplierId: `${template.supplierId ?? p.supplierId}--${offerSuffix}`,
          sellerName: template.sellerName ?? `Seller ${offerSuffix}`,
          price: Math.max(1, Number(((template.price ?? p.price) + priceDelta + offerPriceDelta).toFixed(2))),
          leadTimeDays: lead,
          sellerRating: Number(rating.toFixed(1)),
          stockStatus: offerIdx === 0 ? 'inStock' : offerIdx % 7 === 0 ? 'backorder' : 'inStock',
        };
      });

      const next: Product = {
        ...p,
        id: variantId,
        name: `${p.name} • Option ${suffix}`,
        price: Math.max(1, Number((p.price + priceDelta).toFixed(2))),
        rating: Math.min(5, Math.max(0, Number((p.rating + ratingDelta).toFixed(1)))),
        // Keep originalPrice if present but ensure it's >= price
        originalPrice: p.originalPrice != null ? Math.max(p.originalPrice, p.price) : undefined,
        offers,
      };

      expanded.push(next);
    }
  }

  return expanded;
}
