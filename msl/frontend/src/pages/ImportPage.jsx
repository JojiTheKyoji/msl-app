import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchLibrary } from '../utils/api';
import { saveGame } from '../utils/storage';
import { useToast } from '../context/ToastContext';

export default function ImportPage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [library, setLibrary] = useState(null);
  const [profile, setProfile] = useState(null);
  const [search, setSearch] = useState('');
  const [added, setAdded] = useState({});
  const toast = useToast();
  const navigate = useNavigate();

  async function handleImport(e) {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setLibrary(null);
    try {
      const data = await fetchLibrary(url.trim());
      setLibrary(data.games);
      setProfile(data.profile);
      toast('Profil je verejný, načítavam knižnicu', 'info');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  function handleAdd(game) {
    const ok = saveGame(game);
    if (ok) {
      setAdded((prev) => ({ ...prev, [game.steamAppId]: true }));
      toast('Hra bola pridaná do zoznamu', 'success');
    } else {
      toast('Hra už je v zozname', 'info');
    }
  }

  const filtered = library
    ? library.filter((g) => g.title.toLowerCase().includes(search.toLowerCase()))
    : [];

  return (
    <main style={s.page}>
      {/* Hero */}
      <section style={s.hero}>
        <h1 style={s.heroTitle}>MY STEAM LIST</h1>
        <p style={s.heroSub}>Importuj svoju herní knižnicu a veď si vlastný herný denník.</p>

        <form onSubmit={handleImport} style={s.form}>
          <input
            style={s.input}
            type="text"
            placeholder="Steam URL alebo SteamID64  (napr. https://steamcommunity.com/id/...)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <button style={s.btn} type="submit" disabled={loading}>
            {loading ? 'Načítavam…' : 'Importovať'}
          </button>
        </form>
      </section>

      {/* Profile info */}
      {profile && (
        <div style={s.profileBar}>
          <img src={profile.avatar} alt={profile.name} style={s.avatar} />
          <div>
            <p style={s.profileName}>{profile.name}</p>
            <p style={s.profileSub}>{library.length} hier • klikni na hru a pridaj ju do zoznamu</p>
          </div>
          <button style={{ ...s.btn, marginLeft: 'auto' }} onClick={() => navigate('/library')}>
            Prejsť do knižnice →
          </button>
        </div>
      )}

      {/* Search & Grid */}
      {library && (
        <>
          <div style={s.searchRow}>
            <input
              style={{ ...s.input, maxWidth: '360px' }}
              placeholder="Vyhľadať hru…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span style={s.count}>{filtered.length} hier</span>
          </div>

          {filtered.length === 0 && (
            <p style={s.empty}>Žiadne výsledky.</p>
          )}

          <div style={s.grid}>
            {filtered.map((game) => {
              const isAdded = added[game.steamAppId];
              return (
                <div key={game.steamAppId} style={s.card}>
                  <img
                    src={game.coverImage}
                    alt={game.title}
                    style={s.cover}
                    onError={(e) => { e.target.src = game.headerImage; }}
                  />
                  <div style={s.cardBody}>
                    <p style={s.cardTitle}>{game.title}</p>
                    {game.playtimeForever > 0 && (
                      <p style={s.cardSub}>{Math.round(game.playtimeForever / 60)} hod.</p>
                    )}
                    <button
                      style={{ ...s.cardBtn, ...(isAdded ? s.cardBtnAdded : {}) }}
                      onClick={() => handleAdd(game)}
                      disabled={isAdded}
                    >
                      {isAdded ? '✓ Pridané' : '+ Pridať'}
                    </button>
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
  page: { padding: '2rem', maxWidth: '1400px', margin: '0 auto', animation: 'fadeIn 0.3s ease' },
  hero: { textAlign: 'center', paddingBottom: '2.5rem', borderBottom: '1px solid var(--border)', marginBottom: '2rem' },
  heroTitle: { fontFamily: 'var(--font-display)', fontSize: 'clamp(3rem, 8vw, 7rem)', letterSpacing: '0.1em', color: 'var(--accent)', lineHeight: 1 },
  heroSub: { color: 'var(--text2)', marginTop: '0.75rem', marginBottom: '2rem', fontSize: '1rem' },
  form: { display: 'flex', gap: '0.75rem', maxWidth: '680px', margin: '0 auto' },
  input: {
    flex: 1, padding: '0.7rem 1rem', background: 'var(--bg3)',
    border: '1px solid var(--border)', borderRadius: 'var(--radius)',
    color: 'var(--text)', fontSize: '0.9rem', outline: 'none',
    transition: 'border-color 0.15s',
  },
  btn: {
    padding: '0.7rem 1.5rem', background: 'var(--accent)', color: '#000',
    border: 'none', borderRadius: 'var(--radius)', fontWeight: 700,
    fontSize: '0.875rem', letterSpacing: '0.05em', whiteSpace: 'nowrap',
    transition: 'opacity 0.15s',
  },
  profileBar: {
    display: 'flex', alignItems: 'center', gap: '1rem',
    background: 'var(--bg3)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', padding: '1rem 1.25rem', marginBottom: '1.5rem',
  },
  avatar: { width: 48, height: 48, borderRadius: '50%', border: '2px solid var(--accent)' },
  profileName: { fontWeight: 600, fontSize: '1rem' },
  profileSub: { color: 'var(--text2)', fontSize: '0.8rem' },
  searchRow: { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' },
  count: { color: 'var(--text3)', fontSize: '0.8rem' },
  empty: { color: 'var(--text2)', textAlign: 'center', padding: '3rem 0' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' },
  card: {
    background: 'var(--bg3)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', overflow: 'hidden',
    transition: 'border-color 0.15s, transform 0.15s',
    display: 'flex', flexDirection: 'column',
  },
  cover: { width: '100%', aspectRatio: '2/3', objectFit: 'cover', display: 'block', background: 'var(--bg4)' },
  cardBody: { padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 },
  cardTitle: { fontSize: '0.8rem', fontWeight: 600, lineHeight: 1.3 },
  cardSub: { fontSize: '0.7rem', color: 'var(--text2)' },
  cardBtn: {
    marginTop: 'auto', padding: '0.4rem', border: '1px solid var(--border)',
    borderRadius: '4px', background: 'transparent', color: 'var(--accent)',
    fontSize: '0.75rem', fontWeight: 600, transition: 'background 0.15s',
  },
  cardBtnAdded: { color: 'var(--green)', borderColor: 'var(--green)', opacity: 0.7 },
};
