// Helper to format currency in UZS
export function formatUZS(amount?: number): string {
  if (amount === undefined || amount === null || isNaN(amount)) return "0 so'm";
  return new Intl.NumberFormat('uz-UZ').format(Math.round(amount)) + " so'm";
}

// Calculate selling price in UZS based on CNY price, exchange rate, and markup percentage
export function calculateUzsPrice(
  priceCny: number,
  exchangeRate: number = 1820,
  markupPercentage: number = 0.25,
  localDeliveryFeeCny: number = 2
): number {
  const totalCostCny = priceCny + localDeliveryFeeCny;
  const rawUzs = totalCostCny * exchangeRate * (1 + markupPercentage);
  // Round to nearest hundred
  return Math.round(rawUzs / 100) * 100;
}

// Combine CSS class names
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

// Helper to sanitize image URLs (e.g. static proxy vs remote CDN)
export function resolveImageUrl(url?: string): string {
  if (!url) return '/placeholder.webp';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/images/')) {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const cleanBase = apiBase.replace(/\/api\/?$/, '');
    return `${cleanBase}${url}`;
  }
  return url;
}
