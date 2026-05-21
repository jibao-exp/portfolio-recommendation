import {
  normalizeAssetClass,
  groupPricesByIsin,
  calculateReturns,
  annualizedReturn,
  annualizedVolatility,
  optimizePortfolio,
  calculatePortfolioMetrics,
} from './optimizer';
import type { Holding, PricePoint, BenchmarkPoint, Constraints, AssetMetrics } from './types';

describe('normalizeAssetClass', () => {
  it('normalizes "Equity" to "Equity"', () => {
    expect(normalizeAssetClass('Equity')).toBe('Equity');
  });

  it('normalizes "equity" to "Equity"', () => {
    expect(normalizeAssetClass('equity')).toBe('Equity');
  });

  it('normalizes "Fixed Income" to "Fixed Income"', () => {
    expect(normalizeAssetClass('Fixed Income')).toBe('Fixed Income');
  });

  it('normalizes "fixed-income" to "Fixed Income"', () => {
    expect(normalizeAssetClass('fixed-income')).toBe('Fixed Income');
  });

  it('normalizes "FI" to "Fixed Income"', () => {
    expect(normalizeAssetClass('FI')).toBe('Fixed Income');
  });

  it('normalizes "Alternatives" to "Alternatives"', () => {
    expect(normalizeAssetClass('Alternatives')).toBe('Alternatives');
  });

  it('normalizes "alts" to "Alternatives"', () => {
    expect(normalizeAssetClass('alts')).toBe('Alternatives');
  });

  it('capitalizes unknown asset classes', () => {
    expect(normalizeAssetClass('commodity')).toBe('Commodity');
  });
});

describe('groupPricesByIsin', () => {
  it('groups prices by ISIN', () => {
    const prices: PricePoint[] = [
      { date: '2023-04-05', isin: 'A', price: 100 },
      { date: '2023-04-05', isin: 'B', price: 50 },
      { date: '2023-04-06', isin: 'A', price: 101 },
      { date: '2023-04-06', isin: 'B', price: 51 },
    ];

    const grouped = groupPricesByIsin(prices);

    expect(grouped.size).toBe(2);
    expect(grouped.get('A')!.length).toBe(2);
    expect(grouped.get('B')!.length).toBe(2);
    expect(grouped.get('A')![0].price).toBe(100);
    expect(grouped.get('B')![0].price).toBe(50);
  });

  it('sorts prices by date within each ISIN', () => {
    const prices: PricePoint[] = [
      { date: '2023-04-07', isin: 'A', price: 102 },
      { date: '2023-04-05', isin: 'A', price: 100 },
      { date: '2023-04-06', isin: 'A', price: 101 },
    ];

    const grouped = groupPricesByIsin(prices);
    const dates = grouped.get('A')!.map(p => p.date);

    expect(dates).toEqual(['2023-04-05', '2023-04-06', '2023-04-07']);
  });

  it('handles empty input', () => {
    const grouped = groupPricesByIsin([]);
    expect(grouped.size).toBe(0);
  });
});

describe('calculateReturns', () => {
  it('calculates simple returns correctly', () => {
    const history = [
      { date: '2023-04-05', price: 100 },
      { date: '2023-04-06', price: 101 },
      { date: '2023-04-07', price: 99 },
    ];

    const returns = calculateReturns(history);

    expect(returns).toHaveLength(2);
    expect(returns[0]).toBeCloseTo(0.01);
    expect(returns[1]).toBeCloseTo(-0.0198, 4);
  });

  it('returns empty array for single price point', () => {
    const history = [{ date: '2023-04-05', price: 100 }];
    expect(calculateReturns(history)).toEqual([]);
  });

  it('returns empty array for empty history', () => {
    expect(calculateReturns([])).toEqual([]);
  });

  it('handles constant prices (zero returns)', () => {
    const history = [
      { date: '2023-04-05', price: 100 },
      { date: '2023-04-06', price: 100 },
      { date: '2023-04-07', price: 100 },
    ];

    const returns = calculateReturns(history);
    expect(returns).toEqual([0, 0]);
  });
});

