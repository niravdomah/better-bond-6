/**
 * Format a number as South African Rand currency.
 * Uses Intl.NumberFormat with en-ZA locale to produce: R 1 234 567,89
 */
export function formatZAR(amount: number): string {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
  }).format(amount);
}
