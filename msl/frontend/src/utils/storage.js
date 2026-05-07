// ─── Keys ────────────────────────────────────────────────────────────────────
const GAMES_KEY = 'msl_games';
const RATINGS_KEY = 'msl_ratings';

// ─── Games ───────────────────────────────────────────────────────────────────

export function getGames() {
  try {
    return JSON.parse(localStorage.getItem(GAMES_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveGame(game) {
  const games = getGames();
  const exists = games.find((g) => g.steamAppId === game.steamAppId);
  if (exists) return false;
  const newGame = {
    ...game,
    id: `g_${game.steamAppId}`,
    status: 'Nehrané', // Nehrané | Hrá sa | Dohrané | Odložené
    addedAt: new Date().toISOString(),
  };
  games.push(newGame);
  localStorage.setItem(GAMES_KEY, JSON.stringify(games));
  return true;
}

export function updateGameStatus(gameId, status) {
  const games = getGames();
  const idx = games.findIndex((g) => g.id === gameId);
  if (idx === -1) return false;
  games[idx].status = status;
  localStorage.setItem(GAMES_KEY, JSON.stringify(games));
  return true;
}

export function removeGame(gameId) {
  const games = getGames().filter((g) => g.id !== gameId);
  localStorage.setItem(GAMES_KEY, JSON.stringify(games));
  const ratings = getRatings().filter((r) => r.gameId !== gameId);
  localStorage.setItem(RATINGS_KEY, JSON.stringify(ratings));
}

// ─── Ratings ─────────────────────────────────────────────────────────────────

export function getRatings() {
  try {
    return JSON.parse(localStorage.getItem(RATINGS_KEY) || '[]');
  } catch {
    return [];
  }
}

export function getRatingsForGame(gameId) {
  return getRatings().filter((r) => r.gameId === gameId);
}

export function saveRating(rating) {
  const ratings = getRatings();
  const newRating = {
    ...rating,
    id: `r_${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  ratings.push(newRating);
  localStorage.setItem(RATINGS_KEY, JSON.stringify(ratings));
  return newRating;
}

export function getLatestRating(gameId) {
  const ratings = getRatingsForGame(gameId);
  if (!ratings.length) return null;
  return ratings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
}

export function calcOverallScore(ratings) {
  if (!ratings.length) return null;
  const scores = ratings.map((r) => (r.grafika + r.hratelnost + r.pribeh) / 3);
  return Math.round((scores.reduce((s, v) => s + v, 0) / scores.length) * 10) / 10;
}
