import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGames, getRatings, getLatestRating, calcOverallScore, getRatingsForGame } from '../utils/storage';
import StatusBadge from '../components/StatusBadge';
import TasteSpectrum from '../components/TasteSpectrum';
import RatingSlider from '../components/RatingSlider';

export default function JournalPage() {
  const [games, setGames] = useState([]);
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const gs = getGames();
    const rated = gs.filter((g) => getRatingsForGame(g.id).length > 0);
    setGames(rated);
    if (rated.length > 0) setSelected(rated[0]);
  }, []);

  if (games.length === 0) {
    return (
      <main style={s.page}>
        <h2 style={s.heading}>Herný Denník</h2>
        <div style={s.empty}>
          <p>Zatiaľ nemáš žiadne zápisy.</p>
          <button style={s.btn} onClick={() => navigate('/library')}>Hodnotiť hry →</button>
        </div>
      </main>
    );
  }

  const selRatings = selected ? getRatingsForGame(selected.id) : [];
  const latest = selRatings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

  return (
    <main style={s.page}>
      <h2 style={s.heading}>Herný Denník</h2>
      <div style={s.layout}>
        {/* List */}
        <div style={s.list}>
          {games.map((g) => {
            const ratings = getRatingsForGame(g.id);
            const score = calcOverallScore(ratings);
            const lat = getLatestRating(g.id);
            const isSelected = selected?.id === g.id;
            return (
              <div
                key={g.id}
                style={{ ...s.listItem, ...(isSelected ? s.listItemActive : {}) }}
                onMouseEnter={() => setSelected(g)}
                onClick={() => setSelected(g)}
              >
                <img
                  src={g.headerImage}
                  alt={g.title}
                  style={s.listImg}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <div style={s.listInfo}>
                  <p style={s.listTitle}>{g.title}</p>
                  <div style={s.listMeta}>
                    <StatusBadge status={lat?.status || g.status} />
                    {score !== null && <span style={s.listScore}>{score}/10</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detail panel */}
        {selected && (
          <div style={s.detail}>
            <img src={selected.headerImage} alt={selected.title} style={s.detailBanner} />
            <div style={s.detailBody}>
              <h3 style={s.detailTitle}>{selected.title}</h3>
              <div style={s.detailMeta}>
                <StatusBadge status={latest?.status || selected.status} />
                {calcOverallScore(selRatings) !== null && (
                  <span style={s.detailScore}>
                    {calcOverallScore(selRatings)}<span style={{ fontSize: '0.9rem', color: 'var(--text3)' }}>/10</span>
                  </span>
                )}
                <span style={s.ratingCount}>{selRatings.length} hodnotení</span>
              </div>

              {latest && (
                <>
                  <div style={s.sliders}>
                    <RatingSlider label="Grafika" value={latest.grafika} disabled />
                    <RatingSlider label="Príbeh" value={latest.pribeh} disabled />
                    <RatingSlider label="Hrateľnosť" value={latest.hratelnost} disabled />
                  </div>
                  {latest.poznamka && (
                    <p style={s.note}>{latest.poznamka}</p>
                  )}
                  {latest.achievements?.length > 0 && (
                    <p style={s.achCount}>🏆 {latest.achievements.length} achievementov</p>
                  )}
                </>
              )}

              <TasteSpectrum ratings={selRatings} />

              <button style={s.detailBtn} onClick={() => navigate(`/game/${selected.id}`)}>
                Pridať hodnotenie →
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

const s = {
  page: { padding: '2rem', maxWidth: '1200px', margin: '0 auto', animation: 'fadeIn 0.3s ease' },
  heading: { fontFamily: 'var(--font-display)', fontSize: '2.2rem', letterSpacing: '0.08em', marginBottom: '1.5rem' },
  empty: { textAlign: 'center', padding: '4rem 0', color: 'var(--text2)', display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' },
  btn: { padding: '0.65rem 1.5rem', background: 'var(--accent)', color: '#000', border: 'none', borderRadius: 'var(--radius)', fontWeight: 700, fontSize: '0.875rem' },
  layout: { display: 'grid', gridTemplateColumns: '340px 1fr', gap: '1.5rem', alignItems: 'start' },
  list: { display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: 'calc(100vh - 180px)', overflowY: 'auto' },
  listItem: { display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius)', border: '1px solid transparent', cursor: 'pointer', transition: 'background 0.12s, border-color 0.12s' },
  listItemActive: { background: 'var(--bg3)', borderColor: 'var(--accent)' },
  listImg: { width: 64, height: 30, objectFit: 'cover', borderRadius: '3px', flexShrink: 0 },
  listInfo: { flex: 1, minWidth: 0 },
  listTitle: { fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  listMeta: { display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.2rem' },
  listScore: { fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: 'var(--accent)' },
  detail: { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', position: 'sticky', top: '72px' },
  detailBanner: { width: '100%', height: '160px', objectFit: 'cover', display: 'block' },
  detailBody: { padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' },
  detailTitle: { fontFamily: 'var(--font-display)', fontSize: '1.8rem', letterSpacing: '0.05em', lineHeight: 1.1 },
  detailMeta: { display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' },
  detailScore: { fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--accent)', lineHeight: 1 },
  ratingCount: { fontSize: '0.75rem', color: 'var(--text3)' },
  sliders: { display: 'flex', flexDirection: 'column', gap: '0.9rem' },
  note: { fontSize: '0.85rem', color: 'var(--text2)', background: 'var(--bg3)', borderRadius: '4px', padding: '0.75rem', lineHeight: 1.6 },
  achCount: { fontSize: '0.8rem', color: 'var(--green)' },
  detailBtn: { padding: '0.65rem 1.25rem', background: 'transparent', border: '1px solid var(--accent)', color: 'var(--accent)', borderRadius: 'var(--radius)', fontWeight: 600, fontSize: '0.85rem', alignSelf: 'flex-start' },
};
