---
name: "portfolio-optimizer"
description: "Performs portfolio optimization using modern portfolio theory, mean-variance optimization, and efficient frontier analysis. Invoke when user asks for portfolio weights optimization, asset allocation, risk-return optimization, or efficient frontier calculations."
---

# Portfolio Optimizer

This skill provides professional portfolio optimization capabilities based on modern portfolio theory (MPT) and quantitative finance principles.

## When to Invoke

- User requests portfolio weight optimization
- User asks for efficient frontier analysis
- User wants risk-return optimization
- User needs optimal asset allocation recommendations
- User requests portfolio rebalancing calculations
- User asks about Sharpe ratio maximization
- User wants minimum variance portfolio calculations

## Core Methodologies

### 1. Mean-Variance Optimization (Markowitz)

```typescript
interface OptimizationInputs {
  expectedReturns: number[];
  covarianceMatrix: number[][];
  riskFreeRate: number;
  constraints: PortfolioConstraints;
}

interface PortfolioConstraints {
  minWeight: number;
  maxWeight: number;
  targetReturn?: number;
  targetRisk?: number;
  maxAssets?: number;
  sectorCaps?: Record<string, number>;
}
```

**Key formulas:**
- Portfolio return: `E(Rp) = Σ(wi × Ri)`
- Portfolio variance: `σ²p = ΣΣ(wi × wj × σij)`
- Sharpe ratio: `SR = (E(Rp) - Rf) / σp`

### 2. Optimization Objectives

| Objective | Description | Use Case |
|-----------|-------------|----------|
| Max Sharpe Ratio | Maximizes risk-adjusted returns | General portfolio optimization |
| Min Variance | Minimizes portfolio risk | Conservative investors |
| Target Return | Achieves specific return with min risk | Goal-based investing |
| Risk Parity | Equal risk contribution from all assets | Diversified portfolios |

### 3. Efficient Frontier

Generate the efficient frontier by:
1. Calculating optimal portfolios for different target returns
2. Plotting risk-return tradeoff curve
3. Identifying the tangency portfolio (max Sharpe ratio)
4. Finding the minimum variance portfolio

## Implementation Guidelines

### Data Requirements

- Historical price data (minimum 3 years recommended)
- Asset returns calculation (log returns preferred)
- Covariance matrix estimation
- Risk-free rate (use government bond yields)

### Risk Metrics to Calculate

```typescript
interface RiskMetrics {
  volatility: number;
  sharpeRatio: number;
  sortinoRatio: number;
  maxDrawdown: number;
  valueAtRisk: number;
  conditionalVaR: number;
  beta: number;
  alpha: number;
  informationRatio: number;
  trackingError: number;
}
```

### Constraints Handling

Always respect these constraint types:
1. **Budget constraint**: Σ weights = 1
2. **Long-only**: wi ≥ 0 (if applicable)
3. **Position limits**: min ≤ wi ≤ max
4. **Sector/asset class caps**: Σ wi (in sector) ≤ cap
5. **Cardinality constraint**: max number of assets
6. **Turnover constraint**: limit changes from current portfolio

## Best Practices

### Numerical Stability

- Use annualized returns and volatility
- Handle singular covariance matrices (add small regularization)
- Clip weights to avoid numerical issues
- Validate optimization results

### Performance Considerations

- Cache covariance matrix calculations
- Use vectorized operations for returns calculation
- Implement efficient frontier caching
- Parallelize Monte Carlo simulations

### Validation Checks

After optimization, always verify:
1. Weights sum to 1 (within tolerance)
2. All constraints are satisfied
3. Results are within reasonable bounds
4. No extreme concentration (unless intended)
5. Diversification metrics are acceptable

## Example Usage

```typescript
// Optimize for maximum Sharpe ratio
const result = optimizePortfolio({
  expectedReturns: annualizedReturns,
  covarianceMatrix: covMatrix,
  riskFreeRate: 0.04,
  constraints: {
    minWeight: 0.02,
    maxWeight: 0.25,
    maxAssets: 5,
    sectorCaps: { 'Equity': 0.60, 'Fixed Income': 0.40 }
  },
  objective: 'maxSharpe'
});

// Returns
{
  weights: [0.25, 0.20, 0.20, 0.15, 0.20],
  expectedReturn: 0.085,
  volatility: 0.12,
  sharpeRatio: 0.375,
  assetNames: ['Asset1', 'Asset2', ...]
}
```

## Financial Theory References

- Modern Portfolio Theory (Markowitz, 1952)
- Capital Asset Pricing Model (Sharpe, 1964)
- Black-Litterman Model (for incorporating views)
- Risk Parity (equal risk contribution)
- Factor-based optimization

## Output Requirements

When providing optimization results, always include:
1. Optimal weights for each asset
2. Expected portfolio return (annualized)
3. Expected portfolio volatility (annualized)
4. Sharpe ratio
5. Key risk metrics
6. Constraint satisfaction status
7. Diversification metrics (Herfindahl index, effective number of bets)
