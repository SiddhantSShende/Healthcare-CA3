/**
 * Core domain types for HealthCompare.
 *
 * These interfaces describe the shape of both the synthetic demonstration
 * data used in this frontend-only phase and the future backend payloads.
 */

export type ServiceCategory =
  | "consultation"
  | "diagnostic"
  | "imaging"
  | "laboratory"
  | "surgery"
  | "hospitalization"
  | "other";

export type ProviderType =
  | "hospital"
  | "specialty-center"
  | "clinic"
  | "diagnostic-center"
  | "polyclinic";

export type Setting = "outpatient" | "inpatient";

export type InsuranceStatus = "insured" | "uninsured" | "not-specified";

export type AgeGroup = "0-12" | "13-25" | "26-40" | "41-60" | "60+";

export type PriceTransparency = "full" | "partial" | "none";

export interface HealthcareService {
  id: string;
  name: string;
  category: ServiceCategory;
  specialty: string;
  /** Typical base cost in INR before regional / provider adjustments. */
  baseCostInr: number;
  /** Settings in which this service is delivered. */
  settings: Setting[];
  /** Human-readable unit, e.g. "per day" for hospitalization. */
  unit?: string;
}

export interface QualityIndicator {
  /** Illustrative composite score on a 0–100 scale. */
  value: number;
  scale: string;
  asOf: string;
}

export interface Provider {
  id: string;
  name: string;
  type: ProviderType;
  city: string;
  region: string;
  specialties: string[];
  serviceIds: string[];
  /** Absolute price index applied to service base costs. */
  priceIndex: number;
  qualityIndicator: QualityIndicator | null;
  priceTransparency: PriceTransparency;
  lastUpdated: string;
}

export interface EstimateFactor {
  label: string;
  /** Signed relative effect on the base cost, e.g. 0.18 = +18%. */
  effect: number;
  direction: "increases" | "decreases" | "neutral";
}

export interface CostBreakdownComponent {
  component: string;
  amountInr: number;
  share: number;
}

export interface CostEstimate {
  id: string;
  createdAt: string;
  serviceId: string;
  serviceName: string;
  category: ServiceCategory;
  specialty: string;
  setting: Setting;
  ageGroup: AgeGroup | null;
  insuranceStatus: InsuranceStatus;
  city: string;
  providerType: ProviderType | "any";
  /** Central demonstration estimate in INR. */
  amountInr: number;
  lowInr: number;
  highInr: number;
  /** Illustrative regional benchmark (same service, city average) in INR. */
  benchmarkInr: number;
  factors: EstimateFactor[];
  breakdown: CostBreakdownComponent[] | null;
}

export interface EstimateInput {
  serviceId: string;
  setting: Setting;
  ageGroup: AgeGroup | null;
  insuranceStatus: InsuranceStatus;
  city: string;
  providerType: ProviderType | "any";
}

export interface ModelMetrics {
  modelId: string;
  name: string;
  kind: "baseline" | "proposed";
  description: string;
  maeInr: number;
  rmseInr: number;
  r2: number;
}

export interface PredictedActualPoint {
  actualInr: number;
  baselinePredictedInr: number;
  proposedPredictedInr: number;
}

export interface ResidualPoint {
  bucket: string;
  baselineResidualInr: number;
  proposedResidualInr: number;
}

export interface FeatureImportance {
  feature: string;
  importance: number;
}

/** A synthetic analytics record (explicitly demonstration data). */
export interface AnalyticsRecord {
  id: string;
  date: string;
  serviceId: string;
  serviceName: string;
  category: ServiceCategory;
  city: string;
  providerType: ProviderType;
  costInr: number;
  qualityScore: number;
  patientAge: number;
  stayDays: number | null;
}

export interface CorrelationCell {
  variableA: string;
  variableB: string;
  coefficient: number;
}

export interface OutlierSummary {
  serviceName: string;
  count: number;
  medianInr: number;
  upperFenceInr: number;
  maxInr: number;
}
