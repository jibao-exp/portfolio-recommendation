---
name: "risk-analyzer"
description: "Analyzes portfolio risk using VaR, CVaR, stress testing, and scenario analysis. Invoke when user asks for risk assessment, Value at Risk, drawdown analysis, volatility analysis, stress testing, or risk metrics calculation."
---

# Risk Analyzer

This skill provides comprehensive portfolio risk analysis using professional quantitative risk management techniques used by institutional investors and fund managers.

## When to Invoke

- User requests risk analysis or risk metrics
- User asks for Value at Risk (VaR) calculations
- User wants drawdown analysis
- User needs stress testing or scenario analysis
- User asks about portfolio volatility or risk decomposition
- User requests correlation analysis
- User wants risk contribution analysis

## Core Risk Metrics

### 1. Value at Risk (VaR)

```typescript
interface VaRConfig {
  confidenceLevel: number; // e.g., 0.95, 0.99
  timeHorizon: number; // in days
  method: 'historical' | 'parametric' | 'monteCarlo';
}

interface VaRResult {
  varAbsolute: number;
  varPercentage: number;
  expectedShortfall: number; // CVaR
  confidenceLevel: number;
  timeHorizon: number;
}
```

**Calculation Methods:**

| Method | Description | Pros | Cons |
|--------|-------------|------|------|
| Historical | Uses actual historical returns | No distribution assumption | Limited by history |
| Parametric | Assumes normal distribution | Fast, analytical | Ignores fat tails |
| Monte Carlo | Simulates thousands of scenarios | Flexible, realistic | Computationally intensive |

### 2. Conditional VaR (Expected Shortfall)

- CVaR = E[Loss | Loss > VaR]
- More coherent risk measure than VaR
- Captures tail risk better
- Required by Basel III regulations

### 3. Drawdown Analysis

```typescript
interface DrawdownMetrics {
  maxDrawdown: number;
  maxDrawdownDuration: number; // days
  currentDrawdown: number;
  averageDrawdown: number;
  drawdownRecoveryTime: number; // days
  underwaterPeriod: number; // days
}
```

**Key Concepts:**
- Drawdown = (Peak - Trough) / Peak
- Max Drawdown = worst peak-to-trough decline
- Recovery time = days to return to previous peak
- Underwater period = time spent below previous peak

### 4. Volatility Analysis

```typescript
interface VolatilityMetrics {
  annualizedVolatility: number;
  downsideDeviation: number;
  upsideCapture: number;
  downsideCapture: number;
  volatilityTrend: 'increasing' | 'decreasing' | 'stable';
  realizedVolatility: number;
  impliedVolatility?: number;
}
```

**Volatility Measures:**
- Annualized volatility = σ × √252 (for daily returns)
- Downside deviation = only negative returns volatility
- Realized volatility = historical volatility
- Implied volatility = from options prices (if available)

## Risk Decomposition

### 1. Marginal Risk Contribution

```
MRCi = ∂σp / ∂wi = (Σw)j / σp
```

### 2. Component Risk Contribution

```
CRCi = wi × MRCi
```

### 3. Percentage Risk Contribution

```
PRCi = CRCi / σp × 100%
```

**Use Case:** Identify which assets contribute most to portfolio risk

## Stress Testing

### Scenario Analysis Framework

```typescript
interface StressScenario {
  name: string;
  description: string;
  shocks: Record<string, number>; // asset -> return shock
  probability?: number;
  severity: 'mild' | 'moderate' | 'severe' | 'extreme';
}

const historicalScenarios = {
  '2008 Financial Crisis': {
    'Equity': -0.50,
    'Corporate Bonds': -0.15,
    'Government Bonds': 0.10,
    'Commodities': -0.40,
    'Real Estate': -0.35
  },
  '2020 COVID Crash': {
    'Equity': -0.35,
    'Corporate Bonds': -0.08,
    'Government Bonds': 0.05,
    'Commodities': -0.25,
    'Real Estate': -0.20
  },
  'Interest Rate Shock': {
    'Equity': -0.10,
    'Corporate Bonds': -0.12,
    'Government Bonds': -0.15,
    'Commodities': -0.05,
    'Real Estate': -0.18
  }
};
```

### Stress Testing Process

1. Define scenarios (historical and hypothetical)
2. Apply shocks to portfolio holdings
3. Calculate portfolio impact
4. Assess capital adequacy
5. Identify vulnerabilities
6. Recommend risk mitigation actions

## Correlation Analysis

```typescript
interface CorrelationAnalysis {
  correlationMatrix: number[][];
  averageCorrelation: number;
  maxCorrelation: number;
  minCorrelation: number;
  clusteringResults?: AssetCluster[];
  diversificationRatio: number;
}
```

**Key Metrics:**
- Average correlation: portfolio diversification indicator
- Max correlation: identify concentrated risk
- Diversification ratio: σweighted / σportfolio
- Rolling correlation: stability over time

## Risk-Adjusted Performance

```typescript
interface RiskAdjustedMetrics {
  sharpeRatio: number;
  sortinoRatio: number;
  treynorRatio: number;
  informationRatio: number;
  calmarRatio: number;
  omegaRatio: number;
  m2Measure: number;
}
```

**Interpretation Guidelines:**

| Metric | Good | Excellent | Formula |
|--------|------|-----------|---------|
| Sharpe Ratio | > 1.0 | > 2.0 | (Rp - Rf) / σp |
| Sortino Ratio | > 1.5 | > 2.5 | (Rp - Rf) / σdownside |
| Information Ratio | > 0.5 | > 1.0 | (Rp - Rb) / TE |
| Calmar Ratio | > 0.5 | > 1.5 | Return / MaxDD |

## Implementation Guidelines

### Data Requirements

- Minimum 3 years of daily price data
- Benchmark data for relative risk metrics
- Risk-free rate data
- Factor returns (for factor analysis)

### Calculation Best Practices

1. **Annualization**: Use √252 for daily volatility
2. **Log Returns**: Prefer log returns for aggregation
3. **Rolling Windows**: Use appropriate lookback periods
4. **Outliers**: Handle extreme values carefully
5. **Missing Data**: Use forward-fill or interpolation

### Risk Reporting

Always provide:
1. Executive summary of key risk metrics
2. Risk decomposition by asset/sector
3. Stress test results
4. Historical drawdown analysis
5. Correlation structure
6. Risk-adjusted performance metrics
7. Risk alerts and recommendations

## Risk Alerts

Trigger alerts when:
- Portfolio VaR exceeds threshold
- Single asset risk contribution > 30%
- Correlation between top holdings > 0.8
- Drawdown exceeds historical average by 2x
- Volatility spikes > 50% above average
- Concentration limits breached

## Output Requirements

When providing risk analysis, always include:
1. Key risk metrics summary table
2. VaR and CVaR at 95% and 99% confidence
3. Maximum drawdown and recovery analysis
4. Risk decomposition (marginal and component)
5. Stress test results for key scenarios
6. Correlation matrix visualization
7. Risk-adjusted performance metrics
8. Actionable risk management recommendations
