import { Suspense } from 'react';
import PortfolioData from '@/components/PortfolioData';

export const dynamic = 'force-dynamic';

export default function Home() {
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

        <Suspense fallback={<MetricsRowSkeleton />}>
          <PortfolioData />
        </Suspense>
      </div>
    </main>
  );
}

function MetricsRowSkeleton() {
  return (
    <>
      <section style={styles.metricsRow}>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} style={styles.metricCard}>
            <div style={styles.labelSkeleton} />
            <div style={styles.valueSkeleton} />
            <div style={styles.sublabelSkeleton} />
          </div>
        ))}
      </section>
      <section style={styles.chartSection}>
        <div style={styles.chartTitleSkeleton} />
        <div style={styles.chartSkeleton} />
      </section>
      <section style={styles.weightSection}>
        <div style={styles.chartTitleSkeleton} />
        <div style={styles.tableSkeleton} />
      </section>
      <section style={styles.tableSection}>
        <div style={styles.chartTitleSkeleton} />
        <div style={styles.tableSkeleton} />
      </section>
      <section style={styles.bottomRow}>
        <div style={styles.textSkeleton} />
        <div style={styles.textSkeleton} />
      </section>
    </>
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
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr',
    alignItems: 'center',
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
  metricCard: {
    background: '#0f172a',
    border: '1px solid #1e293b',
    borderRadius: '8px',
    padding: '16px',
  },
  labelSkeleton: {
    width: '60%',
    height: '10px',
    background: 'linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%)',
    backgroundSize: '200% 100%',
    borderRadius: '4px',
    animation: 'shimmer 1.5s infinite',
    marginBottom: '8px',
  },
  valueSkeleton: {
    width: '50%',
    height: '24px',
    background: 'linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%)',
    backgroundSize: '200% 100%',
    borderRadius: '4px',
    animation: 'shimmer 1.5s infinite',
    marginBottom: '4px',
  },
  sublabelSkeleton: {
    width: '40%',
    height: '10px',
    background: 'linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%)',
    backgroundSize: '200% 100%',
    borderRadius: '4px',
    animation: 'shimmer 1.5s infinite',
  },
  chartSection: {
    marginBottom: '16px',
  },
  chartTitleSkeleton: {
    width: '180px',
    height: '14px',
    background: 'linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%)',
    backgroundSize: '200% 100%',
    borderRadius: '4px',
    animation: 'shimmer 1.5s infinite',
    marginBottom: '12px',
  },
  chartSkeleton: {
    width: '100%',
    height: '300px',
    background: '#0f172a',
    border: '1px solid #1e293b',
    borderRadius: '8px',
  },
  weightSection: {
    marginBottom: '16px',
  },
  tableSkeleton: {
    width: '100%',
    height: '200px',
    background: '#0f172a',
    border: '1px solid #1e293b',
    borderRadius: '8px',
  },
  tableSection: {
    marginBottom: '16px',
  },
  bottomRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  textSkeleton: {
    background: '#0f172a',
    border: '1px solid #1e293b',
    borderRadius: '8px',
    padding: '16px',
    height: '200px',
  },
};
