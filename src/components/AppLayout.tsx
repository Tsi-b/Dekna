import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Product, CartItem, Offer } from '@/types';
import { getProductOffers, pickBestOffer } from '@/lib/offers';
import { ensureOfferOptions } from '@/lib/offer_options';
import { products as baseProducts } from '@/data/products';
import { expandCatalog } from '@/lib/catalog';
import { parseAgeRangeToMonths, rangesOverlap } from '@/lib/age';
import { toast } from '@/hooks/use-toast';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useAuth } from '@/hooks/use-auth';
import SEO from './SEO';
import { OrganizationSchema, WebSiteSchema, BreadcrumbSchema } from './StructuredData';
import Header from './Header';
import HeroSection from './HeroSection';
import CategorySection from './CategorySection';
import ProductGrid from './ProductGrid';
import FeaturesSection from './FeaturesSection';
import TestimonialsSection from './TestimonialsSection';
import PromoBanner from './PromoBanner';
import AgeGuideSection from './AgeGuideSection';
import Footer from './Footer';
import CartModal from './CartModal';
import QuickViewModal from './QuickViewModal';
import AuthModal from './AuthModal';
import AccountModal from './AccountModal';
import CheckoutModal from './CheckoutModal';
import { Separator } from './ui/separator';

const COLLECTION_CATEGORY_LABELS: Record<string, string> = {
  all: 'All',

  // Home category cards
  feeding: 'Feeding',
  healthcare: 'Baby Care',
  toys: 'Toys',
  gifts: 'Gifts',

  // Shop by Age (collections slugs)
  'age-newborn-infant': 'Newborn & Infant',
  'age-toddler': 'Toddler',
  'age-preschooler': 'Preschooler',
  'age-big-kid': 'Big Kid',

  // New Essentials (dedicated slugs)
  'travel-systems': 'Travel Essentials',
  'bathing-changing': 'Bathing & changing',
  'healthcare-safety': 'Healthcare & safety',
  'cribs-beddings': 'Cribs & bedding',
  'walkers-jumpers-swings': 'Walkers, jumpers & swings',

  // Existing header categories (kept)
  clothing: 'Kids Clothing',
  gear: 'Baby Gear',
  school: 'School',
  books: 'Books',
  'home-accessories': 'Home Accessories',
};

const AppLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const { user, wishlistIds, addToWishlist, removeFromWishlist } = useAuth();

  // State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  // Route-driven modal state
  const isCartOpen = location.pathname.startsWith('/cart');
  const isAuthModalOpen = location.pathname.startsWith('/auth');
  const isAccountModalOpen = location.pathname.startsWith('/account');
  const isCheckoutOpen = location.pathname.startsWith('/checkout');

  // URL-driven storefront state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');

  const isHome = location.pathname === '/';
  const isCollections = location.pathname.startsWith('/collections');
  const isSearch = location.pathname.startsWith('/search');

  // Debounced query param updates for smoother live-search UX.
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 200);

  const setStorefrontParams = useCallback((next: { q?: string; sort?: string }) => {
    // Only mutate query params on routes that use the product grid.
    if (!isHome && !isCollections && !isSearch) return;

    const params = new URLSearchParams(location.search);

    if (typeof next.q !== 'undefined') {
      const q = next.q.trim();
      if (q) params.set('q', q);
      else params.delete('q');
    }

    if (typeof next.sort !== 'undefined') {
      const s = next.sort.trim();
      if (s && s !== 'featured') params.set('sort', s);
      else params.delete('sort');
    }

    const qs = params.toString();
    const nextUrl = qs ? `${location.pathname}?${qs}` : location.pathname;
    // Avoid redundant navigation which can cause render loops.
    const currentUrl = `${location.pathname}${location.search}`;
    if (nextUrl !== currentUrl) {
      navigate(nextUrl, { replace: true });
    }
  }, [isHome, isCollections, isSearch, location.pathname, location.search, navigate]);

  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [quickViewInitialOfferId, setQuickViewInitialOfferId] = useState<string | undefined>(undefined);
  const [quickViewInitialShowOtherSellers, setQuickViewInitialShowOtherSellers] = useState<boolean>(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  // Ref for scrolling to products
  const productsRef = useRef<HTMLDivElement>(null);

  const collectionsCategory = isCollections ? (params.category || 'all') : null;

  const pageParam = new URLSearchParams(location.search).get('page');
  const currentPage = Math.max(1, Number(pageParam || 1) || 1);

  const isCollectionsAll = isCollections && selectedCategory === 'all';
  const collectionsPageSize = isCollections ? (isCollectionsAll ? 36 : 16) : undefined;

  // Sync URL-driven state (supports reload and back/forward)
  useEffect(() => {
    // Only parse on routes that use the product grid.
    if (!isHome && !isCollections && !isSearch) return;

    const sp = new URLSearchParams(location.search);
    const q = sp.get('q') || '';
    const sort = sp.get('sort') || 'featured';

    setSearchQuery(q);
    setSortBy(sort);

    if (isCollections) {
      const nextCategory = (params.category || 'all').toLowerCase();
      // If an unknown category is provided, normalize to /collections/all.
      if (!COLLECTION_CATEGORY_LABELS[nextCategory]) {
        navigate('/collections/all', { replace: true });
        setSelectedCategory('all');
      } else {
        setSelectedCategory(nextCategory);
      }
    } else if (isSearch) {
      setSelectedCategory('all');
    } else {
      // Home page still supports optional category via query param.
      const category = sp.get('category') || 'all';
      setSelectedCategory(category);
    }
  }, [isHome, isCollections, isSearch, location.pathname, location.search, params.category, navigate]);

  // Wishlist is only available for signed-in users
  const wishlist = user ? wishlistIds : [];

  const catalogProducts = useMemo(() => {
    // Only expand the catalog for /collections/* routes to avoid inflating the entire storefront.
    // For non-collections pages, ensure products have multiple offers (for "View other sellers" UI).
    if (!isCollections) {
      return baseProducts.map((p) => ({
        ...p,
        offers: ensureOfferOptions(p, 10),
      }));
    }

    // Expand by 50 variants per base item; we will cap results per route later.
    return expandCatalog(baseProducts, 50);
  }, [isCollections]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...catalogProducts];

    // Filter by search query (live).
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          p.ageRange.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      // Shop by Age: dedicated collections slugs map to month ranges.
      const ageMapMonths: Record<string, { min: number; max: number }> = {
        'age-newborn-infant': { min: 0, max: 12 },
        'age-toddler': { min: 12, max: 24 },
        'age-preschooler': { min: 36, max: 60 },
        'age-big-kid': { min: 72, max: 96 },
      };

      if (ageMapMonths[selectedCategory]) {
        const target = ageMapMonths[selectedCategory];
        result = result.filter((p) => {
          const parsed = parseAgeRangeToMonths(p.ageRange);
          if (!parsed) return false;
          return rangesOverlap(parsed, target);
        });
      } else { 
        // Additional nav categories are mapped to existing product categories.
        // This preserves existing product data structures while keeping the UI coherent.
        const categoryMap: Record<string, string[]> = {
        // New home categories
        feeding: ['gear'],
        healthcare: ['gear'],
        toys: ['toys'],
        gifts: ['clothing', 'toys', 'gear'],

        // New Essentials (dedicated slugs)
        'travel-systems': ['gear'],
        'bathing-changing': ['gear'],
        'healthcare-safety': ['gear'],
        'cribs-beddings': ['gear'],
        'walkers-jumpers-swings': ['gear'],

        // Existing header categories
        clothing: ['clothing'],
        gear: ['gear'],
        school: ['clothing', 'toys'],
        books: ['toys'],
        'home-accessories': ['gear'],
      };

        const allowed = categoryMap[selectedCategory] || [selectedCategory];
        result = result.filter((p) => allowed.includes(p.category));
      }
    }

    // Sort
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      default:
        // Featured - bestsellers first
        result.sort((a, b) => (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0));
    }

    // Collections caps:
    // - /collections/:category => 50 items
    // - /collections/all => 300 items (6 * 50)
    if (isCollections) {
      const cap = selectedCategory === 'all' ? 300 : 50;
      result = result.slice(0, cap);
    }

    return result;
  }, [catalogProducts, searchQuery, selectedCategory, sortBy, isCollections]);

  // Sync debounced search query into URL query params for shareable links.
  // On /search, only update via explicit submit to avoid navigation loops.
  useEffect(() => {
    if (!isHome && !isCollections && !isSearch) return;
    // On /search, user must explicitly submit (Enter or button click)
    if (isSearch) return;
    setStorefrontParams({ q: debouncedSearchQuery });
  }, [debouncedSearchQuery, isHome, isCollections, isSearch, setStorefrontParams]);

  const collectionsTotalItems = isCollections ? filteredProducts.length : undefined;

  const pagedProducts = useMemo(() => {
    if (!isCollections) return filteredProducts;

    const size = collectionsPageSize ?? 16;
    const total = collectionsTotalItems ?? 0;
    const maxPage = Math.max(1, Math.ceil(total / size));
    const safePage = Math.min(currentPage, maxPage);
    const start = (safePage - 1) * size;
    return filteredProducts.slice(start, start + size);
  }, [filteredProducts, isCollections, collectionsPageSize, collectionsTotalItems, currentPage]);

  // Cart functions
  const addToCart = (product: Product, quantity = 1, size?: string, color?: string, offer?: Offer) => {
    setCartItems((prev) => {
      const chosenOffer = offer ?? pickBestOffer(getProductOffers(product));
      const nextSize = size || product.sizes?.[0];
      const nextColor = color || product.colors?.[0];
      const lineId = `${product.id}::${chosenOffer.id}::${nextSize ?? ''}::${nextColor ?? ''}`;

      const existingItem = prev.find((item) => item.lineId === lineId);

      if (existingItem) {
        return prev.map((item) => (item.lineId === lineId ? { ...item, quantity: item.quantity + quantity } : item));
      }

      return [
        ...prev,
        {
          lineId,
          product,
          selectedOffer: chosenOffer,
          quantity,
          selectedSize: nextSize,
          selectedColor: nextColor,
          giftWrap: false,
        },
      ];
    });
    navigate('/cart');
  };

  const updateCartQuantity = (lineId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(lineId);
      return;
    }
    setCartItems((prev) => prev.map((item) => (item.lineId === lineId ? { ...item, quantity } : item)));
  };

  const removeFromCart = (lineId: string) => {
    setCartItems((prev) => prev.filter((item) => item.lineId !== lineId));
  };

  const toggleGiftWrap = (lineId: string) => {
    setCartItems((prev) => prev.map((item) => (item.lineId === lineId ? { ...item, giftWrap: !item.giftWrap } : item)));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // Wishlist functions
  const toggleWishlist = async (productId: string) => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to save items to your wishlist.',
      });
      openAuthForIntent(lastBasePathRef.current || '/', 'wishlist');
      return;
    }

    // Use Supabase wishlist for logged in users
    if (wishlistIds.includes(productId)) {
      await removeFromWishlist(productId);
    } else {
      await addToWishlist(productId);
    }
  };

  // Quick view functions
  const openQuickView = (product: Product, initialOfferId?: string, initialShowOtherSellers?: boolean) => {
    setQuickViewProduct(product);
    setQuickViewInitialOfferId(initialOfferId);
    setQuickViewInitialShowOtherSellers(Boolean(initialShowOtherSellers));
    setIsQuickViewOpen(true);
  };

  const closeQuickView = () => {
    setIsQuickViewOpen(false);
    setQuickViewProduct(null);
    setQuickViewInitialOfferId(undefined);
    setQuickViewInitialShowOtherSellers(false);
  };

  // Navigation functions
  const scrollToProducts = () => {
    productsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCategorySelect = (category: string) => {
    // Home category cards route to collections pages
    navigate(`/collections/${category}${location.search || ''}`);
  };

  const handleSearchSubmit = () => {
    // Navigate to /search route with query param
    if (!isSearch) {
      const query = searchQuery.trim();
      if (query) {
        navigate(`/search?q=${encodeURIComponent(query)}`);
      } else {
        navigate('/search');
      }
    } else {
      // Already on /search, just update params and scroll
      setStorefrontParams({ q: searchQuery });
      scrollToProducts();
    }
  };

  const handleAgeSelect = (ageRange: string) => {
    // Route to age-based collections pages.
    const ageToSlug: Record<string, string> = {
      '0-12 months': 'age-newborn-infant',
      '1-2 years': 'age-toddler',
      '3-5 years': 'age-preschooler',
      '6-8 years': 'age-big-kid',
    };

    const slug = ageToSlug[ageRange] || 'all';
    navigate(`/collections/${slug}`);
  };

  // Track last non-modal URL to support close navigation
  const lastBasePathRef = useRef<string>('/');

  useEffect(() => {
    const p = location.pathname;
    const isModalPath = p.startsWith('/cart') || p.startsWith('/auth') || p.startsWith('/account') || p.startsWith('/checkout');
    if (!isModalPath) {
      lastBasePathRef.current = p + location.search;
    }
  }, [location.pathname, location.search]);

  const closeToLastBase = () => {
    // Close should always return to the last non-modal page.
    // Post-auth navigation is handled explicitly on successful sign-in inside AuthModal.
    navigate(lastBasePathRef.current || '/');
  };

  /**
   * Open auth while preserving the exact user intent so post-auth redirects are deterministic.
   * - `next` is the post-auth route.
   * - `intent` is a human label used for UI copy (e.g. "checkout", "wishlist").
   */
  const openAuthForIntent = (next: string, intent: string) => {
    navigate(`/auth?intent=${encodeURIComponent(intent)}&next=${encodeURIComponent(next)}`);
  };

  // Ensure base modal routes resolve to deterministic subroutes.
  useEffect(() => {
    if (location.pathname === '/account') {
      navigate('/account/profile', { replace: true });
    }

    // If the account route is opened while signed out, gate it behind auth.
    // Otherwise the route changes but the modal renders null (feels broken).
    if (location.pathname.startsWith('/account') && !user) {
      navigate(
        `/auth?intent=${encodeURIComponent('account')}&next=${encodeURIComponent(location.pathname + location.search)}`,
        { replace: true }
      );
      return;
    }

    if (location.pathname === '/checkout') {
      // Deterministic default step.
      // NOTE: we allow signed-out users to enter checkout (guest flow) and only require sign-in
      // at payment initiation.
      navigate('/checkout/shipping', { replace: true });
    }
  }, [location.pathname, location.search, navigate, user]);

  // Checkout functions
  const handleCheckout = () => {
    // Allow entering checkout as a guest; sign-in is required only for payment.
    // This keeps the cart -> checkout transition feeling reliable.
    if (!user) {
      toast({
        title: 'You can checkout as a guest',
        description: 'Sign in will be required to complete payment.',
      });
    }
    navigate('/checkout');
  };

  const handleOrderComplete = () => {
    clearCart();
  };

  // Cart count
  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* SEO Meta Tags */}
      <SEO
        title={
          isCollections
            ? COLLECTION_CATEGORY_LABELS[selectedCategory] || 'All Products'
            : isSearch
            ? searchQuery
              ? `Search: ${searchQuery}`
              : 'Search'
            : 'DEKNA - Premium Kids Goods Shop'
        }
        description={
          isCollections
            ? `Browse our collection of ${COLLECTION_CATEGORY_LABELS[selectedCategory]?.toLowerCase() || 'kids products'}. Quality toys, books, clothing, and essentials for children.`
            : isSearch
            ? `Search results for kids products${searchQuery ? `: ${searchQuery}` : ''}`
            : 'Shop premium kids goods, toys, books, clothing, and essentials at DEKNA. Quality products for children of all ages with fast delivery and excellent customer service.'
        }
        keywords={
          isCollections
            ? `${COLLECTION_CATEGORY_LABELS[selectedCategory]}, kids ${selectedCategory}, children products`
            : 'kids goods, children toys, kids books, baby essentials, kids clothing'
        }
        noTitleTemplate={!isCollections && !isSearch}
      />
      
      {/* Structured Data */}
      {isHome && (
        <>
          <OrganizationSchema />
          <WebSiteSchema />
        </>
      )}
      
      {isCollections && (
        <BreadcrumbSchema
          items={[
            { name: 'Home', url: 'https://dekna.com/' },
            ...(selectedCategory !== 'all'
              ? [
                  { name: 'Collections', url: 'https://dekna.com/collections/all' },
                  {
                    name: COLLECTION_CATEGORY_LABELS[selectedCategory] || 'All',
                    url: `https://dekna.com/collections/${selectedCategory}`,
                  },
                ]
              : [{ name: 'All Products', url: 'https://dekna.com/collections/all' }]),
          ]}
        />
      )}
      
      {/* Header */}
      <Header
        cartItemCount={cartItemCount}
        wishlistCount={wishlist.length}
        onCartClick={() => {
          (document.activeElement as HTMLElement | null)?.blur?.();
          if (isCartOpen) {
            closeToLastBase();
            return;
          }
          navigate('/cart');
        }}
        onWishlistClick={() => {
          (document.activeElement as HTMLElement | null)?.blur?.();
          if (!user) {
            openAuthForIntent(lastBasePathRef.current || '/', 'wishlist');
            return;
          }
          if (location.pathname === '/account/wishlist') {
            closeToLastBase();
            return;
          }
          navigate('/account/wishlist');
        }}
        searchQuery={searchQuery}
        showSearchButton={isSearch}
        onSearchSubmit={handleSearchSubmit}
        onSearchChange={(q) => {
          setSearchQuery(q);
        }}
        onCategorySelect={(c) => {
          // Header category navigation always routes to /collections/:category
          const qs = location.search || '';
          navigate(`/collections/${c}${qs}`);
        }}
        onAuthClick={() => {
          (document.activeElement as HTMLElement | null)?.blur?.();
          openAuthForIntent(lastBasePathRef.current || '/', 'sign-in');
        }}
        onAccountClick={() => {
          (document.activeElement as HTMLElement | null)?.blur?.();
          if (!user) {
            openAuthForIntent('/account/profile', 'account');
            return;
          }
          if (location.pathname.startsWith('/account')) {
            closeToLastBase();
            return;
          }
          navigate('/account/profile');
        }}
      />

      {/* Home-only sections */}
      {isHome && (
        <>
          {/* Hero Section */}
          <HeroSection onShopNow={scrollToProducts} />

          <Separator variant="gradient" />

          {/* Category Section */}
          <CategorySection onCategorySelect={handleCategorySelect} />

          <Separator variant="gradient" />

          {/* Promo Banner */}
          <PromoBanner onShopGifts={scrollToProducts} />
        </>
      )}

      {/* Collections breadcrumb subheader */}
      {isCollections && (
        <div className="bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center gap-2 text-base md:text-lg">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 font-medium"
              >
                Home
              </button>

              {isCollectionsAll ? (
                <>
                  <span className="text-gray-300 dark:text-gray-700">/</span>
                  <span className="text-gray-900 dark:text-gray-100 font-semibold">All</span>
                </>
              ) : (
                <>
                  <span className="text-gray-300 dark:text-gray-700">/</span>
                  <button
                    type="button"
                    onClick={() => navigate('/collections/all')}
                    className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 font-medium"
                  >
                    collections
                  </button>
                  <span className="text-gray-300 dark:text-gray-700">/</span>
                  <span className="text-gray-900 dark:text-gray-100 font-semibold">
                    {COLLECTION_CATEGORY_LABELS[selectedCategory] || 'All'}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Search breadcrumb subheader */}
      {isSearch && (
        <div className="bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center gap-2 text-base md:text-lg">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 font-medium"
              >
                Home
              </button>
              <span className="text-gray-300 dark:text-gray-700">/</span>
              <span className="text-gray-900 dark:text-gray-100 font-semibold">Search</span>
            </div>

          </div>
        </div>
      )}

      <Separator variant="gradient" />

      {/* Products Section */}
      <div ref={productsRef}>
        <ProductGrid
          products={isCollections ? pagedProducts : filteredProducts}
          title={
            isHome
              ? 'Collections'
              : isSearch
                ? searchQuery.trim()
                  ? `Results for “${searchQuery.trim()}”`
                  : 'Search'
                : undefined
          }
          subtitle={
            isHome
              ? 'Browse all products across our curated categories'
              : isSearch
                ? searchQuery.trim()
                  ? `${filteredProducts.length} results`
                  : 'Type to search products by name, description, category, or age range.'
                : undefined
          }
          onAddToCart={addToCart}
          onToggleWishlist={toggleWishlist}
          wishlist={wishlist}
          onQuickView={openQuickView}
          onViewOtherSellers={(p) => {
            openQuickView(p, undefined, true);
          }}
          sortBy={sortBy}
          onSortChange={(s) => {
            setSortBy(s);
            setStorefrontParams({ sort: s });
          }}
          showFilters={!isCollections}
          gridClassName={
            isCollections
              ? isCollectionsAll
                ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6'
                : 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6'
              : undefined
          }
        />

        {/* Collections pagination */}
        {isCollections && collectionsTotalItems != null && collectionsPageSize != null && (
          <div className="mt-12 mb-16 flex justify-center px-4">
            {(() => {
              const totalPages = Math.max(1, Math.ceil(collectionsTotalItems / collectionsPageSize));
              const safePage = Math.min(Math.max(1, currentPage), totalPages);

              const buildHref = (page: number) => {
                const sp = new URLSearchParams(location.search);
                if (page === 1) sp.delete('page');
                else sp.set('page', String(page));
                return `${location.pathname}${sp.toString() ? `?${sp.toString()}` : ''}`;
              };

              const goTo = (page: number) => {
                const href = buildHref(page);
                navigate(href);
                productsRef.current?.scrollIntoView({ behavior: 'smooth' });
              };

              // Windowed pagination: always show first/last, show a small window around current.
              const windowSize = 1; // pages on each side of current
              const pages = new Set<number>();
              pages.add(1);
              pages.add(totalPages);
              for (let p = safePage - windowSize; p <= safePage + windowSize; p++) {
                if (p >= 1 && p <= totalPages) pages.add(p);
              }

              const sorted = Array.from(pages).sort((a, b) => a - b);
              const display: Array<number | 'ellipsis'> = [];
              for (let i = 0; i < sorted.length; i++) {
                const p = sorted[i];
                const prev = sorted[i - 1];
                if (i > 0 && prev != null && p - prev > 1) display.push('ellipsis');
                display.push(p);
              }

              const prevDisabled = safePage <= 1;
              const nextDisabled = safePage >= totalPages;

              return (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href={buildHref(Math.max(1, safePage - 1))}
                        aria-disabled={prevDisabled}
                        onClick={(e) => {
                          e.preventDefault();
                          if (prevDisabled) return;
                          goTo(safePage - 1);
                        }}
                      />
                    </PaginationItem>

                    {display.map((it, idx) => {
                      if (it === 'ellipsis') {
                        return (
                          <PaginationItem key={`ellipsis-${idx}`}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        );
                      }

                      const href = buildHref(it);
                      return (
                        <PaginationItem key={it}>
                          <PaginationLink
                            href={href}
                            isActive={it === safePage}
                            onClick={(e) => {
                              e.preventDefault();
                              goTo(it);
                            }}
                          >
                            {it}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}

                    <PaginationItem>
                      <PaginationNext
                        href={buildHref(Math.min(totalPages, safePage + 1))}
                        aria-disabled={nextDisabled}
                        onClick={(e) => {
                          e.preventDefault();
                          if (nextDisabled) return;
                          goTo(safePage + 1);
                        }}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              );
            })()}
          </div>
        )}
      </div>

      <Separator variant="gradient" />

      {/* New Essentials (hidden on /collections/*) */}
      {!isCollections && <FeaturesSection />}

      <Separator variant="gradient" />

      {/* Home-only supporting sections */}
      {isHome && (
        <>
          <AgeGuideSection onAgeSelect={handleAgeSelect} />

          <Separator variant="gradient" />

          <TestimonialsSection />

          <Separator variant="gradient" />
        </>
      )}

      {/* Footer */}
      <Footer />

      {/* Cart Modal */}
      <CartModal
        isOpen={isCartOpen}
        onClose={closeToLastBase}
        cartItems={cartItems}
        onUpdateQuantity={updateCartQuantity}
        onRemoveItem={removeFromCart}
        onToggleGiftWrap={toggleGiftWrap}
        onCheckout={handleCheckout}
        onChangeSeller={(productId, offerId) => {
          // IMPORTANT: resolve from cartItems first (route-independent).
          // On /cart we are NOT on a collections route, so catalogProducts may not include expanded variant IDs.
          const fromCart = cartItems.find((i) => i.product.id === productId)?.product;
          const p =
            fromCart ||
            catalogProducts.find((x) => x.id === productId) ||
            baseProducts.find((x) => x.id === productId);
          if (!p) return;

          // Close the cart route (so it feels like a redirect) and open Quick View on the underlying page.
          openQuickView(p, offerId, true);
          navigate(lastBasePathRef.current || '/');
        }}
      />

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={isQuickViewOpen}
        onClose={closeQuickView}
        onAddToCart={addToCart}
        onToggleWishlist={toggleWishlist}
        isInWishlist={quickViewProduct ? wishlist.includes(quickViewProduct.id) : false}
        initialOfferId={quickViewInitialOfferId}
        initialShowOtherSellers={quickViewInitialShowOtherSellers}
      />

      {/* Auth Modal */}
      {isAuthModalOpen && (
        <AuthModal
          isOpen={true}
          onClose={closeToLastBase}
        />
      )}

      {/* Account Modal */}
      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={closeToLastBase}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={closeToLastBase}
        cartItems={cartItems}
        onOrderComplete={handleOrderComplete}
        onSignInClick={() => {
          openAuthForIntent('/checkout', 'checkout');
        }}
        onChangeSeller={(productId, offerId) => {
          // IMPORTANT: resolve from cartItems first (route-independent).
          // On /checkout we might also be outside collections, so catalogProducts may not include expanded variant IDs.
          const fromCart = cartItems.find((i) => i.product.id === productId)?.product;
          const p =
            fromCart ||
            catalogProducts.find((x) => x.id === productId) ||
            baseProducts.find((x) => x.id === productId);
          if (!p) return;

          openQuickView(p, offerId, true);
          navigate(lastBasePathRef.current || '/');
        }}
      />
    </div>
  );
};

export default AppLayout;
