---
name: "rebalancing-advisor"
description: "Provides portfolio rebalancing recommendations, drift analysis, and execution guidance. Invoke when user asks about portfolio rebalancing, allocation drift, trade execution, or rebalancing strategy."
---

# Rebalancing Advisor

This skill provides professional portfolio rebalancing recommendations using institutional best practices for maintaining target asset allocations.

## When to Invoke

- User asks about portfolio rebalancing strategy
- User wants to analyze allocation drift from target weights
- User needs trade execution recommendations
- User asks about rebalancing frequency
- User wants to understand tax-efficient rebalancing
- User needs to implement rebalancing policy
- User asks about rebalancing costs and benefits

## Rebalancing Strategy Framework

### 1. Rebalancing Methods

```typescript
type RebalancingMethod = 'Threshold' | 'Calendar' | 'Percentage-of-Portfolio' | 'Risk-Based';

interface RebalancingPolicy {
  method: RebalancingMethod;
  threshold?: number; // percentage deviation trigger
  frequency?: 'Monthly' | 'Quarterly' | 'Semi-Annual' | 'Annual';
  toleranceBand?: number; // cushion around thresholds
  minTradeAmount?: number; // minimum trade size
  maxTradeAmount?: number; // maximum trade size
  transactionCostBudget?: number; // max cost as % of portfolio
  taxEfficiency?: boolean; // prioritize tax-efficient methods
}
```

### 2. Rebalancing Method Comparison

| Method | Description | Pros | Cons | Best For |
|--------|-------------|------|------|----------|
| Threshold | Rebalance when allocation drifts beyond X% | Efficient, responsive | Requires monitoring | Most portfolios |
| Calendar | Rebalance on fixed schedule | Predictable, simple | May rebalance unnecessarily | Small portfolios |
| Percentage-of-Portfolio | Rebalance based on absolute $ amount | Dollar-based control | Complex to implement | Large portfolios |
| Risk-Based | Rebalance based on risk contribution | Risk-focused | Computationally intensive | Risk-sensitive portfolios |

## Allocation Drift Analysis

### 1. Drift Calculation

```typescript
interface DriftAnalysis {
  assetName: string;
  currentWeight: number;
  targetWeight: number;
  drift: number; // absolute deviation
  driftPercentage: number; // percentage deviation
  driftDirection: 'Overweight' | 'Underweight' | 'OnTarget';
  currentValue: number;
  targetValue: number;
  tradeAmount: number;
  tradeDirection: 'Buy' | 'Sell' | 'Hold';
}
```

### 2. Drift Severity Classification

| Severity | Drift Range | Action |
|----------|-------------|--------|
| Normal | ±0-2% | Hold |
| Caution | ±2-5% | Monitor |
| Warning | ±5-10% | Plan rebalance |
| Critical | > ±10% | Immediate action |

### 3. Rebalancing Trigger Logic

```typescript
function shouldRebalance(driftAnalysis: DriftAnalysis[], policy: RebalancingPolicy): boolean {
  const threshold = policy.threshold || 5;
  return driftAnalysis.some(asset => Math.abs(asset.driftPercentage) >= threshold);
}

function calculateTradeAmounts(driftAnalysis: DriftAnalysis[], portfolioValue: number): Trade[] {
  return driftAnalysis
    .filter(asset => Math.abs(asset.driftPercentage) >= policy.threshold)
    .map(asset => ({
      asset: asset.assetName,
      amount: asset.tradeAmount,
      direction: asset.tradeDirection,
      reason: `Drift of ${asset.driftPercentage.toFixed(1)}% from target`
    }));
}
```

## Tax-Efficient Rebalancing

### 1. Tax-Loss Harvesting Integration

```typescript
interface TaxLot {
  assetId: string;
  purchaseDate: Date;
  costBasis: number;
  currentValue: number;
  unrealizedGain: number;
  unrealizedGainPercentage: number;
  holdingPeriod: 'ShortTerm' | 'LongTerm';
}

interface TaxOptimization {
  prioritizeTaxLots: TaxLot[];
  estimatedTaxSavings: number;
  washSaleAvoidance: boolean;
  taxLotsToSell: TaxLot[];
  taxLotsToBuy: TaxLot[];
}
```

### 2. Tax-Efficient Order

