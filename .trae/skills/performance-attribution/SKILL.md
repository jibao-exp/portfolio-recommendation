---
name: "performance-attribution"
description: "Analyzes portfolio performance using Brinson attribution, factor analysis, and benchmark-relative metrics. Invoke when user asks for performance analysis, return attribution, benchmark comparison, alpha/beta analysis, or performance reporting."
---

# Performance Attribution

This skill provides comprehensive portfolio performance analysis using institutional-grade attribution methodologies employed by professional fund managers and investment analysts.

## When to Invoke

- User requests portfolio performance analysis
- User asks for return attribution or performance decomposition
- User wants benchmark-relative performance comparison
- User needs alpha/beta analysis
- User asks about performance reporting
- User requests factor-based performance analysis
- User wants to understand sources of portfolio returns

## Performance Measurement

### 1. Return Calculations

```typescript
interface ReturnMetrics {
  totalReturn: number;
  annualizedReturn: number;
  cumulativeReturn: number;
  periodReturn: number;
  benchmarkReturn: number;
  excessReturn: number;
  activeReturn: number;
}
```

**Return Calculation Methods:**

| Method | Formula | Use Case |
|--------|---------|----------|
| Simple Return | (P1 - P0) / P0 | Single period |
| Log Return | ln(P1 / P0) | Multi-period aggregation |
| Time-Weighted | Geometric linking | Manager performance |
| Money-Weighted | IRR calculation | Investor experience |
| Linked Internal | Sub-period linking | Cash flow adjustment |

### 2. Annualization

```typescript
function annualizeReturn(cumulativeReturn: number, periods: number): number {
  return Math.pow(1 + cumulativeReturn, 252 / periods) - 1;
}

function annualizeVolatility(dailyVol: number): number {
  return dailyVol * Math.sqrt(252);
}
```

## Brinson Attribution Model

### 1. Single-Period Brinson Model

```typescript
interface BrinsonAttribution {
  allocationEffect: number;
  selectionEffect: number;
  interactionEffect: number;
  totalActiveReturn: number;
  bySector: SectorAttribution[];
}

interface SectorAttribution {
  sector: string;
  portfolioWeight: number;
  benchmarkWeight: number;
  portfolioReturn: number;
  benchmarkReturn: number;
  allocationEffect: number;
  selectionEffect: number;
  interactionEffect: number;
  totalEffect: number;
}
```

**Formulas:**

- **Allocation Effect** = Σ (wp - wb) × Rb
  - Measures impact of overweighting/underweighting sectors
  
- **Selection Effect** = Σ wb × (Rp - Rb)
  - Measures impact of security selection within sectors
  
- **Interaction Effect** = Σ (wp - wb) × (Rp - Rb)
  - Measures combined effect of allocation and selection decisions

### 2. Multi-Period Attribution

| Method | Description | Pros | Cons |
|--------|-------------|------|------|
| Geometric | Links single-period attributions | Exact decomposition | Complex calculation |
| Arithmetic | Sum of single-period | Simple | Approximation error |
| Hybrid | Combines both approaches | Balanced | Moderate complexity |

## Factor-Based Attribution

### 1. Factor Model Framework

```typescript
interface FactorModel {
  factors: Factor[];
  factorReturns: number[][];
  factorExposures: Record<string, number>;
  alpha: number;
  rSquared: number;
  residualRisk: number;
}

interface Factor {
  name: string;
  description: string;
  category: 'Market' | 'Style' | 'Macro' | 'Alternative';
}

const commonFactors: Factor[] = [
  { name: 'Market', description: 'Market excess return', category: 'Market' },
  { name: 'Size', description: 'Small minus Large cap (SMB)', category: 'Style' },
  { name: 'Value', description: 'High minus Low book-to-market (HML)', category: 'Style' },
  { name: 'Momentum', description: 'Winners minus Losers (UMD)', category: 'Style' },
  { name: 'Quality', description: 'High minus Low quality', category: 'Style' },
  { name: 'Low Vol', description: 'Low minus High volatility', category: 'Style' },
  { name: 'Term', description: 'Term premium (long - short bonds)', category: 'Macro' },
  { name: 'Credit', description: 'Credit spread (corp - gov bonds)', category: 'Macro' },
];
```

### 2. Fama-French Models

| Model | Factors | Formula |
|-------|---------|---------|
| CAPM | Market | Rp - Rf = α + β × (Rm - Rf) + ε |
| 3-Factor | Market, Size, Value | Rp - Rf = α + βM × Mkt + βS × SMB + βV × HML + ε |
| 5-Factor | Market, Size, Value, Profitability, Investment | Rp - Rf = α + βM × Mkt + βS × SMB + βV × HML + βP × RMW + βI × CMA + ε |

