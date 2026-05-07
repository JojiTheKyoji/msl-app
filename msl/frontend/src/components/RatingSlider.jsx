export default function RatingSlider({ label, value, onChange, disabled = false }) {
  const color = value >= 7 ? 'var(--green)' : value >= 4 ? 'var(--orange)' : 'var(--red)';

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <span style={s.label}>{label}</span>
        <span style={{ ...s.val, color }}>{value}</span>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange && onChange(Number(e.target.value))}
        style={{ ...s.range, accentColor: color, opacity: disabled ? 0.5 : 1 }}
      />
      <div style={s.scale}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
          <span key={n} style={{ ...s.tick, opacity: n === value ? 1 : 0.3 }}>{n}</span>
        ))}
      </div>
    </div>
  );
}

const s = {
  wrap: { display: 'flex', flexDirection: 'column', gap: '0.3rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' },
  label: { fontSize: '0.8rem', fontWeight: 500, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.08em' },
  val: { fontFamily: 'var(--font-display)', fontSize: '1.4rem' },
  range: { width: '100%', height: '4px', cursor: 'pointer' },
  scale: { display: 'flex', justifyContent: 'space-between' },
  tick: { fontSize: '0.65rem', color: 'var(--text3)' },
};
