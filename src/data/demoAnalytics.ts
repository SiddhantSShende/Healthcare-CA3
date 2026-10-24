import { demoCities, demoServices, getServiceById } from "@/data/demoServices";
import type {
  AnalyticsRecord,
  CorrelationCell,
  FeatureImportance,
  ModelMetrics,
  PredictedActualPoint,
  ResidualPoint,
} from "@/types/health";

/**
 * Synthetic analytics records and model-evaluation fixtures.
 *
 * DEMONSTRATION DATA: generated once at module load with a fixed seed, so
 * every render is deterministic and reproducible. These records are NOT the
 * approved academic dataset and must not be presented as such. When the
 * approved dataset is processed in the backend phase, the analytics service
 * will source records from the API instead of these fixtures.
 */

/** Deterministic PRNG (mulberry32) so fixtures never change between renders. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20260424);

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(rand() * items.length)]!;
}

function gaussian(): number {
  const u = Math.max(rand(), 1e-9);
  const v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

const cityIndexes = new Map(demoCities.map((c) => [c.name, c.costIndex]));

const providerTypeIndex: Record<string, number> = {
  hospital: 1.18,
  "specialty-center": 1.06,
  polyclinic: 0.94,
  clinic: 0.88,
  "diagnostic-center": 0.82,
};

function buildRecords(): AnalyticsRecord[] {
  const records: AnalyticsRecord[] = [];
  const start = new Date("2025-11-01T00:00:00Z").getTime();
  const dayMs = 24 * 60 * 60 * 1000;
  for (let i = 0; i < 260; i++) {
    const service = pick(demoServices);
    const city = pick(demoCities);
    const providerType = pick(
      Object.keys(providerTypeIndex) as (keyof typeof providerTypeIndex)[],
    );
    // A mild upward drift across the 12-month window.
    const dayOffset = Math.floor(rand() * 365);
    const drift = 1 + (dayOffset / 365) * 0.06;
    const noise = Math.exp(gaussian() * 0.22);
    const costInr = Math.round(
      service.baseCostInr *
        (cityIndexes.get(city.name) ?? 1) *
        providerTypeIndex[providerType] *
        drift *
        noise,
    );
    const inpatient = service.settings.includes("inpatient") && service.category !== "imaging";
    const qualityScore = Math.round(58 + rand() * 34);
    const patientAge = Math.round(6 + rand() * 74);
    records.push({
      id: `rec-${String(i + 1).padStart(4, "0")}`,
      date: new Date(start + dayOffset * dayMs).toISOString().slice(0, 10),
      serviceId: service.id,
      serviceName: service.name,
      category: service.category,
      city: city.name,
      providerType,
      costInr,
      qualityScore,
      patientAge,
      stayDays: inpatient ? Math.max(1, Math.round(1 + rand() * 6)) : null,
    });
  }
  return records;
}

export const demoAnalyticsRecords: AnalyticsRecord[] = buildRecords();

/**
 * Model evaluation fixtures.
 *
 * These metrics are explicit, static demonstration placeholders. They were
 * NOT produced by training a model and must be replaced by real evaluation
 * output once the approved dataset is processed and the models are trained.
 */
export const demoModelMetrics: ModelMetrics[] = [
  {
    modelId: "baseline-linear",
    name: "Baseline — Multiple Linear Regression",
    kind: "baseline",
    description:
      "Ordinary least squares on core numeric and one-hot encoded features. Serves as the reference point for the proposed model.",
    maeInr: 4820,
    rmseInr: 7340,
    r2: 0.61,
  },
  {
    modelId: "proposed-hybrid-ensemble",
    name: "Proposed — Hybrid Cost Intelligence Ensemble",
    kind: "proposed",
    description:
      "Gradient-boosted trees with healthcare-specific engineered features, compared against the baseline on the same held-out split.",
    maeInr: 3560,
    rmseInr: 5410,
    r2: 0.74,
  },
];

/**
 * Predicted-versus-actual scatter fixture (INR, test split of the
 * demonstration records). Deterministic and clearly labelled as illustrative.
 */
function buildPredictedActual(): PredictedActualPoint[] {
  const points: PredictedActualPoint[] = [];
  const actuals = demoAnalyticsRecords.filter((r) => r.costInr <= 60000).slice(0, 42);
  for (const record of actuals) {
    const logActual = Math.log(record.costInr);
    const baselinePredicted = Math.round(
      Math.exp(logActual + gaussian() * 0.24),
    );
    const proposedPredicted = Math.round(Math.exp(logActual + gaussian() * 0.15));
    points.push({
      actualInr: record.costInr,
      baselinePredictedInr: Math.max(50, baselinePredicted),
      proposedPredictedInr: Math.max(50, proposedPredicted),
    });
  }
  return points;
}

export const demoPredictedActual: PredictedActualPoint[] = buildPredictedActual();

/** Residual spread by actual-cost bucket (INR). */
export const demoResiduals: ResidualPoint[] = [
  { bucket: "< ₹1k", baselineResidualInr: 180, proposedResidualInr: 120 },
  { bucket: "₹1k–5k", baselineResidualInr: 640, proposedResidualInr: 430 },
  { bucket: "₹5k–15k", baselineResidualInr: 1720, proposedResidualInr: 1150 },
  { bucket: "₹15k–50k", baselineResidualInr: 4300, proposedResidualInr: 2860 },
  { bucket: "> ₹50k", baselineResidualInr: 9800, proposedResidualInr: 6400 },
];

export const demoFeatureImportance: FeatureImportance[] = [
  { feature: "Service category", importance: 0.34 },
  { feature: "Specific procedure", importance: 0.22 },
  { feature: "City / region", importance: 0.14 },
  { feature: "Provider type", importance: 0.12 },
  { feature: "Setting (in/outpatient)", importance: 0.08 },
  { feature: "Quality indicator", importance: 0.05 },
  { feature: "Patient age group", importance: 0.03 },
  { feature: "Insurance status", importance: 0.02 },
];

export function getServiceName(serviceId: string): string {
  return getServiceById(serviceId)?.name ?? serviceId;
}
