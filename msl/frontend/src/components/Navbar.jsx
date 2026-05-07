import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Import' },
  { to: '/library', label: 'Knižnica' },
  { to: '/journal', label: 'Denník' },
];

export default function Navbar() {
  return (
    <nav style={s.nav}>
      <span style={s.logo}>MSL</span>
      <div style={s.links}>
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === '/'}
            style={({ isActive }) => ({ ...s.link, ...(isActive ? s.active : {}) })}
          >
            {l.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

const s = {
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem',
    padding: '0 2rem',
    height: '56px',
    background: 'var(--bg2)',
    borderBottom: '1px solid var(--border)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  logo: {
    fontFamily: 'var(--font-display)',
    fontSize: '1.6rem',
    letterSpacing: '0.1em',
    color: 'var(--accent)',
  },
  links: { display: 'flex', gap: '0.25rem' },
  link: {
    padding: '0.35rem 1rem',
    borderRadius: 'var(--radius)',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: 'var(--text2)',
    transition: 'color 0.15s, background 0.15s',
  },
  active: {
    color: 'var(--text)',
    background: 'var(--bg4)',
  },
};
