---
name: "asset-allocator"
description: "Provides strategic and tactical asset allocation recommendations using institutional frameworks. Invoke when user asks for asset allocation strategy, strategic asset allocation, tactical tilts, asset class selection, or investment policy statement creation."
---

# Asset Allocator

This skill provides professional asset allocation recommendations using institutional investment frameworks employed by pension funds, endowments, and wealth management firms.

## When to Invoke

- User requests asset allocation strategy
- User asks for strategic asset allocation (SAA)
- User wants tactical asset allocation (TAA) recommendations
- User needs asset class selection guidance
- User asks about investment policy statements
- User requests portfolio construction from scratch
- User wants to understand asset class characteristics

## Strategic Asset Allocation (SAA)

### 1. Asset Class Framework

```typescript
interface AssetClass {
  name: string;
  category: 'Equity' | 'Fixed Income' | 'Alternative' | 'Cash' | 'Real Asset';
  expectedReturn: number;
  expectedVolatility: number;
  correlations: Record<string, number>;
  liquidity: 'High' | 'Medium' | 'Low';
  minimumInvestment?: number;
  description: string;
}

const standardAssetClasses: AssetClass[] = [
  {
    name: 'US Large Cap Equity',
    category: 'Equity',
    expectedReturn: 0.08,
    expectedVolatility: 0.15,
    liquidity: 'High',
    description: 'S&P 500 or similar index'
  },
  {
    name: 'US Investment Grade Bonds',
    category: 'Fixed Income',
    expectedReturn: 0.04,
    expectedVolatility: 0.05,
    liquidity: 'High',
    description: 'Aggregate bond index'
  },
  // ... more asset classes
];
```

### 2. Capital Market Assumptions

| Asset Class | Expected Return | Volatility | Sharpe Ratio |
|-------------|----------------|------------|--------------|
| US Large Cap Equity | 7-9% | 15-18% | 0.35-0.45 |
| International Developed Equity | 6-8% | 16-20% | 0.30-0.40 |
| Emerging Market Equity | 8-11% | 20-25% | 0.30-0.40 |
| US Investment Grade Bonds | 3-5% | 4-6% | 0.25-0.50 |
| US High Yield Bonds | 5-7% | 7-10% | 0.35-0.55 |
| Real Estate (REITs) | 7-9% | 18-22% | 0.30-0.40 |
| Commodities | 4-6% | 15-20% | 0.15-0.25 |
| Cash/T-Bills | 2-4% | 0-1% | 0.00-0.10 |

### 3. Investor Profiling

```typescript
interface InvestorProfile {
  riskTolerance: 'Conservative' | 'Moderate' | 'Aggressive';
  investmentHorizon: number; // years
  returnObjective: number; // target annual return
  maxDrawdownTolerance: number; // maximum acceptable drawdown
  incomeRequirement: boolean; // need for current income
  liquidityNeeds: 'Low' | 'Medium' | 'High';
  taxStatus: 'Taxable' | 'TaxDeferred' | 'TaxExempt';
  constraints: string[]; // ESG, sector exclusions, etc.
}
```

### 4. Model Portfolios

| Allocation | Conservative | Moderate | Balanced | Growth | Aggressive |
|-----------|-------------|----------|----------|--------|------------|
| US Equity | 15% | 30% | 40% | 50% | 60% |
| International Equity | 5% | 15% | 20% | 25% | 25% |
| Fixed Income | 50% | 35% | 25% | 15% | 10% |
| Real Assets | 10% | 10% | 10% | 5% | 5% |
| Alternatives | 10% | 5% | 5% | 5% | 0% |
| Cash | 10% | 5% | 0% | 0% | 0% |
| Expected Return | 4-5% | 6-7% | 7-8% | 8-9% | 9-10% |
| Expected Volatility | 5-7% | 8-10% | 10-12% | 12-15% | 15-18% |

## Tactical Asset Allocation (TAA)

### 1. Tactical Decision Framework

