export type CurrencyCode = "ETB";

/**
 * Format money consistently across the app.
 *
 * Note: Phase 1 is frontend-only. Amounts are treated as ETB numeric values.
 */
export function formatMoney(
  amount: number,
  currency: CurrencyCode = "ETB",
  locale: string = "en-ET"
): string {
  const safeAmount = Number.isFinite(amount) ? amount : 0;

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(safeAmount);
  } catch {
    // Fallback if Intl currency formatting is unavailable.
    return `${currency} ${safeAmount.toFixed(2)}`;
  }
}
