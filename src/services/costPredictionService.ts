import { getServiceById, getCityCostIndex } from "@/data/demoServices";
import type {
  AgeGroup,
  CostBreakdownComponent,
  CostEstimate,
  EstimateFactor,
  EstimateInput,
  InsuranceStatus,
  ProviderType,
} from "@/types/health";

/**
 * Deterministic mock cost-prediction service (frontend demonstration only).
 *
 * The "model" is a transparent multiplicative adjustment of a service's
 * base cost — it is NOT a trained machine-learning model and does not call
 * any backend. Every adjustment is documented below so the estimate can be
 * explained factor-by-factor. Limitations:
 *
 * - Costs are illustrative INR placeholders, not quoted or negotiated prices.
 * - The formula cannot capture procedure complexity, comorbidities, or
 *   individual provider pricing.
 * - Outputs must always be labelled as demonstration estimates.
 */

const ageFactors: Record<AgeGroup, number> = {
  "0-12": 0.95,
  "13-25": 1,
  "26-40": 1,
  "41-60": 1.08,
  "60+": 1.15,
};

const insuranceFactors: Record<InsuranceStatus, number> = {
  insured: 0.95,
  uninsured: 1,
  "not-specified": 1,
};

const providerTypeFactors: Record<ProviderType | "any", number> = {
  hospital: 1.15,
  "specialty-center": 1.05,
  clinic: 0.9,
  "diagnostic-center": 0.85,
  polyclinic: 0.95,
  any: 1,
};

/** Day-care (outpatient) delivery of a surgical package is cheaper. */
const SETTING_DAYCARE_FACTOR = 0.85;

/** Component shares per service category; categories missing here have no breakdown. */
const breakdownProfiles: Partial<
  Record<CostEstimate["category"], Array<[string, number]>>
> = {
  consultation: [
    ["Professional fees", 0.7],
    ["Facility charges", 0.18],
    ["Diagnostic charges", 0.12],
  ],
  diagnostic: [
    ["Professional fees", 0.35],
    ["Facility charges", 0.15],
    ["Diagnostic charges", 0.45],
    ["Consumables", 0.05],
  ],
  laboratory: [
    ["Professional fees", 0.3],
    ["Facility charges", 0.15],
    ["Diagnostic charges", 0.5],
    ["Consumables", 0.05],
  ],
  imaging: [
    ["Professional fees", 0.3],
    ["Facility charges", 0.45],
    ["Diagnostic charges", 0.2],
    ["Consumables", 0.05],
  ],
  surgery: [
    ["Professional fees", 0.3],
    ["Facility charges", 0.34],
    ["Diagnostic charges", 0.1],
    ["Medication", 0.16],
    ["Other charges", 0.1],
  ],
  hospitalization: [
    ["Professional fees", 0.25],
    ["Facility charges", 0.4],
    ["Diagnostic charges", 0.1],
    ["Medication", 0.15],
    ["Other charges", 0.1],
  ],
};

export interface EstimateFactorDetail {
  key: string;
  label: string;
  factor: number;
}

/** Exposed for the methodology page's interactive illustration. */
export function estimateFactorDetails(input: EstimateInput): EstimateFactorDetail[] {
  const service = getServiceById(input.serviceId);
  if (!service) return [];
  const details: EstimateFactorDetail[] = [
    {
      key: "city",
      label: `City — ${input.city}`,
      factor: getCityCostIndex(input.city),
    },
    {
      key: "providerType",
      label: `Provider type — ${input.providerType === "any" ? "average" : input.providerType}`,
      factor: providerTypeFactors[input.providerType],
    },
    {
      key: "setting",
      label: `Setting — ${input.setting}`,
      factor:
        service.category === "surgery" && input.setting === "outpatient"
          ? SETTING_DAYCARE_FACTOR
          : 1,
    },
  ];
  if (input.ageGroup) {
    details.push({
      key: "ageGroup",
      label: `Age group — ${input.ageGroup}`,
      factor: ageFactors[input.ageGroup],
    });
  }
  details.push({
    key: "insuranceStatus",
    label: `Insurance — ${input.insuranceStatus.replace("-", " ")}`,
    factor: insuranceFactors[input.insuranceStatus],
  });
  return details;
}

function roundTo10(value: number): number {
  return Math.round(value / 10) * 10;
}

function buildFactors(details: EstimateFactorDetail[]): EstimateFactor[] {
  const effects = details
    .filter((d) => Math.abs(d.factor - 1) > 0.001)
    .map((d) => ({
      label: d.label,
      effect: d.factor - 1,
      direction:
        d.factor > 1 ? ("increases" as const) : ("decreases" as const),
    }));
  return effects.sort((a, b) => Math.abs(b.effect) - Math.abs(a.effect));
}

function buildBreakdown(
  category: CostEstimate["category"],
  amountInr: number,
): CostBreakdownComponent[] | null {
  const profile = breakdownProfiles[category];
  if (!profile) return null;
  return profile.map(([component, share]) => ({
    component,
    amountInr: roundTo10(amountInr * share),
    share,
  }));
}

/**
 * Compute a deterministic demonstration estimate.
 *
 * estimate = baseCost × city × providerType × setting × age × insurance
 */
export function computeEstimate(input: EstimateInput): CostEstimate | null {
  const service = getServiceById(input.serviceId);
  if (!service) return null;

  const benchmark = roundTo10(service.baseCostInr * getCityCostIndex(input.city));
  const details = estimateFactorDetails(input);
  const combined = details.reduce((acc, d) => acc * d.factor, 1);
  const amount = roundTo10(service.baseCostInr * combined);

  return {
    id: `est-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e4).toString(36)}`,
    createdAt: new Date().toISOString(),
    serviceId: service.id,
    serviceName: service.name,
    category: service.category,
    specialty: service.specialty,
    setting: input.setting,
    ageGroup: input.ageGroup,
    insuranceStatus: input.insuranceStatus,
    city: input.city,
    providerType: input.providerType,
    amountInr: amount,
    lowInr: roundTo10(amount * 0.85),
    highInr: roundTo10(amount * 1.3),
    benchmarkInr: benchmark,
    factors: buildFactors(details),
    breakdown: buildBreakdown(service.category, amount),
  };
}

/** Async wrapper so the future API client can keep the same signature. */
export function estimateCost(input: EstimateInput): Promise<CostEstimate> {
  return new Promise((resolve, reject) => {
    const estimate = computeEstimate(input);
    // Simulate a short analysis step for the loading state.
    setTimeout(() => {
      if (!estimate) {
        reject(new Error("Unknown service. Please pick a service from the list."));
        return;
      }
      resolve(estimate);
    }, 700);
  });
}
