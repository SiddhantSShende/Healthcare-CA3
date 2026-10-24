/**
 * Currency and number formatting utilities.
 *
 * Default currency is INR for the Indian interface. The formatter is
 * centralised so a future backend phase can make the currency configurable.
 */

export const DEFAULT_CURRENCY = "INR";

export function formatInr(value: number, options?: { compact?: boolean }): string {
  if (!Number.isFinite(value)) return "—";
  if (options?.compact && Math.abs(value) >= 100000) {
    const lakh = value / 100000;
    const formatted = Math.abs(lakh) >= 10 ? lakh.toFixed(1) : lakh.toFixed(2);
    return `₹${formatted}L`;
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: DEFAULT_CURRENCY,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number, maximumFractionDigits = 0): string {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits }).format(value);
}

export function formatPercent(value: number, maximumFractionDigits = 0): string {
  if (!Number.isFinite(value)) return "—";
  return `${value > 0 ? "+" : ""}${(value * 100).toFixed(maximumFractionDigits)}%`;
}

export function formatR2(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return value.toFixed(2);
}

/** Short human date, e.g. "12 Mar 2026". */
export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
