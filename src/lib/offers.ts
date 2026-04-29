import type { Offer, Product } from "@/types";

export type BestOfferReason = "lowestPrice" | "fastestDelivery" | "bestSeller" | "inStock";

export function scoreOffer(offer: Offer): number {
  // Higher score = better.
  // Phase 1 scoring: prioritize in-stock, then low price, then low lead time, then high seller rating.
  // We keep weights simple and tunable.

  const stockBoost = offer.stockStatus === "inStock" ? 1000 : offer.stockStatus === "backorder" ? 200 : -1000;

  // Normalize-ish values. Price dominates but not absolutely.
  const priceScore = -offer.price; // lower price => higher score
  const leadTimeScore = offer.leadTimeDays == null ? -10 : -offer.leadTimeDays * 2;
  const ratingScore = (offer.sellerRating ?? 0) * 10;

  return stockBoost + priceScore + leadTimeScore + ratingScore;
}

export function pickBestOffer(offers: Offer[]): Offer {
  if (offers.length === 0) {
    throw new Error("Cannot pick best offer from empty offers list");
  }
  return offers.reduce((best, current) => (scoreOffer(current) > scoreOffer(best) ? current : best));
}

export function getProductOffers(product: Product): Offer[] {
  // If a product doesn't have explicit offers (Phase 1), treat the product itself as a single offer.
  if (product.offers?.length) return product.offers;
  return [
    {
      id: `${product.id}::default`,
      productId: product.id,
      supplierId: product.supplierId,
      price: product.price,
      currency: product.currency,
      stockStatus: product.stockStatus,
      leadTimeDays: product.leadTimeDays,
      sellerRating: product.rating,
    },
  ];
}

export function explainBestOffer(best: Offer, offers: Offer[]): BestOfferReason[] {
  const reasons: BestOfferReason[] = [];

  const inStockOffers = offers.filter((o) => o.stockStatus === "inStock");
  if (best.stockStatus === "inStock" && inStockOffers.length !== offers.length) reasons.push("inStock");

  const minPrice = Math.min(...offers.map((o) => o.price));
  if (best.price === minPrice) reasons.push("lowestPrice");

  const leadTimes = offers.map((o) => (o.leadTimeDays == null ? Number.POSITIVE_INFINITY : o.leadTimeDays));
  const minLead = Math.min(...leadTimes);
  if ((best.leadTimeDays ?? Number.POSITIVE_INFINITY) === minLead && minLead !== Number.POSITIVE_INFINITY) {
    reasons.push("fastestDelivery");
  }

  const maxRating = Math.max(...offers.map((o) => o.sellerRating ?? 0));
  if ((best.sellerRating ?? 0) === maxRating && maxRating > 0) reasons.push("bestSeller");

  return reasons;
}
