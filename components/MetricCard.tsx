interface MetricCardProps {
  label: string;
  value: string;
  sublabel: string;
  variant?: 'default' | 'positive' | 'negative';
}

export default function MetricCard({ label, value, sublabel, variant = 'default' }: MetricCardProps) {
  const valueColor = variant === 'positive' ? '#22c55e' : variant === 'negative' ? '#ef4444' : '#e2e8f0';

  return (
    <div style={styles.card}>
      <div style={styles.label}>{label}</div>
      <div style={{ ...styles.value, color: valueColor }}>{value}</div>
      <div style={styles.sublabel}>{sublabel}</div>
    </div>
  );
}

const styles = {
  card: {
    background: '#0f172a',
    borderRadius: '8px',
    padding: '16px',
    border: '1px solid #1e293b',
  },
  label: {
    fontSize: '10px',
    color: '#475569',
    letterSpacing: '0.1em',
    marginBottom: '8px',
  },
  value: {
    fontSize: '24px',
    fontWeight: 700,
    lineHeight: 1,
    marginBottom: '4px',
  },
  sublabel: {
    fontSize: '11px',
    color: '#475569',
  },
};