describe('annualizedReturn', () => {
  it('annualizes positive daily returns', () => {
    const dailyReturns = [0.001, 0.002, 0.0015];
    const mean = (0.001 + 0.002 + 0.0015) / 3;
    const expected = mean * 252;

    expect(annualizedReturn(dailyReturns)).toBeCloseTo(expected);
  });

  it('annualizes negative daily returns', () => {
    const dailyReturns = [-0.001, -0.002, -0.0015];
    const mean = (-0.001 - 0.002 - 0.0015) / 3;
    const expected = mean * 252;

    expect(annualizedReturn(dailyReturns)).toBeCloseTo(expected);
  });

  it('returns 0 for empty returns array', () => {
    expect(annualizedReturn([])).toBe(0);
  });

  it('returns 0 for zero mean returns', () => {
    expect(annualizedReturn([0.001, -0.001])).toBe(0);
  });
});

describe('annualizedVolatility', () => {
  it('calculates volatility for varying returns', () => {
    const dailyReturns = [0.01, -0.01, 0.02, -0.02, 0.005];
    const vol = annualizedVolatility(dailyReturns);

    expect(vol).toBeGreaterThan(0);
    expect(vol).toBeLessThan(1);
  });

  it('returns 0 for constant returns', () => {
    const dailyReturns = [0.001, 0.001, 0.001];
    expect(annualizedVolatility(dailyReturns)).toBe(0);
  });

  it('returns 0 for single return', () => {
    expect(annualizedVolatility([0.01])).toBe(0);
  });

  it('returns 0 for empty returns', () => {
    expect(annualizedVolatility([])).toBe(0);
  });

  it('scales with sqrt(252)', () => {
    const dailyReturns = [0.01, -0.01, 0.015, -0.005, 0.008, -0.012, 0.003];
    const mean = dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length;
    const variance = dailyReturns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / (dailyReturns.length - 1);
    const dailyVol = Math.sqrt(variance);
    const expected = dailyVol * Math.sqrt(252);

    expect(annualizedVolatility(dailyReturns)).toBeCloseTo(expected);
  });
});

