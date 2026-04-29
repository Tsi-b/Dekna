import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Scrolls the viewport to the top whenever the route pathname changes.
 * This keeps navigation predictable, especially when navigating via footer links.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    window.scrollTo({ top: 0, left: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  }, [pathname]);

  return null;
}
