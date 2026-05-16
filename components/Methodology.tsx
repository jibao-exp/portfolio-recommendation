export default function Methodology() {
  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Methodology</h3>
      <p style={styles.description}>
        Portfolio optimisation uses risk-adjusted returns, prioritising assets with higher Sharpe ratios.
        Constraints are applied to maintain diversification.
      </p>
      <ol style={styles.steps}>
        <li style={styles.step}>Compute daily log returns for each asset</li>
        <li style={styles.step}>Annualise returns and volatility (252 trading days)</li>
        <li style={styles.step}>Calculate Sharpe ratio using risk-free rate of 4%</li>
        <li style={styles.step}>Weight assets proportionally to their Sharpe ratios</li>
        <li style={styles.step}>Apply constraints: min/max weights, asset class caps, max active assets</li>
      </ol>
      <div style={styles.divider} />
      <h4 style={styles.subTitle}>Key Parameters</h4>
      <div style={styles.params}>
        <div style={styles.paramRow}>
          <span style={styles.paramLabel}>Risk-free rate</span>
          <span style={styles.paramValue}>4.0%</span>
        </div>
        <div style={styles.paramRow}>
          <span style={styles.paramLabel}>Trading days</span>
          <span style={styles.paramValue}>252</span>
        </div>
        <div style={styles.paramRow}>
          <span style={styles.paramLabel}>Lookback period</span>
          <span style={styles.paramValue}>90 days</span>
        </div>
        <div style={styles.paramRow}>
          <span style={styles.paramLabel}>Rebalance freq</span>
          <span style={styles.paramValue}>Quarterly</span>
        </div>
      </div>
      <p style={styles.note}>
        Note: Returns are historical. Past performance is not indicative of future results.
        This optimisation is a suggestion, not a directive.
      </p>
    </div>
  );
}

const styles = {
  container: {
    background: '#0f172a',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #1e293b',
  },
  title: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#e2e8f0',
    marginBottom: '8px',
  },
  description: {
    fontSize: '12px',
    color: '#64748b',
    lineHeight: 1.5,
    marginBottom: '12px',
  },
  steps: {
    margin: '0 0 16px 0',
    paddingLeft: '20px',
  },
  step: {
    fontSize: '12px',
    color: '#94a3b8',
    lineHeight: 1.8,
  },
  divider: {
    height: '1px',
    background: '#1e293b',
    margin: '16px 0',
  },
  subTitle: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#e2e8f0',
    marginBottom: '12px',
  },
  params: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
    marginBottom: '16px',
  },
  paramRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paramLabel: {
    fontSize: '12px',
    color: '#64748b',
  },
  paramValue: {
    fontSize: '12px',
    color: '#e2e8f0',
    fontFamily: 'monospace',
  },
  note: {
    fontSize: '11px',
    color: '#475569',
    lineHeight: 1.5,
    fontStyle: 'italic',
  },
};