describe('optimizePortfolio', () => {
  const makeHoldings = (): Holding[] => [
    { isin: 'A001', name: 'Asset A', asset_class: 'Equity', currency: 'USD', weight: 0.2 },
    { isin: 'B001', name: 'Asset B', asset_class: 'Equity', currency: 'USD', weight: 0.3 },
    { isin: 'C001', name: 'Asset C', asset_class: 'Fixed Income', currency: 'USD', weight: 0.5 },
  ];

  const makePrices = (): PricePoint[] => {
    const prices: PricePoint[] = [];
    const basePrices: Record<string, number> = { A001: 100, B001: 50, C001: 200 };

    for (let day = 0; day < 30; day++) {
      const date = `2023-04-${String(day + 1).padStart(2, '0')}`;
      for (const [isin, base] of Object.entries(basePrices)) {
        const trend = isin === 'A001' ? 0.003 : isin === 'B001' ? -0.001 : 0.0005;
        const noise = (Math.sin(day * 0.5 + base) * 0.005);
        prices.push({
          date,
          isin,
          price: base * (1 + trend * day + noise),
        });
      }
    }
    return prices;
  };

  const makeBenchmark = (): BenchmarkPoint[] => {
    const points: BenchmarkPoint[] = [];
    for (let day = 0; day < 30; day++) {
      points.push({
        date: `2023-04-${String(day + 1).padStart(2, '0')}`,
        level: 1000 * (1 + 0.001 * day),
      });
    }
    return points;
  };

  const makeConstraints = (): Constraints => ({
    min_weight: 0.02,
    max_weight: 0.25,
    per_asset_class_caps: { Equity: 0.3, 'Fixed Income': 0.3, Alternatives: 0.3 },
    max_assets: 5,
  });

  it('returns metrics for all holdings', () => {
    const holdings = makeHoldings();
    const prices = makePrices();
    const benchmark = makeBenchmark();
    const constraints = makeConstraints();

    const result = optimizePortfolio(holdings, prices, benchmark, constraints);

    expect(result).toHaveLength(3);
    expect(result.map(r => r.isin)).toEqual(['A001', 'B001', 'C001']);
  });

  it('calculates non-zero metrics for each asset', () => {
    const holdings = makeHoldings();
    const prices = makePrices();
    const benchmark = makeBenchmark();
    const constraints = makeConstraints();

    const result = optimizePortfolio(holdings, prices, benchmark, constraints);

    result.forEach(asset => {
      expect(asset.annualized_return).toBeDefined();
      expect(asset.annualized_volatility).toBeDefined();
      expect(asset.sharpe_ratio).toBeDefined();
      expect(asset.max_drawdown).toBeDefined();
      expect(asset.correlation_with_benchmark).toBeDefined();
    });
  });

  it('assigns recommended weights that are positive and respect constraints', () => {
    const holdings = makeHoldings();
    const prices = makePrices();
    const benchmark = makeBenchmark();
    const constraints = makeConstraints();

    const result = optimizePortfolio(holdings, prices, benchmark, constraints);
    const totalWeight = result.reduce((sum, a) => sum + a.recommended_weight, 0);

    expect(totalWeight).toBeGreaterThan(0);
    expect(totalWeight).toBeLessThanOrEqual(1.0);
  });

  it('respects max_weight constraint', () => {
    const holdings = makeHoldings();
    const prices = makePrices();
    const benchmark = makeBenchmark();
    const constraints = makeConstraints();

    const result = optimizePortfolio(holdings, prices, benchmark, constraints);

    result.forEach(asset => {
      expect(asset.recommended_weight).toBeLessThanOrEqual(constraints.max_weight);
    });
  });

  it('respects min_weight constraint for included assets', () => {
    const holdings = makeHoldings();
    const prices = makePrices();
    const benchmark = makeBenchmark();
    const constraints = makeConstraints();

    const result = optimizePortfolio(holdings, prices, benchmark, constraints);

    result
      .filter(a => a.recommended_weight > 0)
      .forEach(asset => {
        expect(asset.recommended_weight).toBeGreaterThanOrEqual(constraints.min_weight);
      });
  });

  it('deduplicates holdings by ISIN', () => {
    const holdings: Holding[] = [
      { isin: 'A001', name: 'Asset A', asset_class: 'Equity', currency: 'USD', weight: 0.2 },
      { isin: 'A001', name: 'Asset A Dup', asset_class: 'equity', currency: 'USD', weight: 0.1 },
    ];
    const prices: PricePoint[] = [
      { date: '2023-04-01', isin: 'A001', price: 100 },
      { date: '2023-04-02', isin: 'A001', price: 101 },
    ];
    const benchmark: BenchmarkPoint[] = [
      { date: '2023-04-01', level: 1000 },
      { date: '2023-04-02', level: 1001 },
    ];
    const constraints: Constraints = {
      min_weight: 0.02,
      max_weight: 0.25,
      per_asset_class_caps: { Equity: 0.5 },
      max_assets: 5,
    };

    const result = optimizePortfolio(holdings, prices, benchmark, constraints);

    expect(result).toHaveLength(1);
    expect(result[0].isin).toBe('A001');
  });

  it('normalizes asset class in output', () => {
    const holdings: Holding[] = [
      { isin: 'A001', name: 'Asset A', asset_class: 'equity', currency: 'USD', weight: 0.5 },
    ];
    const prices: PricePoint[] = [
      { date: '2023-04-01', isin: 'A001', price: 100 },
      { date: '2023-04-02', isin: 'A001', price: 101 },
    ];
    const benchmark: BenchmarkPoint[] = [
      { date: '2023-04-01', level: 1000 },
      { date: '2023-04-02', level: 1001 },
    ];
    const constraints: Constraints = {
      min_weight: 0.02,
      max_weight: 0.25,
      per_asset_class_caps: { Equity: 0.5 },
      max_assets: 5,
    };

    const result = optimizePortfolio(holdings, prices, benchmark, constraints);

    expect(result[0].asset_class).toBe('Equity');
  });

  it('returns min_weight when total Sharpe is zero after filtering', () => {
    const holdings: Holding[] = [
      { isin: 'A001', name: 'Asset A', asset_class: 'Equity', currency: 'USD', weight: 0.5 },
      { isin: 'B001', name: 'Asset B', asset_class: 'Equity', currency: 'USD', weight: 0.5 },
    ];
    const prices: PricePoint[] = [
      { date: '2023-04-01', isin: 'A001', price: 100 },
      { date: '2023-04-02', isin: 'A001', price: 100.0001 },
      { date: '2023-04-01', isin: 'B001', price: 50 },
      { date: '2023-04-02', isin: 'B001', price: 50.0001 },
    ];
    const benchmark: BenchmarkPoint[] = [
      { date: '2023-04-01', level: 1000 },
      { date: '2023-04-02', level: 1000 },
    ];
    const constraints: Constraints = {
      min_weight: 0.02,
      max_weight: 0.25,
      per_asset_class_caps: { Equity: 0.5 },
      max_assets: 5,
    };

    const result = optimizePortfolio(holdings, prices, benchmark, constraints);

    result.forEach(asset => {
      expect(asset.recommended_weight).toBeGreaterThanOrEqual(0.02);
    });
  });

  it('handles empty holdings', () => {
    const result = optimizePortfolio([], [], [], {
      min_weight: 0.02,
      max_weight: 0.25,
      per_asset_class_caps: {},
      max_assets: 5,
    });

    expect(result).toEqual([]);
  });

  it('returns min_weight when all Sharpe ratios are zero or negative', () => {
    const holdings: Holding[] = [
      { isin: 'A001', name: 'Asset A', asset_class: 'Equity', currency: 'USD', weight: 0.5 },
    ];
    const prices: PricePoint[] = [
      { date: '2023-04-01', isin: 'A001', price: 100 },
      { date: '2023-04-02', isin: 'A001', price: 99 },
      { date: '2023-04-03', isin: 'A001', price: 98 },
    ];
    const benchmark: BenchmarkPoint[] = [
      { date: '2023-04-01', level: 1000 },
      { date: '2023-04-02', level: 1000 },
      { date: '2023-04-03', level: 1000 },
    ];
    const constraints: Constraints = {
      min_weight: 0.02,
      max_weight: 0.25,
      per_asset_class_caps: { Equity: 0.5 },
      max_assets: 5,
    };

    const result = optimizePortfolio(holdings, prices, benchmark, constraints);

    expect(result[0].recommended_weight).toBe(0.02);
  });

  it('enforces asset class cap when exceeded', () => {
    const holdings: Holding[] = [
      { isin: 'A001', name: 'Asset A', asset_class: 'Equity', currency: 'USD', weight: 0.5 },
      { isin: 'B001', name: 'Asset B', asset_class: 'Equity', currency: 'USD', weight: 0.5 },
    ];
    const prices: PricePoint[] = [
      { date: '2023-04-01', isin: 'A001', price: 100 },
      { date: '2023-04-02', isin: 'A001', price: 105 },
      { date: '2023-04-03', isin: 'A001', price: 110 },
      { date: '2023-04-01', isin: 'B001', price: 50 },
      { date: '2023-04-02', isin: 'B001', price: 52 },
      { date: '2023-04-03', isin: 'B001', price: 55 },
    ];
    const benchmark: BenchmarkPoint[] = [
      { date: '2023-04-01', level: 1000 },
      { date: '2023-04-02', level: 1001 },
      { date: '2023-04-03', level: 1002 },
    ];
    const constraints: Constraints = {
      min_weight: 0.02,
      max_weight: 0.25,
      per_asset_class_caps: { Equity: 0.3 },
      max_assets: 5,
    };

    const result = optimizePortfolio(holdings, prices, benchmark, constraints);
    const equityTotal = result
      .filter(a => a.asset_class === 'Equity')
      .reduce((sum, a) => sum + a.recommended_weight, 0);

    expect(equityTotal).toBeLessThanOrEqual(0.3);
  });

  it('handles single price point per asset', () => {
    const holdings: Holding[] = [
      { isin: 'A001', name: 'Asset A', asset_class: 'Equity', currency: 'USD', weight: 0.5 },
    ];
    const prices: PricePoint[] = [
      { date: '2023-04-01', isin: 'A001', price: 100 },
    ];
    const benchmark: BenchmarkPoint[] = [
      { date: '2023-04-01', level: 1000 },
    ];
    const constraints: Constraints = {
      min_weight: 0.02,
      max_weight: 0.25,
      per_asset_class_caps: { Equity: 0.5 },
      max_assets: 5,
    };

    const result = optimizePortfolio(holdings, prices, benchmark, constraints);

    expect(result).toHaveLength(1);
    expect(result[0].annualized_return).toBe(0);
    expect(result[0].annualized_volatility).toBe(0);
    expect(result[0].sharpe_ratio).toBe(0);
    expect(result[0].max_drawdown).toBe(0);
  });

  it('handles asset with no price data', () => {
    const holdings: Holding[] = [
      { isin: 'A001', name: 'Asset A', asset_class: 'Equity', currency: 'USD', weight: 0.5 },
      { isin: 'B001', name: 'Asset B', asset_class: 'Fixed Income', currency: 'USD', weight: 0.5 },
    ];
    const prices: PricePoint[] = [
      { date: '2023-04-01', isin: 'A001', price: 100 },
      { date: '2023-04-02', isin: 'A001', price: 105 },
    ];
    const benchmark: BenchmarkPoint[] = [
      { date: '2023-04-01', level: 1000 },
      { date: '2023-04-02', level: 1001 },
    ];
    const constraints: Constraints = {
      min_weight: 0.02,
      max_weight: 0.25,
      per_asset_class_caps: { Equity: 0.5, 'Fixed Income': 0.5 },
      max_assets: 5,
    };

    const result = optimizePortfolio(holdings, prices, benchmark, constraints);

    expect(result).toHaveLength(2);
    const assetB = result.find(a => a.isin === 'B001');
    expect(assetB).toBeDefined();
    expect(assetB!.annualized_return).toBe(0);
    expect(assetB!.annualized_volatility).toBe(0);
  });

  it('handles empty benchmark data', () => {
    const holdings: Holding[] = [
      { isin: 'A001', name: 'Asset A', asset_class: 'Equity', currency: 'USD', weight: 0.5 },
    ];
    const prices: PricePoint[] = [
      { date: '2023-04-01', isin: 'A001', price: 100 },
      { date: '2023-04-02', isin: 'A001', price: 105 },
    ];
    const benchmark: BenchmarkPoint[] = [];
    const constraints: Constraints = {
      min_weight: 0.02,
      max_weight: 0.25,
      per_asset_class_caps: { Equity: 0.5 },
      max_assets: 5,
    };

    const result = optimizePortfolio(holdings, prices, benchmark, constraints);

    expect(result).toHaveLength(1);
    expect(result[0].correlation_with_benchmark).toBe(0);
  });

  it('handles empty price data', () => {
    const holdings: Holding[] = [
      { isin: 'A001', name: 'Asset A', asset_class: 'Equity', currency: 'USD', weight: 0.5 },
    ];
    const prices: PricePoint[] = [];
    const benchmark: BenchmarkPoint[] = [
      { date: '2023-04-01', level: 1000 },
      { date: '2023-04-02', level: 1001 },
    ];
    const constraints: Constraints = {
      min_weight: 0.02,
      max_weight: 0.25,
      per_asset_class_caps: { Equity: 0.5 },
      max_assets: 5,
    };

    const result = optimizePortfolio(holdings, prices, benchmark, constraints);

    expect(result).toHaveLength(1);
    expect(result[0].annualized_return).toBe(0);
    expect(result[0].annualized_volatility).toBe(0);
    expect(result[0].sharpe_ratio).toBe(0);
  });

  it('handles constant price data (zero volatility)', () => {
    const holdings: Holding[] = [
      { isin: 'A001', name: 'Asset A', asset_class: 'Equity', currency: 'USD', weight: 0.5 },
    ];
    const prices: PricePoint[] = [
      { date: '2023-04-01', isin: 'A001', price: 100 },
      { date: '2023-04-02', isin: 'A001', price: 100 },
      { date: '2023-04-03', isin: 'A001', price: 100 },
    ];
    const benchmark: BenchmarkPoint[] = [
      { date: '2023-04-01', level: 1000 },
      { date: '2023-04-02', level: 1001 },
      { date: '2023-04-03', level: 1002 },
    ];
    const constraints: Constraints = {
      min_weight: 0.02,
      max_weight: 0.25,
      per_asset_class_caps: { Equity: 0.5 },
      max_assets: 5,
    };

    const result = optimizePortfolio(holdings, prices, benchmark, constraints);

    expect(result).toHaveLength(1);
    expect(result[0].annualized_return).toBe(0);
    expect(result[0].annualized_volatility).toBe(0);
    expect(result[0].sharpe_ratio).toBe(0);
  });

  it('handles benchmark with single data point', () => {
    const holdings: Holding[] = [
      { isin: 'A001', name: 'Asset A', asset_class: 'Equity', currency: 'USD', weight: 0.5 },
    ];
    const prices: PricePoint[] = [
      { date: '2023-04-01', isin: 'A001', price: 100 },
      { date: '2023-04-02', isin: 'A001', price: 105 },
    ];
    const benchmark: BenchmarkPoint[] = [
      { date: '2023-04-01', level: 1000 },
    ];
    const constraints: Constraints = {
      min_weight: 0.02,
      max_weight: 0.25,
      per_asset_class_caps: { Equity: 0.5 },
      max_assets: 5,
    };

    const result = optimizePortfolio(holdings, prices, benchmark, constraints);

    expect(result).toHaveLength(1);
    expect(result[0].correlation_with_benchmark).toBe(0);
  });
});

