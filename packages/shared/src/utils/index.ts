/**
 * Normalize a dollar amount to monthly frequency
 */
export function toMonthly(amount: number, frequency: string): number {
  switch (frequency.toLowerCase()) {
    case "weekly":
      return (amount * 52) / 12;
    case "fortnightly":
      return (amount * 26) / 12;
    case "monthly":
      return amount;
    case "quarterly":
      return amount / 3;
    case "annually":
    case "yearly":
      return amount / 12;
    default:
      return amount;
  }
}

/**
 * Format a currency amount as AUD
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Calculate percentage
 */
export function percentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100 * 10) / 10;
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Calculate months to pay off a balance given a fixed payment and interest rate
 */
export function monthsToPayoff(
  balance: number,
  monthlyPayment: number,
  annualInterestRate: number
): number {
  if (monthlyPayment <= 0) return Infinity;
  const r = annualInterestRate / 100 / 12;
  if (r === 0) {
    return Math.ceil(balance / monthlyPayment);
  }
  const n = -Math.log(1 - (r * balance) / monthlyPayment) / Math.log(1 + r);
  return Math.ceil(n);
}

/**
 * Add months to a date
 */
export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

/**
 * Generate a simple hash for audit/immutability
 */
export function simpleHash(data: string): string {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, "0");
}
