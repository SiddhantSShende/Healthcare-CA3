import { demoAnalyticsRecords } from "@/data/demoAnalytics";
import type {
  AnalyticsRecord,
  CorrelationCell,
  OutlierSummary,
  ServiceCategory,
} from "@/types/health";

/**
 * Analytics service (frontend demonstration only).
 *
 * Computes descriptive and diagnostic aggregates from the synthetic
 * demonstration records. Async signatures keep the future backend swap
 * painless: the same functions will later call the API configured through
 * VITE_API_BASE_URL.
 */

export interface AnalyticsFilters {
  category: ServiceCategory | "all";
  city: string;
  /** ISO date (yyyy-mm-dd) bounds. */
  from: string;
  to: string;
}

export function getAnalyticsBounds(): { min: string; max: string } {
  const dates = demoAnalyticsRecords.map((r) => r.date).sort();
  return { min: dates[0]!, max: dates[dates.length - 1]! };
}

export function listAnalyticsCities(): string[] {
  return [...new Set(demoAnalyticsRecords.map((r) => r.city))].sort();
}

export async function getRecords(filters: AnalyticsFilters): Promise<AnalyticsRecord[]> {
  return demoAnalyticsRecords.filter((record) => {
    if (filters.category !== "all" && record.category !== filters.category) return false;
    if (filters.city !== "all" && record.city !== filters.city) return false;
    if (filters.from && record.date < filters.from) return false;
    if (filters.to && record.date > filters.to) return false;
    return true;
  });
}

export interface DescriptiveStats {
  count: number;
  averageInr: number;
  medianInr: number;
  minInr: number;
  maxInr: number;
}

export function describeCosts(records: AnalyticsRecord[]): DescriptiveStats {
  if (records.length === 0) {
    return { count: 0, averageInr: 0, medianInr: 0, minInr: 0, maxInr: 0 };
  }
  const costs = records.map((r) => r.costInr).sort((a, b) => a - b);
  const sum = costs.reduce((acc, c) => acc + c, 0);
  const mid = Math.floor(costs.length / 2);
  const median =
    costs.length % 2 === 0 ? (costs[mid - 1]! + costs[mid]!) / 2 : costs[mid]!;
  return {
    count: records.length,
    averageInr: Math.round(sum / costs.length),
    medianInr: Math.round(median),
    minInr: costs[0]!,
    maxInr: costs[costs.length - 1]!,
  };
}

export interface DistributionBin {
  label: string;
  count: number;
}

export function costDistribution(records: AnalyticsRecord[], binCount = 10): DistributionBin[] {
  if (records.length === 0) return [];
  const max = Math.max(...records.map((r) => r.costInr));
  const step = Math.max(1, Math.ceil(max / binCount));
  const bins: DistributionBin[] = [];
  for (let i = 0; i < binCount; i++) {
    const lower = i * step;
    const upper = (i + 1) * step;
    bins.push({
      label: formatBinLabel(lower, upper),
      count: records.filter((r) => r.costInr >= lower && r.costInr < upper).length,
    });
  }
  return bins;
}

function formatBinLabel(lower: number, upper: number): string {
  const fmt = (n: number) =>
    n >= 100000 ? `₹${(n / 100000).toFixed(n >= 1000000 ? 0 : 1)}L` : `₹${n >= 1000 ? `${(n / 1000).toFixed(0)}k` : n}`;
  return `${fmt(lower)}–${fmt(upper)}`;
}

export interface GroupAverage {
  group: string;
  averageInr: number;
  medianInr: number;
  count: number;
}

export function averageCostBy(
  records: AnalyticsRecord[],
  key: (record: AnalyticsRecord) => string,
): GroupAverage[] {
  const groups = new Map<string, number[]>();
  for (const record of records) {
    const group = key(record);
    const list = groups.get(group) ?? [];
    list.push(record.costInr);
    groups.set(group, list);
  }
  return [...groups.entries()]
    .map(([group, costs]) => {
      const sorted = [...costs].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      const median =
        sorted.length % 2 === 0 ? (sorted[mid - 1]! + sorted[mid]!) / 2 : sorted[mid]!;
      return {
        group,
        averageInr: Math.round(costs.reduce((acc, c) => acc + c, 0) / costs.length),
        medianInr: Math.round(median),
        count: costs.length,
      };
    })
    .sort((a, b) => b.averageInr - a.averageInr);
}

export interface MonthlyTrendPoint {
  month: string;
  services: number;
  averageCostInr: number;
}

export function monthlyUtilization(records: AnalyticsRecord[]): MonthlyTrendPoint[] {
  const months = new Map<string, { count: number; total: number }>();
  for (const record of records) {
    const month = record.date.slice(0, 7);
    const entry = months.get(month) ?? { count: 0, total: 0 };
    entry.count += 1;
    entry.total += record.costInr;
    months.set(month, entry);
  }
  return [...months.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, { count, total }]) => ({
      month,
      services: count,
      averageCostInr: Math.round(total / count),
    }));
}

