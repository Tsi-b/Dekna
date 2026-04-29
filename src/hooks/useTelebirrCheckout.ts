import { useState } from "react";
import { initiateTelebirrPayment } from "@/lib/backend";

interface UseTelebirrCheckoutOptions {
  orderId: string;
}

interface UseTelebirrCheckoutReturn {
  initiate: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to initiate a Telebirr C2B payment.
 *
 * Calls POST /api/payments/telebirr/initiate/ with the order ID and the
 * current Supabase JWT (via the shared backend request helper), then
 * redirects the browser to the Telebirr H5 checkout page.
 *
 * Completely independent of the Chapa payment flow.
 */
export function useTelebirrCheckout({
  orderId,
}: UseTelebirrCheckoutOptions): UseTelebirrCheckoutReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function initiate(): Promise<void> {
    if (!orderId) {
      setError("Select an order before paying with Telebirr.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { checkout_url } = await initiateTelebirrPayment(orderId);
      // Redirect to the Telebirr H5 checkout page (or mock return URL in dev).
      window.location.href = checkout_url;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return { initiate, loading, error };
}
