# Portfolio Recommendation

A Next.js application that analyses historical asset prices and recommends optimised portfolio weights for the next rebalancing period.

## Overview

This tool ingests daily price data for a set of assets, computes risk-adjusted performance metrics, and produces a recommended allocation that respects business-defined constraints. The output is a dashboard that compares the current portfolio against the recommended one, with supporting charts and tables.

## Optimisation Methodology

### Objective

The optimisation targets **monthly risk-adjusted returns**, measured by the **Sharpe Ratio**. Assets with higher Sharpe Ratios receive proportionally larger weights in the recommended portfolio.

### Financial Theory

The approach is grounded in **Modern Portfolio Theory (MPT)** as introduced by Harry Markowitz (1952). Specifically, it uses a **Sharpe Ratio-weighted allocation** — a simplified form of the **Tangency Portfolio** from the Capital Market Line.

Rather than solving the full mean-variance quadratic optimisation (which requires estimating the full covariance matrix and can be numerically unstable with limited data), this implementation uses a **heuristic Sharpe-weighting** approach that:

1. Ranks assets by their individual Sharpe Ratios
2. Allocates capital proportionally to each asset's contribution to total Sharpe
3. Enforces hard constraints on weights, asset class caps, and portfolio cardinality

### Mathematical Details

#### 1. Daily Simple Returns

For each asset, daily returns are computed from consecutive price observations:

```
r_t = (P_t - P_{t-1}) / P_{t-1}
```

Where `P_t` is the closing price on day `t`.

#### 2. Annualised Return

The mean daily return is scaled to an annual figure using the standard convention of 252 trading days per year:

```
μ_annual = (1/n) Σ r_i × 252
```

#### 3. Annualised Volatility

Volatility is the annualised standard deviation of daily returns, using the sample standard deviation (Bessel's correction with `n-1` denominator):

```
σ_daily = sqrt( Σ (r_i - μ_daily)² / (n - 1) )
σ_annual = σ_daily × sqrt(252)
```

The square-root-of-time rule assumes returns are independently and identically distributed (i.i.d.), a standard assumption in portfolio theory.

#### 4. Sharpe Ratio

The Sharpe Ratio measures excess return per unit of risk:

```
SR = (μ_annual - r_f) / σ_annual
```

Where `r_f = 4%` is the annualised risk-free rate. A higher Sharpe Ratio indicates better risk-adjusted performance.

#### 5. Weight Allocation

Weights are assigned proportionally to each asset's positive Sharpe Ratio:

```
w_i = max(SR_i, 0) / Σ max(SR_j, 0)
```

Only assets with positive Sharpe Ratios receive non-zero weights. Assets with negative or zero Sharpe Ratios are excluded from the portfolio.

#### 6. Constraint Enforcement

After the initial Sharpe-weighted allocation, the following constraints are applied:

| Constraint | Formula |
|---|---|
| Minimum weight | `w_i ≥ w_min` (default: 2%) |
| Maximum weight | `w_i ≤ w_max` (default: 25%) |
| Asset class cap | `Σ w_i (class=c) ≤ cap_c` (default: 30% per class) |
| Maximum assets | `|{i : w_i > 0}| ≤ N_max` (default: 5) |

#### 7. Portfolio-Level Metrics

The recommended portfolio's aggregate metrics are computed as weighted sums:

```
μ_portfolio = Σ w_i × μ_i
σ_portfolio = sqrt( Σ (w_i × σ_i)² )
SR_portfolio = (μ_portfolio - r_f) / σ_portfolio
```

Note: The volatility calculation above assumes **zero correlation** between assets for simplicity. A full implementation would use the covariance matrix: `σ_p = sqrt(w^T Σ w)`.

#### 8. Maximum Drawdown

For each asset, the maximum drawdown is the largest peak-to-trough decline:

```
MDD = max_t [ (peak_t - P_t) / peak_t ]
```

Where `peak_t = max(P_0, P_1, ..., P_t)`.

#### 9. Correlation with Benchmark

Pearson correlation coefficient between asset returns and benchmark returns:

```
ρ = Σ (r_i - μ_r)(b_i - μ_b) / sqrt( Σ (r_i - μ_r)² × Σ (b_i - μ_b)² )
```

### Why This Approach

| Aspect | Rationale |
|---|---|
| **Sharpe-weighted** | Simple, intuitive, and avoids covariance matrix estimation errors with limited data |
| **Positive Sharpe filter** | Excludes assets that underperform the risk-free rate on a risk-adjusted basis |
| **Constraint-aware** | Ensures the recommendation is actionable within business limits |
| **No optimisation solver** | Avoids numerical instability and dependency on external libraries (e.g., scipy, cvxpy) |

### Limitations and Future Improvements

1. **Covariance matrix**: The current implementation assumes zero correlation for portfolio volatility. A full mean-variance optimisation would use `σ_p = sqrt(w^T Σ w)` where `Σ` is the asset return covariance matrix.

2. **Transaction costs**: The recommendation does not account for trading costs when moving from current to recommended weights.

3. **Lookback period**: The analysis uses all available historical data. A rolling window (e.g., 90-day) could better capture recent market conditions.

4. **Black-Litterman model**: Could incorporate investor views on expected returns rather than relying solely on historical means.

5. **Resampling / bootstrap**: Could assess the stability of the recommended weights through Monte Carlo resampling of returns.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Charts**: Recharts
- **Testing**: Jest + React Testing Library
- **CI/CD**: GitHub Actions → Vercel

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

### Testing

```bash
npm test
npm run test:watch
```

## Data Sources

All data is fetched from public S3 endpoints:

| File | URL |
|---|---|
| Holdings | `.../holdings.json` |
| Prices | `.../prices.json` |
| Benchmark | `.../benchmark.json` |
| Constraints | `.../constraints.json` |

## Project Structure

```
├── app/
│   └── page.tsx              # Main dashboard page
├── components/
│   ├── MetricCard.tsx        # KPI metric display
│   ├── HistoricalPerformance.tsx  # Line chart
│   ├── WeightRecommendation.tsx   # Bar chart
│   ├── HoldingsDetail.tsx    # Asset detail table
│   ├── ConstraintChecks.tsx  # Constraint progress bars
│   └── Methodology.tsx       # Methodology documentation
├── lib/
│   ├── types.ts              # TypeScript interfaces
│   ├── data.ts               # Data fetching
│   └── optimizer.ts          # Portfolio optimisation logic
└── styles/                   # CSS files
```

## Deployment

The project is configured for automatic deployment via GitHub Actions to Vercel. Every push to `main` triggers a build and deployment.

## License

This project was created for the Antarctica Wealth Management take-home assessment.
