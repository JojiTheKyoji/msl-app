import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

export default function TasteSpectrum({ ratings }) {
  if (!ratings || ratings.length === 0) return null;

  const avg = (key) =>
    Math.round(ratings.reduce((s, r) => s + (r[key] || 0), 0) / ratings.length * 10) / 10;

  const data = [
    { metric: 'Grafika', value: avg('grafika') },
    { metric: 'Príbeh', value: avg('pribeh') },
    { metric: 'Hrateľnosť', value: avg('hratelnost') },
  ];

  return (
    <div style={s.wrap}>
      <p style={s.title}>Taste Spectrum</p>
      <ResponsiveContainer width="100%" height={180}>
        <RadarChart data={data}>
          <PolarGrid stroke="#1e2f45" />
          <PolarAngleAxis dataKey="metric" tick={{ fill: '#7a9ab8', fontSize: 11 }} />
          <Radar dataKey="value" stroke="#4fc3f7" fill="#4fc3f7" fillOpacity={0.25} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

const s = {
  wrap: { background: 'var(--bg3)', borderRadius: 'var(--radius)', padding: '1rem' },
  title: { fontSize: '0.7rem', fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' },
};
