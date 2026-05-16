export interface Holding {
  isin: string;
  name: string;
  asset_class: string;
  currency: string;
  weight: number;
}

export interface PricePoint {
  date: string;
  isin: string;
  price: number;
}

export interface BenchmarkPoint {
  date: string;
  level: number;
}

export interface Constraints {
  min_weight: number;
  max_weight: number;
  per_asset_class_caps: Record<string, number>;
  max_assets: number;
}

export interface AssetMetrics {
  isin: string;
  name: string;
  asset_class: string;
  currency: string;
  current_weight: number;
  recommended_weight: number;
  annualized_return: number;
  annualized_volatility: number;
  sharpe_ratio: number;
  max_drawdown: number;
  correlation_with_benchmark: number;
  price_history: { date: string; price: number }[];
}

export interface PortfolioMetrics {
  annualized_return: number;
  annualized_volatility: number;
  sharpe_ratio: number;
  max_drawdown: number;
  total_return: number;
}