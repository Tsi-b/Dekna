import type { Offer, Product } from "@/types";

/**
 * Ensure a product has multiple offers for UI demos (frontend-only).
 * If the product already has offers, returns them.
 */
export function ensureOfferOptions(product: Product, count: number = 10): Offer[] {
  if (product.offers?.length) return product.offers;

  const basePrice = product.price;
  const baseLead = product.leadTimeDays ?? 3;
  const baseRating = product.rating ?? 4.5;

  return Array.from({ length: count }).map((_, idx) => {
    const n = idx + 1;
    const suffix = String(n).padStart(2, "0");
    const priceDelta = ((idx % 5) - 2) * 2; // -4,-2,0,+2,+4
    const leadTimeDays = baseLead + (idx % 4);
    const sellerRating = Math.min(5, Math.max(3.5, baseRating - 0.2 + (idx % 3) * 0.2));

    return {
      id: `${product.id}::o${suffix}`,
      productId: product.id,
      supplierId: `${product.supplierId}--${suffix}`,
      sellerName: idx === 0 ? "DEKNA Verified" : `Seller ${suffix}`,
      price: Math.max(1, Number((basePrice + priceDelta).toFixed(2))),
      currency: product.currency,
      stockStatus: idx % 7 === 0 ? "backorder" : "inStock",
      leadTimeDays,
      sellerRating: Number(sellerRating.toFixed(1)),
    };
  });
}
