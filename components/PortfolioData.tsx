import { fetchHoldings, fetchPrices, fetchBenchmark, fetchConstraints } from '@/lib/data';
import { optimizePortfolio, calculatePortfolioMetrics } from '@/lib/optimizer';
import MetricCard from '@/components/MetricCard';
import HistoricalPerformance from '@/components/HistoricalPerformance';
import WeightRecommendation from '@/components/WeightRecommendation';
import HoldingsDetail from '@/components/HoldingsDetail';
import ConstraintChecks from '@/components/ConstraintChecks';
import Methodology from '@/components/Methodology';

export default async function PortfolioData() {
  const [holdings, prices, benchmark, constraints] = await Promise.all([
    fetchHoldings(),
    fetchPrices(),
    fetchBenchmark(),
    fetchConstraints(),
  ]);

  const assetMetrics = optimizePortfolio(holdings, prices, benchmark, constraints);
  const recommendedMetrics = calculatePortfolioMetrics(assetMetrics);

  return (
    <>
      <section style={styles.metricsRow}>
        <MetricCard
          label="ACTIVE ASSETS"
          value={assetMetrics.filter(a => a.recommended_weight > 0).length.toString()}
          sublabel={`of ${assetMetrics.length} total`}
          variant="default"
        />
        <MetricCard
          label="PORTFOLIO VOLATILITY"
          value={`${(recommendedMetrics.annualized_volatility * 100).toFixed(1)}%`}
          sublabel="annualised"
          variant="default"
        />
        <MetricCard
          label="PORTFOLIO RETURN"
          value={`${(recommendedMetrics.annualized_return * 100).toFixed(1)}%`}
          sublabel="annualised"
          variant="positive"
        />
        <MetricCard
          label="MAX DRAWDOWN"
          value={`${(recommendedMetrics.max_drawdown * 100).toFixed(1)}%`}
          sublabel="peak-to-trough"
          variant="negative"
        />
        <MetricCard
          label="SHARPE RATIO"
          value={recommendedMetrics.sharpe_ratio.toFixed(2)}
          sublabel="risk-free rate 4%"
          variant="positive"
        />
      </section>

      <section style={styles.chartSection}>
        <HistoricalPerformance assets={assetMetrics} benchmark={benchmark} />
      </section>

      <section style={styles.weightSection}>
        <WeightRecommendation assets={assetMetrics} />
      </section>

      <section style={styles.tableSection}>
        <HoldingsDetail assets={assetMetrics} />
      </section>

      <section style={styles.bottomRow}>
        <ConstraintChecks assets={assetMetrics} constraints={constraints} />
        <Methodology />
      </section>
    </>
  );
}

const styles = {
  metricsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '12px',
    marginBottom: '16px',
  },
  chartSection: {
    marginBottom: '16px',
  },
  weightSection: {
    marginBottom: '16px',
  },
  tableSection: {
    marginBottom: '16px',
  },
  bottomRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
};
