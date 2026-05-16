import { fetchHoldings, fetchPrices, fetchBenchmark, fetchConstraints } from '@/lib/data';
import { optimizePortfolio, calculatePortfolioMetrics, calculateCurrentPortfolioMetrics } from '@/lib/optimizer';
import MetricCard from '@/components/MetricCard';
import AllocationChart from '@/components/AllocationChart';
import RecommendationTable from '@/components/RecommendationTable';
import PerformanceChart from '@/components/PerformanceChart';

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
  const currentMetrics = calculateCurrentPortfolioMetrics(assetMetrics);

  return (
    <main style={styles.main}>
      <div style={styles.container}>
        <header style={styles.header}>
          <h1 style={styles.h1}>Portfolio Recommendation</h1>
          <p style={styles.subtitle}>
            Optimized allocation for next period based on risk-adjusted returns
          </p>
        </header>

        <section style={styles.section}>
          <h2 style={styles.h2}>Current vs Recommended Portfolio</h2>
          <div style={styles.metricsGrid}>
            <MetricCard
              title="Current Portfolio Return"
              value={currentMetrics.annualized_return}
              format="percent"
            />
            <MetricCard
              title="Recommended Portfolio Return"
              value={recommendedMetrics.annualized_return}
              format="percent"
            />
            <MetricCard
              title="Current Sharpe Ratio"
              value={currentMetrics.sharpe_ratio}
              format="ratio"
            />
            <MetricCard
              title="Recommended Sharpe Ratio"
              value={recommendedMetrics.sharpe_ratio}
              format="ratio"
            />
            <MetricCard
              title="Current Volatility"
              value={currentMetrics.annualized_volatility}
              format="percent"
            />
            <MetricCard
              title="Recommended Volatility"
              value={recommendedMetrics.annualized_volatility}
              format="percent"
            />
            <MetricCard
              title="Current Max Drawdown"
              value={currentMetrics.max_drawdown}
              format="percent"
            />
            <MetricCard
              title="Recommended Max Drawdown"
              value={recommendedMetrics.max_drawdown}
              format="percent"
            />
          </div>
        </section>

        <section style={styles.section}>
          <div style={styles.chartsGrid}>
            <AllocationChart
              assets={assetMetrics}
              weightKey="current_weight"
              title="Current Allocation"
            />
            <AllocationChart
              assets={assetMetrics}
              weightKey="recommended_weight"
              title="Recommended Allocation"
            />
          </div>
        </section>

        <section style={styles.section}>
          <RecommendationTable assets={assetMetrics} />
        </section>

        <section style={styles.section}>
          <PerformanceChart assets={assetMetrics} benchmark={benchmark} />
        </section>

        <section style={styles.section}>
          <div style={styles.constraintsBox}>
            <h3 style={styles.h3}>Constraints Applied</h3>
            <div style={styles.constraintsList}>
              <div style={styles.constraintItem}>
                <span style={styles.constraintLabel}>Min Weight:</span>
                <span style={styles.constraintValue}>{(constraints.min_weight * 100).toFixed(0)}%</span>
              </div>
              <div style={styles.constraintItem}>
                <span style={styles.constraintLabel}>Max Weight:</span>
                <span style={styles.constraintValue}>{(constraints.max_weight * 100).toFixed(0)}%</span>
              </div>
              <div style={styles.constraintItem}>
                <span style={styles.constraintLabel}>Max Assets:</span>
                <span style={styles.constraintValue}>{constraints.max_assets}</span>
              </div>
              <div style={styles.constraintItem}>
                <span style={styles.constraintLabel}>Asset Class Caps:</span>
                <span style={styles.constraintValue}>
                  {Object.entries(constraints.per_asset_class_caps)
                    .map(([k, v]) => `${k}: ${(v * 100).toFixed(0)}%`)
                    .join(', ')}
                </span>
              </div>
            </div>
          </div>
        </section>

        <footer style={styles.footer}>
          <p>
            Optimization based on Sharpe ratio weighting with constraints.
            Risk-free rate: 4%. Trading days/year: 252.
          </p>
        </footer>
      </div>
    </main>
  );
}

const styles = {
  main: {
    minHeight: '100vh',
    background: '#f8fafc',
  },
  container: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '32px 24px',
  },
  header: {
    marginBottom: '32px',
  },
  h1: {
    fontSize: '32px',
    fontWeight: 700,
    color: '#1e293b',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '16px',
    color: '#64748b',
  },
  section: {
    marginBottom: '32px',
  },
  h2: {
    fontSize: '20px',
    fontWeight: 600,
    color: '#1e293b',
    marginBottom: '16px',
  },
  h3: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#1e293b',
    marginBottom: '12px',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '16px',
  },
  constraintsBox: {
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e2e8f0',
  },
  constraintsList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px',
  },
  constraintItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
  },
  constraintLabel: {
    fontSize: '12px',
    color: '#64748b',
    fontWeight: 500,
  },
  constraintValue: {
    fontSize: '14px',
    color: '#1e293b',
    fontWeight: 600,
  },
  footer: {
    marginTop: '48px',
    paddingTop: '24px',
    borderTop: '1px solid #e2e8f0',
    textAlign: 'center' as const,
    color: '#94a3b8',
    fontSize: '14px',
  },
};