import { fetchHoldings, fetchPrices, fetchBenchmark, fetchConstraints } from '@/lib/data';
import { optimizePortfolio, calculatePortfolioMetrics } from '@/lib/optimizer';
import MetricCard from '@/components/MetricCard';
import HistoricalPerformance from '@/components/HistoricalPerformance';
import WeightRecommendation from '@/components/WeightRecommendation';
import HoldingsDetail from '@/components/HoldingsDetail';
import ConstraintChecks from '@/components/ConstraintChecks';
import Methodology from '@/components/Methodology';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const [holdings, prices, benchmark, constraints] = await Promise.all([
    fetchHoldings(),
    fetchPrices(),
    fetchBenchmark(),
    fetchConstraints(),
  ]);

  const assetMetrics = optimizePortfolio(holdings, prices, benchmark, constraints);
  const recommendedMetrics = calculatePortfolioMetrics(assetMetrics);

  return (
    <main style={styles.main}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div>
            <div style={styles.logo}>ANTARCTICA</div>
            <div style={styles.logoSub}>WEALTH MANAGEMENT</div>
          </div>
          <div style={styles.headerRight}>
            <h1 style={styles.h1}>Portfolio Optimiser</h1>
            <div style={styles.subtitle}>Q1 2026 REBALANCE — 90-DAY PRICE HISTORY ANALYSIS</div>
          </div>
        </header>

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
      </div>
    </main>
  );
}

const styles = {
  main: {
    minHeight: '100vh',
    background: '#0a0f1a',
    color: '#e2e8f0',
  },
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '24px 32px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px',
    paddingBottom: '20px',
    borderBottom: '1px solid #1e293b',
  },
  logo: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#e2e8f0',
    letterSpacing: '0.1em',
  },
  logoSub: {
    fontSize: '10px',
    color: '#475569',
    letterSpacing: '0.15em',
    marginTop: '2px',
  },
  headerRight: {
    textAlign: 'center' as const,
  },
  h1: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#e2e8f0',
    margin: '0 0 4px 0',
  },
  subtitle: {
    fontSize: '11px',
    color: '#475569',
    letterSpacing: '0.05em',
  },
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