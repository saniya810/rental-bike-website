/**
 * Utility functions for Indian Rupee (INR / ₹) currency formatting
 */

export const INR_SYMBOL = '₹';

/**
 * Format an amount in Indian Rupees (INR / ₹)
 * Uses standard Indian numbering system (lakhs/crores format, e.g., ₹1,200 or ₹12,000)
 */
export function formatINR(
  amount: number | null | undefined,
  options?: {
    showDecimals?: boolean;
    compact?: boolean;
  }
): string {
  const numericValue = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  
  // If explicitly requested decimals or value has non-zero decimals
  const hasDecimals = options?.showDecimals ?? (numericValue % 1 !== 0);

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: hasDecimals ? 2 : 0,
  }).format(numericValue);
}

/**
 * Format numeric value in Indian number grouping without the currency symbol
 * e.g. 1200 -> "1,200"
 */
export function formatINRNumber(
  amount: number | null | undefined,
  showDecimals = false
): string {
  const numericValue = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(numericValue);
}
