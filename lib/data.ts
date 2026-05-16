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

export async function fetchHoldings(): Promise<Holding[]> {
  const fallback: Holding[] = [];
  const data = await safeFetch<Holding[]>(`${BASE_URL}/holdings.json`, fallback);
  if (!Array.isArray(data)) {
    console.warn('[data] Holdings data is not an array, returning empty');
    return fallback;
  }
  return data;
}

export async function fetchPrices(): Promise<PricePoint[]> {
  const fallback: PricePoint[] = [];
  const raw = await safeFetch<Array<{ date: string; isin: string; price: number | string }>>(
    `${BASE_URL}/prices.json`,
    []
  );
  if (!Array.isArray(raw)) {
    console.warn('[data] Prices data is not an array, returning empty');
    return fallback;
  }
  return raw.map(d => ({
    date: d.date,
    isin: d.isin,
    price: typeof d.price === 'string' ? parseFloat(d.price) : d.price,
  })).filter(d => !isNaN(d.price));
}

export async function fetchBenchmark(): Promise<BenchmarkPoint[]> {
  const fallback: BenchmarkPoint[] = [];
  const data = await safeFetch<BenchmarkPoint[]>(BENCHMARK_URL, fallback);
  if (!Array.isArray(data)) {
    console.warn('[data] Benchmark data is not an array, returning empty');
    return fallback;
  }
  return data;
}

export async function fetchConstraints(): Promise<Constraints> {
  const fallback: Constraints = {
    min_weight: 0.02,
    max_weight: 0.25,
    per_asset_class_caps: {},
    max_assets: 5,
  };
  const data = await safeFetch<Constraints>(`${BASE_URL}/constraints.json`, fallback);
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    console.warn('[data] Constraints data is invalid, returning defaults');
    return fallback;
  }
  return {
    min_weight: typeof data.min_weight === 'number' ? data.min_weight : fallback.min_weight,
    max_weight: typeof data.max_weight === 'number' ? data.max_weight : fallback.max_weight,
    per_asset_class_caps: typeof data.per_asset_class_caps === 'object' && !Array.isArray(data.per_asset_class_caps)
      ? data.per_asset_class_caps
      : fallback.per_asset_class_caps,
    max_assets: typeof data.max_assets === 'number' ? data.max_assets : fallback.max_assets,
  };
}