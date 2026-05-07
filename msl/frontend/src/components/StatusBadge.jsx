const STATUS_COLORS = {
  'Nehrané':  { bg: '#1a1f2d', color: '#7a9ab8', border: '#1e2f45' },
  'Hrá sa':   { bg: '#0d2318', color: '#4caf50', border: '#2e5c36' },
  'Dohrané':  { bg: '#0d1a2d', color: '#4fc3f7', border: '#1e3a5f' },
  'Odložené': { bg: '#2d1f0d', color: '#ff9800', border: '#5c3e1e' },
};

export default function StatusBadge({ status }) {
  const c = STATUS_COLORS[status] || STATUS_COLORS['Nehrané'];
  return (
    <span style={{
      display: 'inline-block',
      padding: '0.15rem 0.55rem',
      borderRadius: '3px',
      fontSize: '0.7rem',
      fontWeight: 600,
      letterSpacing: '0.05em',
      background: c.bg,
      color: c.color,
      border: `1px solid ${c.border}`,
    }}>
      {status}
    </span>
  );
}