### 3. Factor Attribution Output

```typescript
interface FactorAttribution {
  factorExposures: Record<string, number>;
  factorContributions: Record<string, number>;
  alpha: number;
  alphaAnnualized: number;
  rSquared: number;
  trackingError: number;
  informationRatio: number;
  factorInterpretation: string;
}
```

## Benchmark-Relative Analysis

### 1. Relative Performance Metrics

```typescript
interface RelativeMetrics {
  portfolioReturn: number;
  benchmarkReturn: number;
  activeReturn: number;
  hitRatio: number; // % of periods outperforming
  upCapture: number;
  downCapture: number;
  captureRatio: number;
  battingAverage: number;
  winLossRatio: number;
}
```

### 2. Capture Ratio Analysis

| Metric | Formula | Interpretation |
|--------|---------|----------------|
| Up Capture | Rp(up) / Rb(up) × 100 | > 100 means outperform in up markets |
| Down Capture | Rp(down) / Rb(down) × 100 | < 100 means outperform in down markets |
| Capture Ratio | Up Capture / Down Capture | > 1 is favorable |

### 3. Rolling Performance

```typescript
interface RollingAnalysis {
  windowSize: number; // months
  rollingReturns: number[];
  rollingActiveReturns: number[];
  rollingVolatility: number[];
  rollingSharpeRatio: number[];
  rollingBeta: number[];
  outperformancePeriods: number;
  underperformancePeriods: number;
}
```

## Risk-Adjusted Performance

### 1. Comprehensive Metrics

```typescript
interface PerformanceMetrics {
  // Return metrics
  totalReturn: number;
  annualizedReturn: number;
  cumulativeReturn: number;
  
  // Risk metrics
  volatility: number;
  maxDrawdown: number;
  valueAtRisk: number;
  
  // Risk-adjusted ratios
  sharpeRatio: number;
  sortinoRatio: number;
  treynorRatio: number;
  informationRatio: number;
  calmarRatio: number;
  
  // Benchmark-relative
  alpha: number;
  beta: number;
  trackingError: number;
  activeShare: number;
}
```

### 2. Metric Interpretation

| Metric | Poor | Average | Good | Excellent |
|--------|------|---------|------|-----------|
| Sharpe Ratio | < 0.5 | 0.5-1.0 | 1.0-1.5 | > 1.5 |
| Information Ratio | < 0.25 | 0.25-0.5 | 0.5-0.75 | > 0.75 |
| Alpha | < -2% | -2% to 0% | 0% to 2% | > 2% |
| Beta | > 1.3 | 1.1-1.3 | 0.9-1.1 | < 0.9 (for defensive) |
| Max Drawdown | > -30% | -20% to -30% | -10% to -20% | < -10% |

## Performance Reporting

### 1. Report Structure

```
PERFORMANCE REPORT
==================
Period: [Start Date] to [End Date]

EXECUTIVE SUMMARY
- Portfolio Return: X%
- Benchmark Return: Y%
- Active Return: Z%
- Key Drivers: [Top 3 factors]

PERFORMANCE ATTRIBUTION
- Allocation Effect: X%
- Selection Effect: Y%
- Interaction Effect: Z%

RISK-ADJUSTED METRICS
- Sharpe Ratio: X
- Information Ratio: Y
- Alpha: Z%

TOP CONTRIBUTORS & DETRACTORS
- Top 3 contributors: [Asset, Return, Contribution]
- Top 3 detractors: [Asset, Return, Contribution]
```

### 2. Visualization Requirements

- Cumulative return chart (portfolio vs benchmark)
- Rolling performance chart
- Attribution waterfall chart
- Factor exposure bar chart
- Drawdown chart
- Scatter plot (risk vs return)

## Implementation Guidelines

### Data Requirements

- Portfolio returns (daily or monthly)
- Benchmark returns (same frequency)
- Asset weights (for attribution)
- Factor returns (for factor analysis)
- Risk-free rate

### Best Practices

1. **Consistent Periods**: Use same time periods for all calculations
2. **Proper Annualization**: Use correct day count conventions
3. **Benchmark Selection**: Choose appropriate, investable benchmark
4. **Transaction Costs**: Include in performance calculations
5. **Cash Flows**: Use time-weighted returns for manager evaluation
6. **Survivorship Bias**: Account for delisted securities

## Output Requirements

When providing performance attribution, always include:

1. Executive summary with key findings
2. Portfolio vs benchmark performance comparison
3. Brinson attribution breakdown (allocation, selection, interaction)
4. Factor-based attribution results
5. Risk-adjusted performance metrics
6. Rolling performance analysis
7. Top contributors and detractors
8. Performance consistency analysis
9. Actionable insights and recommendations