/** Pearson correlation between two numeric series. */
export function pearson(xs: number[], ys: number[]): number {
  const n = Math.min(xs.length, ys.length);
  if (n < 3) return 0;
  const meanX = xs.slice(0, n).reduce((a, b) => a + b, 0) / n;
  const meanY = ys.slice(0, n).reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let dx = 0;
  let dy = 0;
  for (let i = 0; i < n; i++) {
    const a = xs[i]! - meanX;
    const b = ys[i]! - meanY;
    num += a * b;
    dx += a * a;
    dy += b * b;
  }
  if (dx === 0 || dy === 0) return 0;
  return num / Math.sqrt(dx * dy);
}

const correlationVariables = ["Cost", "Quality score", "Patient age", "Stay days"] as const;

export function correlationMatrix(
  records: AnalyticsRecord[],
): { variables: string[]; cells: CorrelationCell[] } {
  const withStay = records.filter((r) => r.stayDays != null);
  const series: Record<string, number[]> = {
    Cost: records.map((r) => r.costInr),
    "Quality score": records.map((r) => r.qualityScore),
    "Patient age": records.map((r) => r.patientAge),
    // Stay days compared on the inpatient subset; mirrored to keep a square grid.
    "Stay days": withStay.map((r) => r.stayDays ?? 0),
    // Keep a same-length cost series for the inpatient subset.
    _costStay: withStay.map((r) => r.costInr),
    _ageStay: withStay.map((r) => r.patientAge),
    _qualityStay: withStay.map((r) => r.qualityScore),
  };
  const cells: CorrelationCell[] = [];
  for (const a of correlationVariables) {
    for (const b of correlationVariables) {
      if (a === "Stay days" && b !== "Stay days") {
        const other =
          b === "Cost" ? series._costStay : b === "Patient age" ? series._ageStay : series._qualityStay;
        cells.push({ variableA: a, variableB: b, coefficient: round2(pearson(series[a], other)) });
      } else if (a !== "Stay days" && b === "Stay days") {
        const other =
          a === "Cost" ? series._costStay : a === "Patient age" ? series._ageStay : series._qualityStay;
        cells.push({ variableA: a, variableB: b, coefficient: round2(pearson(other, series[b])) });
      } else {
        cells.push({
          variableA: a,
          variableB: b,
          coefficient: round2(pearson(series[a], series[b])),
        });
      }
    }
  }
  return { variables: [...correlationVariables], cells };
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function outlierAnalysis(records: AnalyticsRecord[]): OutlierSummary[] {
  const byService = new Map<string, number[]>();
  for (const record of records) {
    const list = byService.get(record.serviceName) ?? [];
    list.push(record.costInr);
    byService.set(record.serviceName, list);
  }
  const summaries: OutlierSummary[] = [];
  for (const [serviceName, costs] of byService) {
    const sorted = [...costs].sort((a, b) => a - b);
    const q1 = quantile(sorted, 0.25);
    const q3 = quantile(sorted, 0.75);
    const iqr = q3 - q1;
    const upperFence = q3 + 1.5 * iqr;
    const outliers = sorted.filter((c) => c > upperFence);
    if (outliers.length > 0) {
      summaries.push({
        serviceName,
        count: outliers.length,
        medianInr: Math.round(quantile(sorted, 0.5)),
        upperFenceInr: Math.round(upperFence),
        maxInr: sorted[sorted.length - 1]!,
      });
    }
  }
  return summaries.sort((a, b) => b.count - a.count);
}

function quantile(sorted: number[], q: number): number {
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  return sorted[base]! + (sorted[base + 1] != null ? rest * (sorted[base + 1]! - sorted[base]!) : 0);
}

/** Factor association: how each group's average cost differs from the overall average. */
export function costDrivers(records: AnalyticsRecord[]) {
  const overall = describeCosts(records).averageInr;
  const rows: Array<{ label: string; group: string; averageInr: number; diffPercent: number }> = [];
  const addGroup = (label: string, key: (r: AnalyticsRecord) => string) => {
    for (const g of averageCostBy(records, key)) {
      rows.push({
        label,
        group: g.group,
        averageInr: g.averageInr,
        diffPercent: overall === 0 ? 0 : (g.averageInr - overall) / overall,
      });
    }
  };
  addGroup("Service category", (r) => r.category);
  addGroup("City", (r) => r.city);
  addGroup("Provider type", (r) => r.providerType);
  return rows.sort((a, b) => Math.abs(b.diffPercent) - Math.abs(a.diffPercent)).slice(0, 8);
}
