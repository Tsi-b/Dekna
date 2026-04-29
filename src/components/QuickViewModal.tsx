import React, { useEffect, useState } from 'react';
import { formatMoney } from '@/lib/money';
import BestOfferNotice from '@/components/BestOfferNotice';
import { Offer, Product } from '@/types';
import { explainBestOffer, pickBestOffer } from '@/lib/offers';
import { X, Leaf, Star, Minus, Plus, ShoppingCart, Heart, Check } from 'lucide-react';

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, size?: string, color?: string, offer?: import('@/types').Offer) => void;
  onToggleWishlist: (productId: string) => void;
  isInWishlist: boolean;
  /** When opened from cart/checkout, preselect the currently chosen offer */
  initialOfferId?: string;

  /** Open with the seller list expanded */
  initialShowOtherSellers?: boolean;
}

const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onToggleWishlist,
  isInWishlist,
  initialOfferId,
  initialShowOtherSellers,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [addedToCart, setAddedToCart] = useState(false);

  const offers: Offer[] = product?.offers ?? [];
  const bestOffer = offers.length ? pickBestOffer(offers) : undefined;

  const [showOtherSellers, setShowOtherSellers] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState<string>(bestOffer?.id ?? '');

  useEffect(() => {
    if (!product) return;
    const nextOffers = product.offers ?? [];
    const nextBest = nextOffers.length ? pickBestOffer(nextOffers) : undefined;

    // If an explicit offer id is provided (e.g., from cart/checkout), honor it.
    const requested = initialOfferId && nextOffers.some((o) => o.id === initialOfferId) ? initialOfferId : undefined;

    setSelectedOfferId(requested ?? nextBest?.id ?? '');
    setShowOtherSellers(Boolean(initialShowOtherSellers) && nextOffers.length > 1);
  }, [product, initialOfferId, initialShowOtherSellers]);

  const selectedOffer = offers.find((o) => o.id === selectedOfferId) ?? bestOffer;
  const bestReasons = bestOffer ? explainBestOffer(bestOffer, offers) : [];

  if (!isOpen || !product) return null;

  const handleAddToCart = () => {
    onAddToCart(product, quantity, selectedSize, selectedColor, selectedOffer ?? undefined);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-950 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] sm:max-h-[90vh] overflow-hidden animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/90 dark:bg-gray-950/80 hover:bg-white dark:hover:bg-white/10 rounded-full shadow-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-600 dark:text-gray-200" />
        </button>

        <div className="grid md:grid-cols-2 gap-0">
          {/* Image */}
          <div className="relative bg-gray-50 dark:bg-gray-900 aspect-square md:aspect-auto">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.isNew && (
                <span className="bg-teal-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  NEW
                </span>
              )}
              {product.isBestseller && (
                <span className="bg-amber-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  BESTSELLER
                </span>
              )}
              {product.isEcoFriendly && (
                <span className="bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                  <Leaf className="w-3 h-3" /> ECO
                </span>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 md:p-8 overflow-y-auto max-h-[58vh] sm:max-h-[60vh] md:max-h-[90vh]">
            {/* Category & Age */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full capitalize">
                {product.category}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">Ages {product.ageRange}</span>
            </div>

            {/* Name */}
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">
              {product.name}
            </h2>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating)
                        ? 'text-amber-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {product.rating} ({product.reviews} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                {formatMoney(selectedOffer?.price ?? product.price, selectedOffer?.currency ?? product.currency)}
              </span>
              {product.originalPrice && (
                <>
                  <span className="text-xl text-gray-400 line-through">
                    {formatMoney(product.originalPrice, product.currency)}
                  </span>
                  <span className="bg-rose-100 text-rose-600 text-sm font-semibold px-2 py-0.5 rounded">
                    Save {formatMoney(product.originalPrice - (selectedOffer?.price ?? product.price), product.currency)}
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-600 dark:text-gray-300 mb-6">{product.description}</p>

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Size
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                        selectedSize === size
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                        selectedColor === color
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Best Offer / Other Sellers */}
            {offers.length > 1 && (
              <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl p-4 mb-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <BestOfferNotice
                      show={true}
                      className="p-0 border-0 bg-transparent"
                      helperText="We automatically pick the best offer based on price, delivery speed, and seller rating."
                    />
                    {bestOffer && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {bestReasons.includes('inStock') && (
                          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-700">In stock</span>
                        )}
                        {bestReasons.includes('lowestPrice') && (
                          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-rose-100 text-rose-700">Lowest price</span>
                        )}
                        {bestReasons.includes('fastestDelivery') && (
                          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-amber-100 text-amber-800">Fastest delivery</span>
                        )}
                        {bestReasons.includes('bestSeller') && (
                          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-indigo-100 text-indigo-700">Top-rated seller</span>
                        )}
                      </div>
                    )}
                    {bestOffer && (
                      <div className="mt-3 text-xs text-indigo-800">
                        <span className="font-semibold">Selected:</span> {bestOffer.sellerName ?? `Seller ${bestOffer.supplierId}`}
                        {bestOffer.leadTimeDays != null ? ` • ${bestOffer.leadTimeDays} days` : ''}
                        {bestOffer.sellerRating != null ? ` • ${bestOffer.sellerRating.toFixed(1)}★` : ''}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowOtherSellers((v) => !v)}
                    aria-expanded={showOtherSellers}
                    className="text-sm font-semibold text-indigo-700 hover:text-indigo-800 bg-indigo-100 hover:bg-indigo-200 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                  >
                    {showOtherSellers ? 'Hide other sellers' : 'Compare other sellers'}
                    <span className={`transition-transform ${showOtherSellers ? 'rotate-180' : ''}`}>▼</span>
                  </button>
                </div>

                {showOtherSellers && (
                  <div className="mt-4 space-y-2">
                    {offers.map((o) => {
                      const isBest = bestOffer?.id === o.id;
                      return (
                      <label
                        key={o.id}
                        className={`flex items-center justify-between gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                          selectedOfferId === o.id ? 'border-indigo-400 bg-white' : 'border-indigo-100 bg-indigo-50 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="offer"
                            checked={selectedOfferId === o.id}
                            onChange={() => setSelectedOfferId(o.id)}
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <div className="text-sm font-medium text-gray-900">{o.sellerName ?? `Seller ${o.supplierId}`}</div>
                              {isBest && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white">BEST</span>
                              )}
                            </div>
                            <div className="text-xs text-gray-600">
                              {o.stockStatus === 'inStock'
                                ? 'In stock'
                                : o.stockStatus === 'backorder'
                                  ? 'Backorder'
                                  : 'Out of stock'}
                              {o.leadTimeDays != null ? ` • ${o.leadTimeDays} days` : ''}
                              {o.sellerRating != null ? ` • ${o.sellerRating.toFixed(1)}★` : ''}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm font-semibold text-gray-900 whitespace-nowrap">{formatMoney(o.price, o.currency)}</div>
                      </label>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Quantity
              </label>
              <div className="flex items-center bg-gray-100 dark:bg-gray-900 rounded-xl w-fit">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors rounded-l-xl"
                >
                  <Minus className="w-5 h-5 text-gray-600 dark:text-gray-200" />
                </button>
                <span className="px-6 py-3 font-semibold text-gray-900 dark:text-gray-100 min-w-[60px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-3 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors rounded-r-xl"
                >
                  <Plus className="w-5 h-5 text-gray-600 dark:text-gray-200" />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAddToCart}
                disabled={addedToCart}
                className={`flex-1 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                  addedToCart
                    ? 'bg-green-500 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {addedToCart ? (
                  <>
                    <Check className="w-5 h-5" />
                    Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart - {formatMoney((selectedOffer?.price ?? product.price) * quantity, selectedOffer?.currency ?? product.currency)}
                  </>
                )}
              </button>
              <button
                onClick={() => onToggleWishlist(product.id)}
                className={`w-full sm:w-auto p-4 rounded-xl transition-colors ${
                  isInWishlist
                    ? 'bg-rose-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200'
                }`}
              >
                <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Trust Badges */}
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-900">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-indigo-600 font-bold text-lg">60-Day</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Returns</div>
                </div>
                <div>
                  <div className="text-indigo-600 font-bold text-lg">Free</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Shipping $75+</div>
                </div>
                <div>
                  <div className="text-indigo-600 font-bold text-lg">100%</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Safe & Tested</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
