import {
  demoProviders,
  getProviderById,
  providerPriceFor,
} from "@/data/demoProviders";
import { demoServices, getServiceById } from "@/data/demoServices";
import type { Provider, ProviderType } from "@/types/health";

/**
 * Provider service (frontend demonstration only).
 *
 * All functions are async so they can later be swapped for real API clients
 * (configured via VITE_API_BASE_URL) without touching page components.
 */

export interface ProviderFilters {
  search: string;
  city: string;
  providerType: ProviderType | "all";
  specialty: string;
  /** "available" keeps only providers offering the selected service. */
  serviceId: string | null;
  maxPriceInr: number | null;
  qualityOnly: boolean;
  sortBy: "name" | "price" | "quality";
}

export const defaultProviderFilters: ProviderFilters = {
  search: "",
  city: "all",
  providerType: "all",
  specialty: "all",
  serviceId: null,
  maxPriceInr: null,
  qualityOnly: false,
  sortBy: "name",
};

export interface ProviderWithPrice extends Provider {
  /** Indicative price for the currently selected service, when offered. */
  selectedServicePriceInr: number | null;
  selectedServiceName: string | null;
}

function applyFilters(filters: ProviderFilters): ProviderWithPrice[] {
  const selectedService = filters.serviceId ? getServiceById(filters.serviceId) : null;

  const enriched: ProviderWithPrice[] = demoProviders.map((provider) => {
    const offersService = selectedService
      ? provider.serviceIds.includes(selectedService.id)
      : false;
    return {
      ...provider,
      selectedServicePriceInr:
        selectedService && offersService
          ? providerPriceFor(provider, selectedService.baseCostInr)
          : null,
      selectedServiceName: selectedService?.name ?? null,
    };
  });

  const query = filters.search.trim().toLowerCase();

  return enriched.filter((provider) => {
    if (query && !provider.name.toLowerCase().includes(query)) return false;
    if (filters.city !== "all" && provider.city !== filters.city) return false;
    if (filters.providerType !== "all" && provider.type !== filters.providerType) return false;
    if (filters.specialty !== "all" && !provider.specialties.includes(filters.specialty)) {
      return false;
    }
    if (selectedService && !provider.serviceIds.includes(selectedService.id)) return false;
    if (
      filters.maxPriceInr != null &&
      (provider.selectedServicePriceInr == null ||
        provider.selectedServicePriceInr > filters.maxPriceInr)
    ) {
      return false;
    }
    if (filters.qualityOnly && provider.qualityIndicator == null) return false;
    return true;
  });
}

function sortProviders(
  providers: ProviderWithPrice[],
  sortBy: ProviderFilters["sortBy"],
): ProviderWithPrice[] {
  const sorted = [...providers];
  switch (sortBy) {
    case "price": {
      // Providers without the selected service's price sort last.
      sorted.sort((a, b) => {
        if (a.selectedServicePriceInr == null && b.selectedServicePriceInr == null) {
          return a.name.localeCompare(b.name);
        }
        if (a.selectedServicePriceInr == null) return 1;
        if (b.selectedServicePriceInr == null) return -1;
        return a.selectedServicePriceInr - b.selectedServicePriceInr;
      });
      break;
    }
    case "quality": {
      sorted.sort((a, b) => {
        const aQuality = a.qualityIndicator?.value ?? -1;
        const bQuality = b.qualityIndicator?.value ?? -1;
        if (aQuality === bQuality) return a.name.localeCompare(b.name);
        return bQuality - aQuality;
      });
      break;
    }
    default:
      sorted.sort((a, b) => a.name.localeCompare(b.name));
  }
  return sorted;
}

export async function listProviders(filters: ProviderFilters): Promise<ProviderWithPrice[]> {
  return sortProviders(applyFilters(filters), filters.sortBy);
}

export async function getProvider(id: string): Promise<Provider | undefined> {
  return getProviderById(id);
}

export async function getProvidersByIds(ids: string[]): Promise<Provider[]> {
  return ids
    .map((id) => getProviderById(id))
    .filter((provider): provider is Provider => provider != null);
}

export async function listCities(): Promise<string[]> {
  return [...new Set(demoProviders.map((p) => p.city))].sort();
}

export async function listSpecialties(): Promise<string[]> {
  return [...new Set(demoProviders.flatMap((p) => p.specialties))].sort();
}

export function listServicesForProvider(providerId: string) {
  const provider = getProviderById(providerId);
  if (!provider) return [];
  return provider.serviceIds
    .map((id) => getServiceById(id))
    .filter((service): service is NonNullable<typeof service> => service != null)
    .map((service) => ({
      service,
      priceInr: providerPriceFor(provider, service.baseCostInr),
    }));
}

export function listServicesInCatalogue() {
  return demoServices;
}