| Priority | Action | Rationale |
|----------|--------|-----------|
| 1 | Sell lots with highest unrealized losses | Tax loss harvesting |
| 2 | Sell short-term gains before long-term | Higher tax rate on short-term |
| 3 | Use new cash inflows | No tax impact |
| 4 | Sell lots with lowest unrealized gains | Minimize tax liability |
| 5 | Use dividends/interest | Reinvest without sale |

### 3. Rebalancing Locations

```typescript
interface AccountRebalancing {
  accountName: string;
  accountType: 'Taxable' | 'TaxDeferred' | 'TaxExempt';
  currentAllocation: AssetAllocation;
  targetAllocation: AssetAllocation;
  drift: number;
  recommendedAction: 'Rebalance' | 'Hold' | 'UseCash';
  trades: Trade[];
}

const rebalancingLocationPriority = [
  'TaxDeferred',  // 401(k), IRA - no tax impact
  'TaxExempt',    // Roth IRA - no tax impact
  'Taxable'       // Taxable brokerage - last resort
];
```

## Trade Execution

### 1. Trade List Generation

```typescript
interface Trade {
  id: string;
  asset: string;
  assetClass: string;
  direction: 'Buy' | 'Sell';
  amount: number; // dollar amount
  shares?: number;
  price?: number;
  reason: string;
  priority: 'High' | 'Medium' | 'Low';
  estimatedCommission?: number;
}

interface RebalancingRecommendation {
  trades: Trade[];
  totalTradeAmount: number;
  estimatedTransactionCosts: number;
  expectedAllocationAfter: AssetAllocation;
  riskMetricsAfter: RiskMetrics;
  taxImpact: TaxImpact;
  implementationNotes: string[];
}
```

### 2. Trade Execution Best Practices

| Step | Action | Purpose |
|------|--------|---------|
| 1 | Generate trade list | Identify required transactions |
| 2 | Optimize order placement | Minimize market impact |
| 3 | Consider liquidity | Trade liquid assets first |
| 4 | Bundle orders | Reduce transaction costs |
| 5 | Execute systematically | Avoid market timing |
| 6 | Verify completion | Confirm trades executed |

## Rebalancing Cost-Benefit Analysis

### 1. Cost Calculation

```typescript
interface RebalancingCosts {
  transactionCosts: number; // commissions, fees
  marketImpact: number; // price movement during execution
  taxCosts: number; // capital gains taxes
  opportunityCost: number; // missed returns during rebalancing
  totalCost: number;
}

interface RebalancingBenefits {
  riskReduction: number; // reduction in portfolio risk
  returnImprovement: number; // expected return improvement
  diversificationImprovement: number;
  alignmentWithPolicy: number;
  totalBenefit: number;
}
```

### 2. Break-Even Analysis

```typescript
interface BreakEvenAnalysis {
  requiredReturnImprovement: number;
  expectedReturnImprovement: number;
  isBeneficial: boolean;
  paybackPeriod: number; // months to recoup costs
  recommendation: 'Rebalance' | 'Hold' | 'Partial';
}
```

## Implementation Guidelines

### 1. Rebalancing Policy Template

```typescript
const defaultRebalancingPolicy: RebalancingPolicy = {
  method: 'Threshold',
  threshold: 5, // 5% deviation triggers rebalance
  toleranceBand: 1, // 1% cushion
  minTradeAmount: 100, // minimum $100 trade
  transactionCostBudget: 0.1, // max 0.1% of portfolio
  taxEfficiency: true
};
```

### 2. Monitoring Framework

```typescript
interface RebalancingMonitor {
  lastRebalancedDate: Date;
  daysSinceLastRebalance: number;
  currentDriftSummary: DriftSummary;
  nextReviewDate: Date;
  alertStatus: 'Normal' | 'Warning' | 'Critical';
  pendingTrades: Trade[];
}
```

### 3. Rebalancing Checklist

Before executing rebalancing:
- [ ] Verify current portfolio holdings
- [ ] Confirm target allocation matches IPS
- [ ] Calculate drift from target weights
- [ ] Consider tax implications
- [ ] Estimate transaction costs
- [ ] Review market conditions
- [ ] Generate trade list
- [ ] Confirm execution strategy

## Output Requirements

When providing rebalancing recommendations, always include:

1. Current vs target allocation comparison
2. Allocation drift analysis by asset class
3. Trade execution recommendations (buy/sell amounts)
4. Tax impact assessment
5. Transaction cost estimate
6. Expected portfolio characteristics after rebalancing
7. Implementation timeline
8. Risk monitoring recommendations
9. Alternative scenarios (e.g., partial rebalancing)
