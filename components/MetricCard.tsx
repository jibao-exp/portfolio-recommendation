interface MetricCardProps {
  title: string;
  value: number;
  format?: 'percent' | 'ratio' | 'decimal';
  prefix?: string;
}

export default function MetricCard({ title, value, format = 'percent', prefix }: MetricCardProps) {
  const displayValue = () => {
    if (prefix) return `${prefix}${value.toFixed(2)}`;
    switch (format) {
      case 'percent':
        return `${(value * 100).toFixed(2)}%`;
      case 'ratio':
        return value.toFixed(2);
      case 'decimal':
        return value.toFixed(4);
      default:
        return value.toFixed(2);
    }
  };

  return (
    <div style={styles.card}>
      <div style={styles.title}>{title}</div>
      <div style={styles.value}>{displayValue()}</div>
    </div>
  );
}

const styles = {
  card: {
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e2e8f0',
  },
  title: {
    fontSize: '14px',
    color: '#64748b',
    marginBottom: '8px',
    fontWeight: 500,
  },
  value: {
    fontSize: '28px',
    fontWeight: 700,
    color: '#1e293b',
  },
};