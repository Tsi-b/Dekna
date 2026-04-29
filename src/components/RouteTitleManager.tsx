import { useCallback, useEffect, useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";
import { SPINNER_FRAMES, SPINNER_INTERVAL_MS } from "@/lib/spinner";

// Collection category labels for dynamic titles
const COLLECTION_LABELS: Record<string, string> = {
  all: 'All Products',
  feeding: 'Feeding',
  healthcare: 'Baby Care',
  toys: 'Toys',
  gifts: 'Gifts',
  'age-newborn-infant': 'Newborn & Infant',
  'age-toddler': 'Toddler',
  'age-preschooler': 'Preschooler',
  'age-big-kid': 'Big Kid',
  'travel-systems': 'Travel Systems',
  'bathing-changing': 'Bathing & Changing',
  'healthcare-safety': 'Healthcare & Safety',
  'cribs-beddings': 'Cribs & Beddings',
  'walkers-jumpers-swings': 'Walkers, Jumpers & Swings',
  clothing: 'Clothing',
  gear: 'Gear',
  school: 'School Supplies',
  books: 'Books',
  'home-accessories': 'Home Accessories',
  'school-supplies': 'School Supplies',
};

function getBaseTitle(pathname: string, search: string = ''): string {
  // Homepage
  if (pathname === "/") return "DEKNA - Premium Kids Goods Shop";
  
  // Modal routes
  if (pathname.startsWith("/cart")) return "Cart | DEKNA";
  if (pathname.startsWith("/auth")) return "Sign In | DEKNA";
  if (pathname.startsWith("/account")) {
    if (pathname.includes("/wishlist")) return "Wishlist | DEKNA";
    if (pathname.includes("/orders")) return "Orders | DEKNA";
    if (pathname.includes("/addresses")) return "Addresses | DEKNA";
    if (pathname.includes("/profile")) return "Profile | DEKNA";
    return "Account | DEKNA";
  }
  if (pathname.startsWith("/checkout")) {
    if (pathname.includes("/payment")) return "Payment | DEKNA";
    if (pathname.includes("/review")) return "Review Order | DEKNA";
    if (pathname.includes("/shipping")) return "Shipping | DEKNA";
    return "Checkout | DEKNA";
  }
  
  // Collections routes
  if (pathname.startsWith("/collections/")) {
    const category = pathname.split("/collections/")[1]?.split("/")[0] || 'all';
    const label = COLLECTION_LABELS[category] || category.charAt(0).toUpperCase() + category.slice(1);
    return `${label} | DEKNA`;
  }
  
  // Search route
  if (pathname.startsWith("/search")) {
    const params = new URLSearchParams(search);
    const query = params.get('q');
    return query ? `Search: ${query} | DEKNA` : "Search | DEKNA";
  }
  
  // Dedicated pages
  if (pathname.startsWith("/payment-status")) return "Payment Status | DEKNA";
  if (pathname.startsWith("/mock-telebirr-payment")) return "Payment | DEKNA";
  if (pathname.startsWith("/about-us")) return "About Us | DEKNA";
  if (pathname.startsWith("/refund-policy")) return "Refund Policy | DEKNA";
  if (pathname.startsWith("/terms-of-service")) return "Terms of Service | DEKNA";
  if (pathname.startsWith("/app-download")) return "Download App | DEKNA";
  if (pathname.startsWith("/returns-refunds")) return "Returns & Refunds | DEKNA";
  if (pathname.startsWith("/privacy-policy")) return "Privacy Policy | DEKNA";
  
  // 404 or unknown routes
  if (pathname === "*" || !pathname.startsWith("/")) return "Page Not Found | DEKNA";
  
  return "DEKNA";
}

/**
 * Manages document.title on navigation.
 * - On every route change, shows a brief spinner in the browser tab.
 * - Then settles on a deterministic, route-specific title.
 * - Handles all routes including collections, search, and dedicated pages.
 * - Supports hash links and anchor navigation.
 */
export default function RouteTitleManager() {
  const location = useLocation();
  const timerRef = useRef<number | null>(null);
  const frameRef = useRef<number>(0);
  const pendingTitleRef = useRef<string | null>(null);

  const baseTitle = useMemo(() => getBaseTitle(location.pathname, location.search), [location.pathname, location.search]);
  const navKey = useMemo(() => `${location.pathname}${location.search}${location.hash}`, [location.pathname, location.search, location.hash]);

  const stopSpinner = useCallback((finalTitle: string) => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    pendingTitleRef.current = null;
    document.title = finalTitle;
  }, []);

  const startSpinner = useCallback(
    (title: string) => {
      // Reduce noisy global indicators:
      // - respect prefers-reduced-motion
      // - only show a very brief spinner (avoids constant flicker on instant navigations)
      const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
      if (prefersReducedMotion) {
        document.title = title;
        return;
      }

      // Reset any previous animation
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }

      pendingTitleRef.current = title;
      frameRef.current = 0;
      document.title = `${SPINNER_FRAMES[frameRef.current]} ${title}`;

      // Spin briefly and then settle even if navigation is "instant".
      // stopSpinner() will still run on actual route change.
      timerRef.current = window.setInterval(() => {
        frameRef.current = (frameRef.current + 1) % SPINNER_FRAMES.length;
        document.title = `${SPINNER_FRAMES[frameRef.current]} ${title}`;
      }, SPINNER_INTERVAL_MS);

      window.setTimeout(() => {
        if (pendingTitleRef.current === title) {
          stopSpinner(title);
        }
      }, Math.max(2 * SPINNER_INTERVAL_MS, 250));
    },
    [stopSpinner]
  );

  // Start spinner as early as possible on user interaction.
  // This covers internal <a> clicks (including React Router <Link>) before
  // navigation updates the history state.
  useEffect(() => {
    const onDocumentClickCapture = (e: MouseEvent) => {
      // Only left-click without modifier keys.
      if (e.defaultPrevented) return;
      if (e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const target = e.target as HTMLElement | null;
      if (!target) return;

      const anchor = target.closest('a[href]') as HTMLAnchorElement | null;
      if (!anchor) return;

      // Ignore new-tab / download / external
      if (anchor.target && anchor.target !== '' && anchor.target !== '_self') return;
      if (anchor.hasAttribute('download')) return;

      const href = anchor.getAttribute('href') || '';
      
      // Handle hash-only links (anchor links on same page)
      if (href.startsWith('#')) {
        // For hash links, keep the current title (no navigation, just scroll)
        return;
      }
      
      // Ignore mailto/tel
      if (href.startsWith('mailto:') || href.startsWith('tel:')) return;

      try {
        const u = new URL(href, window.location.origin);
        if (u.origin !== window.location.origin) return;
        startSpinner(getBaseTitle(u.pathname, u.search));
      } catch {
        // ignore
      }
    };

    document.addEventListener('click', onDocumentClickCapture, true);

    return () => {
      document.removeEventListener('click', onDocumentClickCapture, true);
    };
  }, [startSpinner]);

  // Hook into navigation at the browser history level so the spinner starts
  // immediately when navigation is triggered (links, buttons, programmatic nav).
  useEffect(() => {
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    const wrap = (fn: typeof window.history.pushState) => {
      return function (this: History, ...args: Parameters<History["pushState"]>) {
        const url = args[2];
        if (typeof url === "string") {
          try {
            const u = new URL(url, window.location.origin);
            startSpinner(getBaseTitle(u.pathname, u.search));
          } catch {
            // ignore
          }
        }
        return fn.apply(this, args as any);
      };
    };

    window.history.pushState = wrap(originalPushState);
    window.history.replaceState = wrap(originalReplaceState);

    const onPopState = () => {
      // Back/forward navigation
      startSpinner(getBaseTitle(window.location.pathname, window.location.search));
    };

    window.addEventListener("popstate", onPopState);

    return () => {
      window.removeEventListener("popstate", onPopState);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, [startSpinner]);

  // When the route has actually changed (rendered), stop spinning and set final title.
  useEffect(() => {
    // Stop spinner on any navigation completion (including query-string-only changes and hash changes).
    stopSpinner(baseTitle);
  }, [navKey, baseTitle, stopSpinner]);

  return null;
}
