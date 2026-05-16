import type { Holding, PricePoint, BenchmarkPoint, Constraints } from './types';

const BASE_URL = 'https://antarctica-hiring-data.s3.eu-west-1.amazonaws.com/portfolio-optimisation/2026-04';
const BENCHMARK_URL = 'https://antarctica-hiring-data.s3.eu-west-1.amazonaws.com/portfolio-optimisation/2026-04/benchmark.json';

async function safeFetch<T>(url: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`[data] Failed to fetch ${url}: ${res.status} ${res.statusText}`);
      return fallback;
    }
    return res.json();
  } catch (err) {
    console.warn(`[data] Network error fetching ${url}:`, err);
    return fallback;
  }
}

function isValidHolding(item: unknown): item is Holding {
  if (typeof item !== 'object' || item === null) return false;
  const h = item as Record<string, unknown>;
  return (
    typeof h.isin === 'string' && h.isin.length > 0 &&
    typeof h.name === 'string' && h.name.length > 0 &&
    typeof h.asset_class === 'string' && h.asset_class.length > 0 &&
    typeof h.currency === 'string' && h.currency.length > 0 &&
    typeof h.weight === 'number' && !isNaN(h.weight) && h.weight >= 0 && h.weight <= 1
  );
}

function isValidPricePoint(item: unknown): item is { date: string; isin: string; price: number | string } {
  if (typeof item !== 'object' || item === null) return false;
  const p = item as Record<string, unknown>;
  return (
    typeof p.date === 'string' && p.date.length > 0 &&
    typeof p.isin === 'string' && p.isin.length > 0 &&
    (typeof p.price === 'number' || typeof p.price === 'string')
  );
}

function isValidBenchmarkPoint(item: unknown): item is BenchmarkPoint {
  if (typeof item !== 'object' || item === null) return false;
  const b = item as Record<string, unknown>;
  return (
    typeof b.date === 'string' && b.date.length > 0 &&
    typeof b.level === 'number' && !isNaN(b.level) && b.level > 0
  );
}

export async function fetchHoldings(): Promise<Holding[]> {
  const fallback: Holding[] = [];
  const data = await safeFetch<unknown[]>(`${BASE_URL}/holdings.json`, fallback);
  if (!Array.isArray(data)) {
    console.warn('[data] Holdings data is not an array, returning empty');
    return fallback;
  }
  const valid = data.filter(isValidHolding);
  if (valid.length !== data.length) {
    console.warn(`[data] Filtered out ${data.length - valid.length} invalid holdings`);
  }
  return valid;
}

export async function fetchPrices(): Promise<PricePoint[]> {
  const fallback: PricePoint[] = [];
  const raw = await safeFetch<unknown[]>(`${BASE_URL}/prices.json`, []);
  if (!Array.isArray(raw)) {
    console.warn('[data] Prices data is not an array, returning empty');
    return fallback;
  }
  const valid = raw.filter(isValidPricePoint).map(d => {
    const price = typeof d.price === 'string' ? parseFloat(d.price) : d.price;
    return { date: d.date, isin: d.isin, price };
  }).filter(d => !isNaN(d.price) && d.price > 0);
  if (valid.length !== raw.length) {
    console.warn(`[data] Filtered out ${raw.length - valid.length} invalid prices`);
  }
  return valid;
}

export async function fetchBenchmark(): Promise<BenchmarkPoint[]> {
  const fallback: BenchmarkPoint[] = [];
  const data = await safeFetch<unknown[]>(BENCHMARK_URL, fallback);
  if (!Array.isArray(data)) {
    console.warn('[data] Benchmark data is not an array, returning empty');
    return fallback;
  }
  const valid = data.filter(isValidBenchmarkPoint);
  if (valid.length !== data.length) {
    console.warn(`[data] Filtered out ${data.length - valid.length} invalid benchmark points`);
  }
  return valid;
}

export async function fetchConstraints(): Promise<Constraints> {
  const fallback: Constraints = {
    min_weight: 0.02,
    max_weight: 0.25,
    per_asset_class_caps: {},
    max_assets: 5,
  };
  const data = await safeFetch<unknown>(`${BASE_URL}/constraints.json`, fallback);
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    console.warn('[data] Constraints data is invalid, returning defaults');
    return fallback;
  }
  const obj = data as Record<string, unknown>;
  const minWeight = typeof obj.min_weight === 'number' && !isNaN(obj.min_weight) && obj.min_weight >= 0 ? obj.min_weight : fallback.min_weight;
  const maxWeight = typeof obj.max_weight === 'number' && !isNaN(obj.max_weight) && obj.max_weight > 0 ? obj.max_weight : fallback.max_weight;
  const maxAssets = typeof obj.max_assets === 'number' && !isNaN(obj.max_assets) && obj.max_assets > 0 ? obj.max_assets : fallback.max_assets;
  const perAssetClassCaps = typeof obj.per_asset_class_caps === 'object' && obj.per_asset_class_caps !== null && !Array.isArray(obj.per_asset_class_caps)
    ? obj.per_asset_class_caps as Record<string, number>
    : fallback.per_asset_class_caps;

  if (minWeight > maxWeight) {
    console.warn(`[data] min_weight (${minWeight}) > max_weight (${maxWeight}), using defaults`);
    return fallback;
  }

  return {
    min_weight: minWeight,
    max_weight: maxWeight,
    per_asset_class_caps: perAssetClassCaps,
    max_assets: maxAssets,
  };
}