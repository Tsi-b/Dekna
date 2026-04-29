import React from 'react';
import { Product } from '@/types';
import { ShoppingCart, Heart, Leaf, Star, Eye } from 'lucide-react';
import { formatMoney } from '@/lib/money';
import { pickBestOffer } from '@/lib/offers';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onToggleWishlist: (productId: string) => void;
  isInWishlist: boolean;
  onQuickView: (product: Product) => void;
  onViewOtherSellers?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onToggleWishlist,
  isInWishlist,
  onQuickView,
  onViewOtherSellers,
}) => {
  const offers = product.offers ?? [];
  const bestOffer = offers.length ? pickBestOffer(offers) : undefined;

  const shownPrice = bestOffer?.price ?? product.price;
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - shownPrice) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="group bg-white dark:bg-gray-950 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-900 hover:-translate-y-1">
      {/* Image Container - Responsive aspect ratio */}
      <div className="relative aspect-square overflow-hidden bg-gray-50 dark:bg-gray-900">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Badges - Responsive sizing */}
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex flex-col gap-1.5 sm:gap-2">
          {product.isNew && (
            <span className="bg-teal-500 text-white text-[10px] sm:text-xs font-semibold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full">
              NEW
            </span>
          )}
          {product.isBestseller && (
            <span className="bg-amber-500 text-white text-[10px] sm:text-xs font-semibold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full">
              BESTSELLER
            </span>
          )}
          {discount > 0 && (
            <span className="bg-rose-500 text-white text-[10px] sm:text-xs font-semibold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full">
              -{discount}%
            </span>
          )}
          {offers.length > 1 && (
            <span className="bg-indigo-600 text-white text-[10px] sm:text-xs font-semibold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full">
              BEST OFFER
            </span>
          )}
        </div>

        {/* Eco Badge - Responsive sizing */}
        {product.isEcoFriendly && (
          <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-green-100 p-1.5 sm:p-2 rounded-full">
            <Leaf className="w-3 sm:w-4 h-3 sm:h-4 text-green-600" />
          </div>
        )}

        {/* Hover Actions - Touch-friendly on mobile */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300">
          <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 right-2 sm:right-3 flex gap-1.5 sm:gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 translate-y-0 sm:translate-y-4 sm:group-hover:translate-y-0 transition-all duration-300">
            <button
              data-testid="product-add-to-cart"
              onClick={() => onAddToCart(product)}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 transition-all shadow-md hover:shadow-lg min-h-[36px] sm:min-h-[40px]"
            >
              <ShoppingCart className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
              <span className="hidden xs:inline">Add to Cart</span>
              <span className="xs:hidden">Add</span>
            </button>
            <button
              onClick={() => onQuickView(product)}
              className="bg-white dark:bg-gray-950 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200 p-2 sm:p-2.5 rounded-lg sm:rounded-xl transition-all shadow-sm hover:shadow-md min-h-[36px] min-w-[36px] sm:min-h-[40px] sm:min-w-[40px] flex items-center justify-center"
              title="Quick View"
            >
              <Eye className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
            </button>
            <button
              onClick={() => onToggleWishlist(product.id)}
              className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl transition-colors min-h-[36px] min-w-[36px] sm:min-h-[40px] sm:min-w-[40px] flex items-center justify-center ${
                isInWishlist
                  ? 'bg-rose-500 text-white'
                  : 'bg-white dark:bg-gray-950 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200'
              }`}
              title={isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
            >
              <Heart className={`w-3.5 sm:w-4 h-3.5 sm:h-4 ${isInWishlist ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Content - Responsive padding and text sizing */}
      <div className="p-3 sm:p-4">
        {/* Category & Age - Responsive text */}
        <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
          <span className="text-[10px] sm:text-xs font-medium text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-1.5 sm:px-2 py-0.5 rounded-full capitalize">
            {product.category}
          </span>
          <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">{product.ageRange}</span>
        </div>

        {/* Name - Responsive sizing with flexible min-height */}
        <h3 className="font-semibold text-gray-900 dark:text-white mb-1.5 sm:mb-2 line-clamp-2 text-sm sm:text-base leading-tight sm:leading-normal">
          {product.name}
        </h3>

        {/* Rating - Responsive sizing */}
        <div className="flex items-center gap-1 sm:gap-1.5 mb-2 sm:mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 sm:w-3.5 h-3 sm:h-3.5 ${
                  i < Math.floor(product.rating)
                    ? 'text-amber-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
            {product.rating} ({product.reviews})
          </span>
        </div>

        {/* Price - Responsive sizing */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <span className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
            {formatMoney(shownPrice, product.currency)}
          </span>
          {product.originalPrice && (
            <span className="text-xs sm:text-sm text-gray-400 line-through">
              {formatMoney(product.originalPrice, product.currency)}
            </span>
          )}
        </div>

        {/* Stock Status - Responsive text */}
        <div className="mt-1.5 sm:mt-2">
          {product.stockStatus === 'inStock' ? (
            <span className="text-[10px] sm:text-xs text-green-600 font-medium">In Stock</span>
          ) : product.stockStatus === 'backorder' ? (
            <span className="text-[10px] sm:text-xs text-amber-600 font-medium">Backorder</span>
          ) : (
            <span className="text-[10px] sm:text-xs text-red-500 font-medium">Out of Stock</span>
          )}
        </div>

        {/* View other sellers - Responsive text */}
        {onViewOtherSellers && offers.length > 1 && (
          <button
            type="button"
            onClick={() => onViewOtherSellers(product)}
            className="mt-2 sm:mt-3 text-xs sm:text-sm font-semibold text-indigo-600 hover:text-indigo-700"
          >
            Compare other sellers
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
