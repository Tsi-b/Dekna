import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from '@/types';
import ProductCard from './ProductCard';
import { SlidersHorizontal, ArrowRight } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  title?: string;
  subtitle?: string;
  onAddToCart: (product: Product) => void;
  onToggleWishlist: (productId: string) => void;
  wishlist: string[];
  onQuickView: (product: Product) => void;
  onViewOtherSellers?: (product: Product) => void;
  showFilters?: boolean;
  sortBy: string;
  onSortChange: (sort: string) => void;

  /** Pagination */
  page?: number;
  pageSize?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;

  /** Custom grid className (e.g. 4x9 for /collections/all) */
  gridClassName?: string;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  title,
  subtitle,
  onAddToCart,
  onToggleWishlist,
  wishlist,
  onQuickView,
  onViewOtherSellers,
  showFilters = true,
  sortBy,
  onSortChange,
  gridClassName,
}) => {
  const navigate = useNavigate();
  const sortOptions = [
    { id: 'featured', name: 'Featured' },
    { id: 'price-low', name: 'Price: Low to High' },
    { id: 'price-high', name: 'Price: High to Low' },
    { id: 'rating', name: 'Highest Rated' },
    { id: 'newest', name: 'Newest First' }
  ];

  return (
    <section className="py-10 sm:py-16 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        {(title || subtitle) && (
          <div className="text-center mb-8">
            {title && (
              <h2 className="section-title mb-4">{title}</h2>
            )}
            {subtitle && (
              <p className="section-subtitle">{subtitle}</p>
            )}
          </div>
        )}

        {/* Sort Bar */}
        {showFilters && (
          <div className="bg-white dark:bg-gray-950 rounded-xl shadow-sm p-4 mb-8 border border-transparent dark:border-gray-900">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-gray-500" />
                <select
                  value={sortBy}
                  onChange={(e) => onSortChange(e.target.value)}
                  className="bg-gray-100 dark:bg-gray-900 border-0 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  {sortOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">{products.length} products</span>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {products.length > 0 ? (
          <>
            {/* Responsive grid: 1 col on xs, 2 cols on sm, 3 cols on md, 4 cols on lg+ */}
            <div className={gridClassName ?? "grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6"}>
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
                onToggleWishlist={onToggleWishlist}
                isInWishlist={wishlist.includes(product.id)}
                onQuickView={onQuickView}
                onViewOtherSellers={onViewOtherSellers}
              />
            ))}
          </div>

          {showFilters && (
          <div className="mt-10 flex justify-center">
            <button
              type="button"
              onClick={() => {
                // Navigation action: handled by parent route.
                navigate(`/collections/all${window.location.search || ''}`);
              }}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors text-lg"
            >
              Show More
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
          )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <SlidersHorizontal className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No products found
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Try adjusting your filters or search query
            </p>
            <button
              type="button"
              onClick={() => navigate(`/collections/all${window.location.search || ''}`)}
              className="text-indigo-600 font-medium hover:underline"
            >
              View all products
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductGrid;