```typescript
interface TacticalView {
  assetClass: string;
  currentWeight: number;
  strategicWeight: number;
  recommendedWeight: number;
  tilt: 'Overweight' | 'Neutral' | 'Underweight';
  conviction: 'Low' | 'Medium' | 'High';
  rationale: string;
  timeHorizon: number; // months
  catalysts: string[];
}
```

### 2. Market Regime Detection

| Regime | Characteristics | Recommended Positioning |
|--------|----------------|------------------------|
| Early Expansion | Rising growth, low inflation | Cyclical equities, high yield |
| Mid Expansion | Stable growth, moderate inflation | Broad equities, IG bonds |
| Late Expansion | Slowing growth, rising inflation | Defensive equities, TIPS |
| Recession | Declining growth, falling inflation | Government bonds, cash |

### 3. Valuation Signals

- **Equity**: CAPE ratio, equity risk premium, dividend yield
- **Bonds**: Yield curve shape, credit spreads, real yields
- **Real Assets**: Cap rates, rent-to-price ratios
- **Relative**: Risk premium comparisons, momentum signals

## Asset Location Strategy

```typescript
interface AssetLocation {
  assetClass: string;
  taxEfficiency: 'High' | 'Medium' | 'Low';
  recommendedAccount: 'Taxable' | 'TaxDeferred' | 'TaxExempt';
  rationale: string;
}

const assetLocationGuidelines = {
  'US Equities': 'Taxable', // Qualified dividends, long-term cap gains
  'International Equities': 'Taxable', // Foreign tax credit
  'REITs': 'TaxDeferred', // Ordinary income treatment
  'High Yield Bonds': 'TaxDeferred', // Ordinary income
  'Municipal Bonds': 'Taxable', // Tax-exempt interest
  'TIPS': 'TaxDeferred', // Phantom income issue
};
```

## Implementation Guidelines

### 1. Asset Selection Criteria

When selecting specific assets within an asset class:

| Criterion | Weight | Description |
|-----------|--------|-------------|
| Cost | 25% | Expense ratio, trading costs |
| Tracking Error | 20% | Consistency vs benchmark |
| Liquidity | 20% | Bid-ask spread, AUM |
| Tax Efficiency | 15% | Turnover, distribution policy |
| Provider Quality | 10% | Fund company reputation |
| History | 10% | Track record length |

### 2. Rebalancing Policy

```typescript
interface RebalancingPolicy {
  method: 'Calendar' | 'Threshold' | 'Combination';
  calendarFrequency: 'Monthly' | 'Quarterly' | 'Semi-Annual' | 'Annual';
  thresholdPercentage: number; // e.g., 5% deviation triggers rebalance
  taxConsiderations: boolean;
  transactionCostBudget: number; // max cost as % of portfolio
}
```

### 3. Diversification Metrics

- **Effective Number of Bets**: 1 / Σ(wi²)
- **Herfindahl Index**: Σ(wi²)
- **Diversification Ratio**: Weighted avg vol / Portfolio vol
- **Correlation-adjusted allocation**: Account for asset correlations

## Investment Policy Statement (IPS) Framework

### Required IPS Components

1. **Executive Summary**
   - Client objectives
   - Investment philosophy
   - Key constraints

2. **Return Objectives**
   - Target return (absolute or relative)
   - Benchmark selection
   - Time horizon

3. **Risk Tolerance**
   - Volatility target
   - Maximum drawdown
   - Tracking error limits

4. **Asset Allocation**
   - Strategic allocation ranges
   - Permissible asset classes
   - Rebalancing policy

5. **Constraints**
   - Liquidity requirements
   - Tax considerations
   - Legal/regulatory
   - ESG preferences

6. **Monitoring & Review**
   - Performance review frequency
   - IPS review schedule
   - Reporting requirements

## Output Requirements

When providing asset allocation recommendations, always include:

1. Investor profile summary
2. Strategic asset allocation with ranges
3. Expected portfolio characteristics (return, risk, Sharpe)
4. Asset class rationale and capital market assumptions
5. Tactical tilts (if applicable) with justification
6. Implementation recommendations (specific assets/funds)
7. Rebalancing policy
8. Risk monitoring framework
9. Tax optimization considerations
10. Alternative scenarios analysis