describe('calculatePortfolioMetrics', () => {
  const makeMetrics = (overrides: Partial<AssetMetrics> = {}): AssetMetrics => ({
    isin: 'A001',
    name: 'Asset A',
    asset_class: 'Equity',
    currency: 'USD',
    current_weight: 0.2,
    recommended_weight: 0.25,
    annualized_return: 0.10,
    annualized_volatility: 0.15,
    sharpe_ratio: 0.4,
    max_drawdown: 0.05,
    correlation_with_benchmark: 0.8,
    price_history: [],
    ...overrides,
  });

  it('calculates weighted portfolio return', () => {
    const metrics = [
      makeMetrics({ recommended_weight: 0.5, annualized_return: 0.10 }),
      makeMetrics({ isin: 'B001', recommended_weight: 0.5, annualized_return: 0.06 }),
    ];

    const result = calculatePortfolioMetrics(metrics);

    expect(result.annualized_return).toBeCloseTo(0.08);
  });

  it('calculates portfolio volatility', () => {
    const metrics = [
      makeMetrics({ recommended_weight: 0.5, annualized_volatility: 0.20 }),
      makeMetrics({ isin: 'B001', recommended_weight: 0.5, annualized_volatility: 0.10 }),
    ];

    const result = calculatePortfolioMetrics(metrics);

    expect(result.annualized_volatility).toBeGreaterThan(0);
  });

  it('calculates portfolio Sharpe ratio', () => {
    const metrics = [
      makeMetrics({ recommended_weight: 1.0, annualized_return: 0.10, annualized_volatility: 0.15 }),
    ];

    const result = calculatePortfolioMetrics(metrics);

    expect(result.sharpe_ratio).toBeCloseTo((0.10 - 0.04) / 0.15, 4);
  });

  it('calculates weighted max drawdown', () => {
    const metrics = [
      makeMetrics({ recommended_weight: 0.5, max_drawdown: 0.10 }),
      makeMetrics({ isin: 'B001', recommended_weight: 0.5, max_drawdown: 0.05 }),
    ];

    const result = calculatePortfolioMetrics(metrics);

    expect(result.max_drawdown).toBeCloseTo(0.075);
  });

  it('handles empty metrics', () => {
    const result = calculatePortfolioMetrics([]);

    expect(result.annualized_return).toBe(0);
    expect(result.annualized_volatility).toBe(0);
    expect(result.sharpe_ratio).toBe(0);
    expect(result.max_drawdown).toBe(0);
  });
});
