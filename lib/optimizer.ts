import type { Holding, PricePoint, BenchmarkPoint, Constraints, AssetMetrics, PortfolioMetrics } from './types';

const TRADING_DAYS_PER_YEAR = 252;
const RISK_FREE_RATE = 0.04;

export function normalizeAssetClass(assetClass: string): string {
  const normalized = assetClass.toLowerCase().replace(/[\s-]/g, '');
  if (normalized === 'equity') return 'Equity';
  if (normalized === 'fixedincome' || normalized === 'fi') return 'Fixed Income';
  if (normalized === 'alternatives' || normalized === 'alts') return 'Alternatives';
  return assetClass.charAt(0).toUpperCase() + assetClass.slice(1);
}

export function groupPricesByIsin(prices: PricePoint[]): Map<string, { date: string; price: number }[]> {
  const grouped = new Map<string, { date: string; price: number }[]>();
  for (const p of prices) {
    if (!grouped.has(p.isin)) grouped.set(p.isin, []);
    grouped.get(p.isin)!.push({ date: p.date, price: p.price });
  }
  for (const [, arr] of grouped) {
    arr.sort((a, b) => String(a.date).localeCompare(String(b.date)));
  }
  return grouped;
}

export function calculateReturns(priceHistory: { date: string; price: number }[]): number[] {
  const returns: number[] = [];
  for (let i = 1; i < priceHistory.length; i++) {
    const ret = (priceHistory[i].price - priceHistory[i - 1].price) / priceHistory[i - 1].price;
    returns.push(ret);
  }
  return returns;
}

export function annualizedReturn(dailyReturns: number[]): number {
  if (dailyReturns.length === 0) return 0;
  const mean = dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length;
  return mean * TRADING_DAYS_PER_YEAR;
}

export function annualizedVolatility(dailyReturns: number[]): number {
  if (dailyReturns.length < 2) return 0;
  const mean = dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length;
  const variance = dailyReturns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / (dailyReturns.length - 1);
  return Math.sqrt(variance) * Math.sqrt(TRADING_DAYS_PER_YEAR);
}

function sharpeRatio(dailyReturns: number[]): number {
  const vol = annualizedVolatility(dailyReturns);
  if (vol === 0) return 0;
  const annRet = annualizedReturn(dailyReturns);
  return (annRet - RISK_FREE_RATE) / vol;
}

function maxDrawdown(priceHistory: { date: string; price: number }[]): number {
  if (priceHistory.length === 0) return 0;
  let peak = priceHistory[0].price;
  let maxDD = 0;
  for (const p of priceHistory) {
    if (p.price > peak) peak = p.price;
    const dd = (peak - p.price) / peak;
    if (dd > maxDD) maxDD = dd;
  }
  return maxDD;
}

function correlation(returnsA: number[], returnsB: number[]): number {
  const len = Math.min(returnsA.length, returnsB.length);
  if (len < 2) return 0;
  const a = returnsA.slice(0, len);
  const b = returnsB.slice(0, len);
  const meanA = a.reduce((s, v) => s + v, 0) / len;
  const meanB = b.reduce((s, v) => s + v, 0) / len;
  let cov = 0, varA = 0, varB = 0;
  for (let i = 0; i < len; i++) {
    const da = a[i] - meanA;
    const db = b[i] - meanB;
    cov += da * db;
    varA += da * da;
    varB += db * db;
  }
  const denom = Math.sqrt(varA * varB);
  return denom === 0 ? 0 : cov / denom;
}

export function optimizePortfolio(
  holdings: Holding[],
  prices: PricePoint[],
  benchmark: BenchmarkPoint[],
  constraints: Constraints
): AssetMetrics[] {
  const pricesByIsin = groupPricesByIsin(prices);
  const benchmarkReturns = calculateReturns(
    benchmark.map(b => ({ date: b.date, price: b.level }))
  );

  const deduplicatedHoldings = deduplicateHoldings(holdings);

  const assetMetrics: AssetMetrics[] = deduplicatedHoldings.map(holding => {
    const priceHistory = pricesByIsin.get(holding.isin) || [];
    const returns = calculateReturns(priceHistory);

    return {
      isin: holding.isin,
      name: holding.name,
      asset_class: normalizeAssetClass(holding.asset_class),
      currency: holding.currency,
      current_weight: holding.weight,
      recommended_weight: 0,
      annualized_return: annualizedReturn(returns),
      annualized_volatility: annualizedVolatility(returns),
      sharpe_ratio: sharpeRatio(returns),
      max_drawdown: maxDrawdown(priceHistory),
      correlation_with_benchmark: correlation(returns, benchmarkReturns),
      price_history: priceHistory,
    };
  });

  assetMetrics.forEach(asset => {
    asset.recommended_weight = calculateRecommendedWeight(asset, assetMetrics, constraints);
  });

  return assetMetrics;
}

function deduplicateHoldings(holdings: Holding[]): Holding[] {
  const seen = new Map<string, Holding>();
  for (const h of holdings) {
    if (!seen.has(h.isin)) {
      seen.set(h.isin, { ...h, asset_class: normalizeAssetClass(h.asset_class) });
    }
  }
  return Array.from(seen.values());
}

function calculateRecommendedWeight(
  asset: AssetMetrics,
  allAssets: AssetMetrics[],
  constraints: Constraints
): number {
  const validAssets = allAssets.filter(a => a.sharpe_ratio > 0);

  if (validAssets.length === 0) {
    return constraints.min_weight;
  }

  const totalSharpe = validAssets.reduce((sum, a) => sum + Math.max(a.sharpe_ratio, 0), 0);

  if (totalSharpe === 0) {
    return constraints.min_weight;
  }

  let weight = (Math.max(asset.sharpe_ratio, 0) / totalSharpe);

  weight = Math.max(weight, constraints.min_weight);
  weight = Math.min(weight, constraints.max_weight);

  const assetClassWeight = allAssets
    .filter(a => a.asset_class === asset.asset_class)
    .reduce((sum, a) => sum + a.recommended_weight || 0, 0);

  const classCap = constraints.per_asset_class_caps[asset.asset_class] || 0.3;
  if (assetClassWeight + weight > classCap) {
    weight = Math.max(classCap - assetClassWeight, constraints.min_weight);
  }

  return Math.round(weight * 10000) / 10000;
}

export function calculatePortfolioMetrics(metrics: AssetMetrics[]): PortfolioMetrics {
  let weightedReturn = 0;
  let weightedVol = 0;

  for (const m of metrics) {
    weightedReturn += m.recommended_weight * m.annualized_return;
    weightedVol += Math.pow(m.recommended_weight * m.annualized_volatility, 2);
  }

  const portfolioVol = Math.sqrt(weightedVol);
  const portfolioSharpe = portfolioVol > 0 ? (weightedReturn - RISK_FREE_RATE) / portfolioVol : 0;

  let portfolioMaxDD = 0;
  for (const m of metrics) {
    portfolioMaxDD += m.recommended_weight * m.max_drawdown;
  }

  return {
    annualized_return: weightedReturn,
    annualized_volatility: portfolioVol,
    sharpe_ratio: portfolioSharpe,
    max_drawdown: portfolioMaxDD,
    total_return: weightedReturn,
  };
}