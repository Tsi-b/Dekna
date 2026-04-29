export type CurrencyCode = 'ETB';

export type StockStatus = 'inStock' | 'outOfStock' | 'backorder';

export interface Offer {
  id: string;
  productId: string;
  supplierId: string;
  externalSku?: string;
  externalProductId?: string;
  price: number;
  currency: CurrencyCode;
  stockStatus: StockStatus;
  leadTimeDays?: number;
  /** 0-5 */
  sellerRating?: number;
  sellerName?: string;
}

export interface Product {
  /** Internal catalog id */
  id: string;
  name: string;

  /**
   * Phase 1 (frontend schema): price is stored on the product (single-offer view).
   * Phase 2: price moves to Offer, and Product will reference offers.
   */
  price: number;
  originalPrice?: number;
  currency: CurrencyCode;

  image: string;
  category: 'clothing' | 'toys' | 'gear';
  ageRange: string;

  sizes?: string[];
  colors?: string[];

  rating: number;
  reviews: number;

  /** Phase 1: keep compatibility while introducing new stockStatus */
  inStock: boolean;
  stockStatus: StockStatus;

  /** Phase 1 catalog enrichment */
  tags: string[];
  supplierId: string;
  externalProductId?: string;
  externalSku?: string;

  /** Offer-like signals (frontend-only for now) */
  leadTimeDays?: number;

  /** Phase 2-ready: supplier offers for this product (mocked in Phase 1) */
  offers?: Offer[];

  isNew?: boolean;
  isBestseller?: boolean;
  isEcoFriendly?: boolean;
  description: string;
}

export interface CartItem {
  /** Unique line identifier to avoid collisions across offers/sizes/colors */
  lineId: string;

  product: Product;
  /** Selected offer (Phase 1.5). If absent, product itself is treated as the offer. */
  selectedOffer?: Offer;

  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  giftWrap?: boolean;
}

export interface Category {
  id: string;
  name: string;
  image: string;
  productCount: number;
  description: string;
}

export interface FilterState {
  category: string;
  priceRange: [number, number];
  ageRange: string;
  sortBy: string;
  searchQuery: string;
}
