import type { Holding, PricePoint, BenchmarkPoint, Constraints } from './types';

const BASE_URL = 'https://antarctica-hiring-data.s3.eu-west-1.amazonaws.com/portfolio-optimisation/2026-04';
const BENCHMARK_URL = 'https://antarctica-hiring-data.s3.eu-east-1.amazonaws.com/portfolio-optimisation/2026-04/benchmark.json';

export async function fetchHoldings(): Promise<Holding[]> {
  const res = await fetch(`${BASE_URL}/holdings.json`);
  if (!res.ok) throw new Error(`Failed to fetch holdings: ${res.statusText}`);
  return res.json();
}

export async function fetchPrices(): Promise<PricePoint[]> {
  const res = await fetch(`${BASE_URL}/prices.json`);
  if (!res.ok) throw new Error(`Failed to fetch prices: ${res.statusText}`);
  const data: Array<{ date: string; isin: string; price: number | string }> = await res.json();
  return data.map(d => ({
    date: d.date,
    isin: d.isin,
    price: typeof d.price === 'string' ? parseFloat(d.price) : d.price,
  }));
}

export async function fetchBenchmark(): Promise<BenchmarkPoint[]> {
  const res = await fetch(BENCHMARK_URL);
  if (!res.ok) throw new Error(`Failed to fetch benchmark: ${res.statusText}`);
  return res.json();
}

export async function fetchConstraints(): Promise<Constraints> {
  const res = await fetch(`${BASE_URL}/constraints.json`);
  if (!res.ok) throw new Error(`Failed to fetch constraints: ${res.statusText}`);
  return res.json();
}