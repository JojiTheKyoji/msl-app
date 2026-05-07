const BASE = import.meta.env.VITE_API_URL || '/api';

export async function fetchLibrary(url) {
  const res = await fetch(`${BASE}/steam/library?url=${encodeURIComponent(url)}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Nepodarilo sa načítať knižnicu.');
  return data;
}

export async function fetchAchievements(appId) {
  const res = await fetch(`${BASE}/steam/achievements?appId=${appId}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Nepodarilo sa načítať achievementy.');
  return data;
}
