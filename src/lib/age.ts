export type AgeRangeMonths = { min: number; max: number };

function toMonths(value: number, unit: 'months' | 'years'): number {
  return unit === 'years' ? value * 12 : value;
}

/**
 * Parse common ageRange strings used in the mock catalog into a [min,max] month range.
 * Supports:
 * - "0-12 months"
 * - "0-4 years"
 * - "12+ months"
 * - "3+ years"
 */
export function parseAgeRangeToMonths(input: string): AgeRangeMonths | null {
  const s = input.trim().toLowerCase();

  // Range: "a-b months/years"
  const rangeMatch = s.match(/^(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*(months?|years?)$/);
  if (rangeMatch) {
    const a = Number(rangeMatch[1]);
    const b = Number(rangeMatch[2]);
    const unit = rangeMatch[3].startsWith('year') ? 'years' : 'months';
    const min = toMonths(a, unit);
    const max = toMonths(b, unit);
    return { min: Math.min(min, max), max: Math.max(min, max) };
  }

  // Plus: "a+ months/years"
  const plusMatch = s.match(/^(\d+(?:\.\d+)?)\s*\+\s*(months?|years?)$/);
  if (plusMatch) {
    const a = Number(plusMatch[1]);
    const unit = plusMatch[2].startsWith('year') ? 'years' : 'months';
    const min = toMonths(a, unit);
    return { min, max: Number.POSITIVE_INFINITY };
  }

  return null;
}

export function rangesOverlap(a: AgeRangeMonths, b: AgeRangeMonths): boolean {
  const aMax = a.max;
  const bMax = b.max;
  return a.min <= bMax && b.min <= aMax;
}
