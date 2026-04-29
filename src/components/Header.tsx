import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingCart, Heart, Menu, X, Phone, LogIn, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/hooks/use-auth';

interface HeaderProps {
  cartItemCount: number;
  wishlistCount: number;
  onCartClick: () => void;
  onWishlistClick: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  /** Optional: show a search button next to the desktop search input (useful on /search). */
  showSearchButton?: boolean;
  /** Optional: called when the header search button is clicked or Enter is pressed. */
  onSearchSubmit?: () => void;
  onCategorySelect: (category: string) => void;
  onAuthClick: () => void;
  onAccountClick: () => void;
}

const Header: React.FC<HeaderProps> = ({
  cartItemCount,
  wishlistCount,
  onCartClick,
  onWishlistClick,
  searchQuery,
  onSearchChange,
  showSearchButton = false,
  onSearchSubmit,
  onCategorySelect,
  onAuthClick,
  onAccountClick
}) => {
  const { user, profile } = useAuth();
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [showHamburger, setShowHamburger] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)');
    const onMedia = () => setIsDesktop(media.matches);
    onMedia();
    media.addEventListener('change', onMedia);

    return () => {
      media.removeEventListener('change', onMedia);
    };
  }, []);

  // Scroll-based hamburger/menubar toggle
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // At the top of the page (threshold: 10px)
      if (currentScrollY <= 10) {
        setShowHamburger(false);
        setIsMenuOpen(false); // Reset menu state at top
      } 
      // Scrolling down from top
      else if (currentScrollY > lastScrollY && currentScrollY > 10) {
        setShowHamburger(true);
        // Don't force close menu - let user control it via toggle
      }
      // Scrolling up (but not at top)
      else if (currentScrollY < lastScrollY && currentScrollY > 10) {
        setShowHamburger(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    // Throttle scroll events using requestAnimationFrame for 60fps performance
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, [lastScrollY]);

  const categories = [
    { id: 'all', name: 'All Products' },
    { id: 'clothing', name: 'Kids Clothing' },
    { id: 'toys', name: 'Educational Toys' },
    { id: 'gear', name: 'Baby Gear' },
    { id: 'school', name: 'School' },
    { id: 'books', name: 'Books' },
    { id: 'home-accessories', name: 'Home Accessories' },
  ];

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-gray-950 shadow-sm border-b border-gray-100 dark:border-gray-900">
      {/* Top Bar */}
      <div className="bg-indigo-600 text-white py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline">Free shipping on orders $75+</span>
            <span className="sm:hidden">Free shipping $75+</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/payment-status" className="hover:underline hidden sm:inline">Track Order</Link>
            <a href="#" className="flex items-center gap-1 hover:underline">
              <Phone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">1-800-KIDS-SHOP</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Left Section: Hamburger + Logo */}
          <div className="flex items-center gap-3">
            {/* Hamburger Icon - Shows when scrolled, hidden at top */}
            <button
              type="button"
              onClick={toggleMenu}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleMenu();
                }
              }}
              className={`p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                showHamburger 
                  ? 'opacity-100 scale-100 pointer-events-auto' 
                  : 'opacity-0 scale-75 pointer-events-none'
              }`}
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
              aria-controls="navigation-menu"
              aria-hidden={!showHamburger}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-gray-700 dark:text-gray-200" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700 dark:text-gray-200" />
              )}
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2" aria-label="Home">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xl sm:text-2xl">7</span>
              </div>
              <div className="hidden sm:block">
                <span className="font-bold text-xl sm:text-2xl text-gray-900 dark:text-white">DEKNA</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 block -mt-1">KidsGoods Shop</span>
              </div>
            </Link>
          </div>

          {/* Search Bar */}
          <div className={`hidden md:flex flex-1 max-w-xl mx-4 lg:mx-8 relative ${searchFocused ? 'ring-2 ring-indigo-500 rounded-xl' : ''}`}>
            <input
              type="text"
              placeholder="Search for products, brands, or categories..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onSearchSubmit?.();
                }
              }}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className={`w-full pl-12 ${showSearchButton ? 'pr-32' : searchQuery ? 'pr-14' : 'pr-4'} py-3 bg-gray-100 dark:bg-gray-900 rounded-xl border-0 focus:outline-none focus:bg-white dark:focus:bg-gray-900 transition-colors text-gray-900 dark:text-gray-100 placeholder:text-gray-400`}
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            {searchQuery && !showSearchButton && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => onSearchChange("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 inline-flex items-center justify-center rounded-lg hover:bg-gray-200/70 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            {showSearchButton && (
              <button
                type="button"
                onClick={() => onSearchSubmit?.()}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors"
              >
                Search
              </button>
            )}
          </div>

          {/* Right Section: Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Account / Sign In */}
            {user ? (
              <button 
                type="button"
                onClick={onAccountClick}
                className="hidden sm:flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-colors cursor-pointer select-none"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {profile?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden lg:inline max-w-[100px] truncate">
                  {profile?.full_name?.split(' ')[0] || 'Account'}
                </span>
              </button>
            ) : (
              <button 
                type="button"
                onClick={onAuthClick}
                className="hidden sm:flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-colors cursor-pointer select-none"
              >
                <LogIn className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden lg:inline">Sign In</span>
              </button>
            )}

            {/* Wishlist */}
            <button 
              type="button"
              onClick={onWishlistClick}
              className="relative p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background cursor-pointer select-none"
              aria-label={`Wishlist (${wishlistCount} items)`}
            >
              <Heart className="w-5 h-5 text-gray-700 dark:text-gray-200" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Dark mode toggle (signed-in only) */}
            {user && (
              <button
                type="button"
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-gray-100 dark:hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                aria-pressed={isDark}
                title={isDark ? 'Light mode' : 'Dark mode'}
              >
                {isDark ? (
                  <Sun className="h-5 w-5 text-gray-700 dark:text-gray-200" />
                ) : (
                  <Moon className="h-5 w-5 text-gray-700 dark:text-gray-200" />
                )}
              </button>
            )}

            {/* Cart */}
            <button
              type="button"
              onClick={onCartClick}
              className="relative flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 sm:px-4 py-2.5 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background cursor-pointer select-none"
              aria-label={`Cart (${cartItemCount} items)`}
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="hidden sm:inline font-medium">Cart</span>
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-amber-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden mt-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onSearchSubmit?.();
                }
              }}
              className={`w-full pl-10 ${searchQuery ? 'pr-12' : 'pr-4'} py-2.5 bg-gray-100 dark:bg-gray-900 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-gray-100 placeholder:text-gray-400`}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            {searchQuery && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => onSearchChange("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 inline-flex items-center justify-center rounded-lg hover:bg-gray-200/70 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Navigation - Visible at top, hidden when scrolled */}
      <nav
        id="navigation-menu"
        className={`hidden lg:block border-t border-gray-100 dark:border-gray-900 bg-white dark:bg-gray-950 transition-all duration-300 ease-in-out ${
          !showHamburger
            ? 'max-h-20 opacity-100'
            : isMenuOpen
            ? 'max-h-20 opacity-100'
            : 'max-h-0 opacity-0 overflow-hidden pointer-events-none border-transparent'
        }`}
        aria-hidden={showHamburger && !isMenuOpen}
      >
        <div className="max-w-7xl mx-auto px-4 flex justify-center">
          <ul className="flex items-center justify-center flex-wrap">
            {categories.map((category, index) => (
              <React.Fragment key={category.id}>
                {index > 0 && (
                  <li aria-hidden="true" className="px-4">
                    <span className="text-gray-300 dark:text-gray-700 select-none">|</span>
                  </li>
                )}
                <li>
                  <button
                    onClick={() => {
                      onCategorySelect(category.id);
                      if (isDesktop) {
                        setIsMenuOpen(false);
                      }
                    }}
                    className="py-3 md:py-4 text-gray-700 dark:text-gray-200 hover:text-indigo-600 font-bold transition-colors relative group"
                  >
                    {category.name}
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 scale-x-0 group-hover:scale-x-100 transition-transform" />
                  </button>
                </li>
              </React.Fragment>
            ))}
          </ul>
        </div>
      </nav>

      {/* Mobile Menu - Controlled by hamburger when visible */}
      <div
        id="mobile-navigation-menu"
        className={`lg:hidden border-t border-gray-100 dark:border-gray-900 bg-white dark:bg-gray-950 transition-all duration-300 ease-in-out ${
          isMenuOpen && showHamburger
            ? 'max-h-[600px] opacity-100'
            : 'max-h-0 opacity-0 overflow-hidden pointer-events-none border-transparent'
        }`}
        aria-hidden={!isMenuOpen || !showHamburger}
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <ul className="space-y-2">
            {categories.map((category) => (
              <li key={category.id}>
                <button
                  onClick={() => {
                    onCategorySelect(category.id);
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left py-3 px-4 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl font-bold transition-colors relative group"
                >
                  {category.name}
                  <span className="absolute bottom-2 left-4 right-4 h-0.5 bg-indigo-600 scale-x-0 group-hover:scale-x-100 transition-transform" />
                </button>
              </li>
            ))}
            <li className="pt-2 border-t border-gray-100 dark:border-gray-800">
              {user ? (
                <button 
                  onClick={() => {
                    onAccountClick();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left py-3 px-4 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl font-medium transition-colors flex items-center gap-2"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {profile?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                  </div>
                  My Account
                </button>
              ) : (
                <button 
                  onClick={() => {
                    onAuthClick();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left py-3 px-4 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl font-medium transition-colors flex items-center gap-2"
                >
                  <LogIn className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                  Sign In / Sign Up
                </button>
              )}
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
};

export default Header;
