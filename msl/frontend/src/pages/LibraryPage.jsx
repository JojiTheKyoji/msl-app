import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGames, updateGameStatus, removeGame, getRatingsForGame, calcOverallScore } from '../utils/storage';
import StatusBadge from '../components/StatusBadge';
import { useToast } from '../context/ToastContext';

const STATUSES = ['Nehrané', 'Hrá sa', 'Dohrané', 'Odložené'];

export default function LibraryPage() {
  const [games, setGames] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    setGames(getGames());
  }, []);

  function handleStatusChange(gameId, status) {
    updateGameStatus(gameId, status);
    setGames(getGames());
  }

  function handleRemove(gameId) {
    removeGame(gameId);
    setGames(getGames());
    toast('Hra bola odstránená', 'info');
  }

  const filtered = games.filter((g) => {
    const matchSearch = g.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || g.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <main style={s.page}>
      <div style={s.header}>
        <h2 style={s.heading}>Môj Zoznam</h2>
        <span style={s.count}>{games.length} hier</span>
      </div>

      {games.length === 0 ? (
        <div style={s.empty}>
          <p>Zoznam je prázdny.</p>
          <button style={s.btn} onClick={() => navigate('/')}>Importovať hry →</button>
        </div>
      ) : (
        <>
          <div style={s.toolbar}>
            <input
              style={s.input}
              placeholder="Hľadať…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div style={s.tabs}>
              <button
                style={{ ...s.tab, ...(filterStatus === '' ? s.tabActive : {}) }}
                onClick={() => setFilterStatus('')}
              >Všetky</button>
              {STATUSES.map((st) => (
                <button
                  key={st}
                  style={{ ...s.tab, ...(filterStatus === st ? s.tabActive : {}) }}
                  onClick={() => setFilterStatus(st)}
                >{st}</button>
              ))}
            </div>
          </div>

          {filtered.length === 0 && (
            <p style={{ color: 'var(--text2)', padding: '2rem 0' }}>Žiadne výsledky.</p>
          )}

          <div style={s.list}>
            {filtered.map((game) => {
              const ratings = getRatingsForGame(game.id);
              const score = calcOverallScore(ratings);
              return (
                <div key={game.id} style={s.row}>
                  <img
                    src={game.headerImage}
                    alt={game.title}
                    style={s.rowImg}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  <div style={s.rowInfo}>
                    <span style={s.rowTitle}>{game.title}</span>
                    <div style={s.rowMeta}>
                      <StatusBadge status={game.status} />
                      {score !== null && (
                        <span style={s.score}>{score} / 10</span>
                      )}
                      {ratings.length > 0 && (
                        <span style={s.ratingCount}>{ratings.length} hodnotení</span>
                      )}
                    </div>
                  </div>
                  <div style={s.rowActions}>
                    <select
                      style={s.select}
                      value={game.status}
                      onChange={(e) => handleStatusChange(game.id, e.target.value)}
                    >
                      {STATUSES.map((st) => <option key={st}>{st}</option>)}
                    </select>
                    <button style={s.rateBtn} onClick={() => navigate(`/game/${game.id}`)}>
                      Hodnotiť
                    </button>
                    <button style={s.deleteBtn} onClick={() => handleRemove(game.id)} title="Odstrániť">✕</button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </main>
  );
}

const s = {
  page: { padding: '2rem', maxWidth: '1100px', margin: '0 auto', animation: 'fadeIn 0.3s ease' },
  header: { display: 'flex', alignItems: 'baseline', gap: '1rem', marginBottom: '1.5rem' },
  heading: { fontFamily: 'var(--font-display)', fontSize: '2.2rem', letterSpacing: '0.08em' },
  count: { color: 'var(--text3)', fontSize: '0.85rem' },
  empty: { textAlign: 'center', padding: '4rem 0', color: 'var(--text2)', display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' },
  btn: { padding: '0.65rem 1.5rem', background: 'var(--accent)', color: '#000', border: 'none', borderRadius: 'var(--radius)', fontWeight: 700, fontSize: '0.875rem' },
  toolbar: { display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' },
  input: { padding: '0.55rem 0.9rem', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text)', fontSize: '0.875rem', outline: 'none', width: '220px' },
  tabs: { display: 'flex', gap: '0.25rem', flexWrap: 'wrap' },
  tab: { padding: '0.4rem 0.85rem', background: 'transparent', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text2)', fontSize: '0.75rem', fontWeight: 500 },
  tabActive: { background: 'var(--bg4)', color: 'var(--text)', borderColor: 'var(--accent)' },
  list: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  row: { display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.75rem 1rem', transition: 'border-color 0.15s' },
  rowImg: { width: 80, height: 37, objectFit: 'cover', borderRadius: '3px', flexShrink: 0 },
  rowInfo: { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.3rem' },
  rowTitle: { fontSize: '0.9rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  rowMeta: { display: 'flex', gap: '0.6rem', alignItems: 'center' },
  score: { fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--accent)' },
  ratingCount: { fontSize: '0.7rem', color: 'var(--text3)' },
  rowActions: { display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 },
  select: { padding: '0.35rem 0.6rem', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text)', fontSize: '0.75rem' },
  rateBtn: { padding: '0.35rem 0.85rem', background: 'transparent', border: '1px solid var(--accent)', color: 'var(--accent)', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 },
  deleteBtn: { padding: '0.35rem 0.6rem', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text3)', borderRadius: '4px', fontSize: '0.75rem' },
};
