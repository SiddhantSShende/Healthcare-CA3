import { useSyncExternalStore } from "react";

import type { CostEstimate } from "@/types/health";

/**
 * Lightweight session-scoped store for the two pieces of cross-page state:
 *
 * - the provider comparison basket (2–4 providers),
 * - the session history of cost estimates.
 *
 * State persists to sessionStorage so a refresh keeps the user's workflow,
 * while the storage layer stays trivially replaceable with a backend API.
 */

const COMPARE_KEY = "hc.compare";
const ESTIMATES_KEY = "hc.estimates";
export const MAX_COMPARE = 4;

interface AppState {
  compareProviderIds: string[];
  estimates: CostEstimate[];
}

let state: AppState = readInitial();
const listeners = new Set<() => void>();

function readInitial(): AppState {
  if (typeof window === "undefined") {
    return { compareProviderIds: [], estimates: [] };
  }
  let compareProviderIds: string[] = [];
  let estimates: CostEstimate[] = [];
  try {
    const rawCompare = sessionStorage.getItem(COMPARE_KEY);
    if (rawCompare) compareProviderIds = JSON.parse(rawCompare) as string[];
  } catch {
    compareProviderIds = [];
  }
  try {
    const rawEstimates = sessionStorage.getItem(ESTIMATES_KEY);
    if (rawEstimates) estimates = JSON.parse(rawEstimates) as CostEstimate[];
  } catch {
    estimates = [];
  }
  return { compareProviderIds, estimates };
}

function setState(next: Partial<AppState>) {
  state = { ...state, ...next };
  try {
    sessionStorage.setItem(COMPARE_KEY, JSON.stringify(state.compareProviderIds));
    sessionStorage.setItem(ESTIMATES_KEY, JSON.stringify(state.estimates));
  } catch {
    // Storage may be unavailable (private mode); state still works in memory.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function addProviderToCompare(providerId: string): "added" | "exists" | "full" {
  if (state.compareProviderIds.includes(providerId)) return "exists";
  if (state.compareProviderIds.length >= MAX_COMPARE) return "full";
  setState({ compareProviderIds: [...state.compareProviderIds, providerId] });
  return "added";
}

export function removeProviderFromCompare(providerId: string) {
  setState({
    compareProviderIds: state.compareProviderIds.filter((id) => id !== providerId),
  });
}

export function clearCompare() {
  setState({ compareProviderIds: [] });
}

export function addEstimate(estimate: CostEstimate) {
  setState({ estimates: [estimate, ...state.estimates].slice(0, 12) });
}

export function clearEstimates() {
  setState({ estimates: [] });
}

function getSnapshot(): AppState {
  return state;
}

export function useAppStore(): AppState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
