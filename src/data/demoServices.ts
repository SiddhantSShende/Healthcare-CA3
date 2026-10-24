import type { HealthcareService } from "@/types/health";

/**
 * Synthetic catalogue of healthcare services with indicative base costs
 * (INR) before regional and provider adjustments.
 *
 * DEMONSTRATION DATA: these base costs are illustrative placeholders for the
 * frontend phase. They are NOT derived from the approved academic dataset.
 */
export const demoServices: HealthcareService[] = [
  {
    id: "consultation-general",
    name: "General Physician Consultation",
    category: "consultation",
    specialty: "General Medicine",
    baseCostInr: 700,
    settings: ["outpatient"],
  },
  {
    id: "consultation-cardiology",
    name: "Cardiologist Consultation",
    category: "consultation",
    specialty: "Cardiology",
    baseCostInr: 1200,
    settings: ["outpatient"],
  },
  {
    id: "consultation-dermatology",
    name: "Dermatologist Consultation",
    category: "consultation",
    specialty: "Dermatology",
    baseCostInr: 1000,
    settings: ["outpatient"],
  },
  {
    id: "consultation-orthopedics",
    name: "Orthopedic Consultation",
    category: "consultation",
    specialty: "Orthopedics",
    baseCostInr: 1100,
    settings: ["outpatient"],
  },
  {
    id: "diagnostic-ecg",
    name: "Electrocardiogram (ECG)",
    category: "diagnostic",
    specialty: "Cardiology",
    baseCostInr: 350,
    settings: ["outpatient"],
  },
  {
    id: "diagnostic-tmt",
    name: "Treadmill Stress Test (TMT)",
    category: "diagnostic",
    specialty: "Cardiology",
    baseCostInr: 2200,
    settings: ["outpatient"],
  },
  {
    id: "imaging-chest-xray",
    name: "Chest X-Ray",
    category: "imaging",
    specialty: "Radiology",
    baseCostInr: 500,
    settings: ["outpatient"],
  },
  {
    id: "imaging-usg-abdomen",
    name: "Ultrasound Abdomen",
    category: "imaging",
    specialty: "Radiology",
    baseCostInr: 1300,
    settings: ["outpatient"],
  },
  {
    id: "imaging-ct-abdomen",
    name: "CT Scan — Abdomen (with contrast)",
    category: "imaging",
    specialty: "Radiology",
    baseCostInr: 4500,
    settings: ["outpatient", "inpatient"],
  },
  {
    id: "imaging-mri-brain",
    name: "MRI Brain (with contrast)",
    category: "imaging",
    specialty: "Radiology",
    baseCostInr: 7000,
    settings: ["outpatient", "inpatient"],
  },
  {
    id: "laboratory-cbc",
    name: "Complete Blood Count (CBC)",
    category: "laboratory",
    specialty: "Pathology",
    baseCostInr: 400,
    settings: ["outpatient"],
  },
  {
    id: "laboratory-lipid",
    name: "Lipid Profile",
    category: "laboratory",
    specialty: "Pathology",
    baseCostInr: 650,
    settings: ["outpatient"],
  },
  {
    id: "laboratory-hba1c",
    name: "HbA1c (Glycated Haemoglobin)",
    category: "laboratory",
    specialty: "Pathology",
    baseCostInr: 550,
    settings: ["outpatient"],
  },
  {
    id: "surgery-appendectomy",
    name: "Appendectomy (Appendix Removal)",
    category: "surgery",
    specialty: "General Surgery",
    baseCostInr: 55000,
    settings: ["inpatient"],
    unit: "per episode",
  },
  {
    id: "surgery-cataract",
    name: "Cataract Surgery (per eye)",
    category: "surgery",
    specialty: "Ophthalmology",
    baseCostInr: 32000,
    settings: ["outpatient", "inpatient"],
    unit: "per eye",
  },
  {
    id: "surgery-knee-replacement",
    name: "Total Knee Replacement (unilateral)",
    category: "surgery",
    specialty: "Orthopedics",
    baseCostInr: 185000,
    settings: ["inpatient"],
    unit: "per episode",
  },
  {
    id: "hospitalization-general-ward",
    name: "General Ward Stay",
    category: "hospitalization",
    specialty: "Multi-speciality",
    baseCostInr: 6500,
    settings: ["inpatient"],
    unit: "per day",
  },
  {
    id: "hospitalization-icu",
    name: "ICU Stay",
    category: "hospitalization",
    specialty: "Critical Care",
    baseCostInr: 18000,
    settings: ["inpatient"],
    unit: "per day",
  },
  {
    id: "other-physiotherapy",
    name: "Physiotherapy Session",
    category: "other",
    specialty: "Physiotherapy",
    baseCostInr: 900,
    settings: ["outpatient"],
    unit: "per session",
  },
  {
    id: "other-health-checkup",
    name: "Executive Health Check-up Package",
    category: "other",
    specialty: "Preventive Health",
    baseCostInr: 5500,
    settings: ["outpatient"],
  },
];

export const serviceCategories = [
  { value: "consultation", label: "Consultation" },
  { value: "diagnostic", label: "Diagnostic test" },
  { value: "imaging", label: "Imaging" },
  { value: "laboratory", label: "Laboratory test" },
  { value: "surgery", label: "Surgery" },
  { value: "hospitalization", label: "Hospitalization" },
  { value: "other", label: "Other" },
] as const;

export function getServiceById(id: string): HealthcareService | undefined {
  return demoServices.find((service) => service.id === id);
}

export const demoCities = [
  { name: "Mumbai", costIndex: 1.18 },
  { name: "Delhi NCR", costIndex: 1.12 },
  { name: "Bengaluru", costIndex: 1.1 },
  { name: "Hyderabad", costIndex: 0.98 },
  { name: "Chennai", costIndex: 0.96 },
  { name: "Pune", costIndex: 0.93 },
  { name: "Kolkata", costIndex: 0.89 },
  { name: "Ahmedabad", costIndex: 0.86 },
] as const;

export function getCityCostIndex(city: string): number {
  return demoCities.find((c) => c.name === city)?.costIndex ?? 1;
}

export const providerTypeLabels: Record<string, string> = {
  hospital: "Hospital",
  "specialty-center": "Specialty centre",
  clinic: "Clinic",
  "diagnostic-center": "Diagnostic centre",
  polyclinic: "Polyclinic",
  any: "Any provider type",
};
