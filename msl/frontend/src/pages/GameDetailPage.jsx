import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getGames,
  getRatingsForGame,
  saveRating,
  calcOverallScore,
  updateGameStatus,
} from "../utils/storage";
import { fetchAchievements } from "../utils/api";
import RatingSlider from "../components/RatingSlider";
import TasteSpectrum from "../components/TasteSpectrum";
import StatusBadge from "../components/StatusBadge";
import { useToast } from "../context/ToastContext";

const RUN_TYPES = ["Normal", "NG+", "Rerun"];
const GAME_STATUSES = ["Nehrané", "Hrá sa", "Dohrané", "Odložené"];

const emptyForm = () => ({
  grafika: 5,
  pribeh: 5,
  hratelnost: 5,
  runType: "Normal",
  poznamka: "",
  achievements: [],
});

export default function GameDetailPage() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [game, setGame] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [form, setForm] = useState(emptyForm());
  const [activeTab, setActiveTab] = useState("rate"); // 'rate' | 'history'

  useEffect(() => {
    const games = getGames();
    const found = games.find((g) => g.id === gameId);
    if (!found) {
      navigate("/library");
      return;
    }
    setGame(found);
    setRatings(getRatingsForGame(gameId));

    // Try fetching achievements
    fetchAchievements(found.steamAppId)
      .then((data) => setAchievements(data.achievements || []))
      .catch(() => {});
  }, [gameId, navigate]);

  function handleSubmit() {
    const newRating = saveRating({
      gameId,
      grafika: form.grafika,
      pribeh: form.pribeh,
      hratelnost: form.hratelnost,
      runType: form.runType,
      poznamka: form.poznamka,
      achievements: form.achievements,
    });
    const updated = getRatingsForGame(gameId);
    setRatings(updated);
    setForm(emptyForm());
    toast("Hodnotenie bolo uložené", "success");
    setActiveTab("history");
    return newRating;
  }

  function toggleAch(apiName) {
    setForm((prev) => {
      const has = prev.achievements.includes(apiName);
      return {
        ...prev,
        achievements: has
          ? prev.achievements.filter((a) => a !== apiName)
          : [...prev.achievements, apiName],
      };
    });
  }

  if (!game) return null;

  const overallScore = calcOverallScore(ratings);
  const latestRating = ratings.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  )[0];

  return (
    <main style={s.page}>
      {/* Back */}
      <button style={s.back} onClick={() => navigate("/library")}>
        ← Späť
      </button>

      {/* Game header */}
      <div style={s.gameHeader}>
        <img src={game.headerImage} alt={game.title} style={s.banner} />
        <div style={s.gameInfo}>
          <h2 style={s.gameTitle}>{game.title}</h2>
          <div style={s.gameMeta}>
            <StatusBadge status={game.status} />
            {overallScore !== null && (
              <span style={s.overallScore}>
                {overallScore}
                <span style={s.outOf}>/10</span>
              </span>
            )}
            <span style={s.ratingCount}>{ratings.length} hodnotení</span>
          </div>
          <TasteSpectrum ratings={ratings} />
        </div>
      </div>

      {/* Tabs */}
      <div style={s.tabs}>
        {[
          ["rate", "Nové hodnotenie"],
          ["history", "História"],
        ].map(([key, label]) => (
          <button
            key={key}
            style={{ ...s.tab, ...(activeTab === key ? s.tabActive : {}) }}
            onClick={() => setActiveTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Rate Tab ── */}
      {activeTab === "rate" && (
        <div style={s.ratePanel}>
          <div style={s.sliders}>
            <RatingSlider
              label="Grafika"
              value={form.grafika}
              onChange={(v) => setForm((p) => ({ ...p, grafika: v }))}
            />
            <RatingSlider
              label="Príbeh"
              value={form.pribeh}
              onChange={(v) => setForm((p) => ({ ...p, pribeh: v }))}
            />
            <RatingSlider
              label="Hrateľnosť"
              value={form.hratelnost}
              onChange={(v) => setForm((p) => ({ ...p, hratelnost: v }))}
            />
          </div>

          <div style={s.formRow}>
            <div style={s.field}>
              <label style={s.fieldLabel}>Typ prechodu</label>
              <div style={s.runTypes}>
                {RUN_TYPES.map((rt) => (
                  <button
                    key={rt}
                    style={{
                      ...s.runBtn,
                      ...(form.runType === rt ? s.runBtnActive : {}),
                    }}
                    onClick={() => setForm((p) => ({ ...p, runType: rt }))}
                  >
                    {rt}
                  </button>
                ))}
              </div>
            </div>

            <div style={s.field}>
              <label style={s.fieldLabel}>Stav hry</label>
              <select
                style={s.select}
                value={game.status}
                onChange={(e) => {
                  updateGameStatus(game.id, e.target.value);
                  setGame({ ...game, status: e.target.value });
                }}
              >
                {GAME_STATUSES.map((st) => (
                  <option key={st}>{st}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={s.field}>
            <label style={s.fieldLabel}>Poznámky</label>
            <textarea
              style={s.textarea}
              rows={4}
              placeholder="Tvoje dojmy, tipy, spoilery…"
              value={form.poznamka}
              onChange={(e) =>
                setForm((p) => ({ ...p, poznamka: e.target.value }))
              }
            />
          </div>

          {achievements.length > 0 && (
            <div style={s.field}>
              <label style={s.fieldLabel}>
                Achievementy ({form.achievements.length}/{achievements.length})
              </label>
              <div style={s.achGrid}>
                {achievements.map((a) => {
                  const done = form.achievements.includes(a.apiName);
                  return (
                    <div
                      key={a.apiName}
                      style={{ ...s.achItem, ...(done ? s.achDone : {}) }}
                      onClick={() => toggleAch(a.apiName)}
                      title={a.description}
                    >
                      <img src={a.icon} alt={a.displayName} style={s.achIcon} />
                      <span style={s.achName}>{a.displayName}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <button style={s.saveBtn} onClick={handleSubmit}>
            Uložiť hodnotenie
          </button>
        </div>
      )}

      {/* ── History Tab ── */}
      {activeTab === "history" && (
        <div style={s.historyPanel}>
          {ratings.length === 0 ? (
            <p style={s.empty}>Zatiaľ žiadne hodnotenia. Vytvor prvé!</p>
          ) : (
            ratings
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .map((r, i) => (
                <div key={r.id} style={s.ratingCard}>
                  <div style={s.ratingCardHeader}>
                    <span style={s.ratingIndex}>#{ratings.length - i}</span>
                    <span style={s.ratingDate}>
                      {new Date(r.createdAt).toLocaleDateString("sk")}
                    </span>
                    <span style={s.runTag}>{r.runType}</span>
                    <span style={s.avgScore}>
                      {Math.round(
                        ((r.grafika + r.pribeh + r.hratelnost) / 3) * 10,
                      ) / 10}
                      /10
                    </span>
                  </div>
                  <div style={s.miniSliders}>
                    <RatingSlider label="Grafika" value={r.grafika} disabled />
                    <RatingSlider label="Príbeh" value={r.pribeh} disabled />
                    <RatingSlider
                      label="Hrateľnosť"
                      value={r.hratelnost}
                      disabled
                    />
                  </div>
                  {r.poznamka && <p style={s.ratingNote}>{r.poznamka}</p>}
                  {r.achievements?.length > 0 && (
                    <p style={s.achCount}>
                      🏆 {r.achievements.length} achievementov
                    </p>
                  )}
                </div>
              ))
          )}
        </div>
      )}
    </main>
  );
}

const s = {
  page: {
    padding: "2rem",
    maxWidth: "900px",
    margin: "0 auto",
    animation: "fadeIn 0.3s ease",
  },
  back: {
    background: "none",
    border: "none",
    color: "var(--text2)",
    fontSize: "0.85rem",
    marginBottom: "1.5rem",
    padding: 0,
  },
  gameHeader: {
    display: "grid",
    gridTemplateColumns: "2fr 3fr",
    gap: "1.5rem",
    marginBottom: "2rem",
    background: "var(--bg2)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    overflow: "hidden",
  },
  banner: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
    minHeight: "140px",
  },
  gameInfo: {
    padding: "1.25rem 1.25rem 1.25rem 0",
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  gameTitle: {
    fontFamily: "var(--font-display)",
    fontSize: "1.8rem",
    letterSpacing: "0.05em",
    lineHeight: 1.1,
  },
  gameMeta: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    flexWrap: "wrap",
  },
  overallScore: {
    fontFamily: "var(--font-display)",
    fontSize: "2rem",
    color: "var(--accent)",
    lineHeight: 1,
  },
  outOf: { fontSize: "1rem", color: "var(--text3)" },
  ratingCount: { fontSize: "0.75rem", color: "var(--text3)" },
  tabs: {
    display: "flex",
    gap: "0.25rem",
    marginBottom: "1.5rem",
    borderBottom: "1px solid var(--border)",
    paddingBottom: "0.5rem",
  },
  tab: {
    padding: "0.4rem 1.2rem",
    background: "transparent",
    border: "none",
    color: "var(--text2)",
    fontSize: "0.875rem",
    fontWeight: 500,
    borderRadius: "var(--radius)",
  },
  tabActive: { color: "var(--text)", background: "var(--bg4)" },
  ratePanel: { display: "flex", flexDirection: "column", gap: "1.5rem" },
  sliders: {
    display: "flex",
    flexDirection: "column",
    gap: "1.2rem",
    background: "var(--bg3)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    padding: "1.25rem",
  },
  formRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" },
  field: { display: "flex", flexDirection: "column", gap: "0.5rem" },
  fieldLabel: {
    fontSize: "0.75rem",
    fontWeight: 600,
    color: "var(--text3)",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  runTypes: { display: "flex", gap: "0.5rem" },
  runBtn: {
    padding: "0.4rem 1rem",
    border: "1px solid var(--border)",
    borderRadius: "4px",
    background: "transparent",
    color: "var(--text2)",
    fontSize: "0.8rem",
    fontWeight: 500,
  },
  runBtnActive: {
    background: "var(--bg4)",
    color: "var(--accent)",
    borderColor: "var(--accent)",
  },
  select: {
    padding: "0.55rem 0.75rem",
    background: "var(--bg3)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    color: "var(--text)",
    fontSize: "0.85rem",
  },
  textarea: {
    padding: "0.75rem",
    background: "var(--bg3)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    color: "var(--text)",
    fontSize: "0.875rem",
    resize: "vertical",
    outline: "none",
  },
  achGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
    gap: "0.5rem",
    maxHeight: "260px",
    overflowY: "auto",
  },
  achItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.3rem",
    padding: "0.5rem",
    background: "var(--bg3)",
    border: "1px solid var(--border)",
    borderRadius: "4px",
    cursor: "pointer",
    opacity: 0.5,
    transition: "opacity 0.15s, border-color 0.15s",
  },
  achDone: { opacity: 1, borderColor: "var(--green)" },
  achIcon: { width: 32, height: 32 },
  achName: {
    fontSize: "0.65rem",
    textAlign: "center",
    color: "var(--text2)",
    lineHeight: 1.2,
  },
  saveBtn: {
    padding: "0.8rem",
    background: "var(--accent)",
    color: "#000",
    border: "none",
    borderRadius: "var(--radius)",
    fontWeight: 700,
    fontSize: "0.9rem",
    letterSpacing: "0.05em",
    alignSelf: "flex-start",
    minWidth: "200px",
  },
  historyPanel: { display: "flex", flexDirection: "column", gap: "1rem" },
  empty: { color: "var(--text2)", padding: "2rem 0", textAlign: "center" },
  ratingCard: {
    background: "var(--bg3)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    padding: "1.25rem",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  ratingCardHeader: { display: "flex", alignItems: "center", gap: "0.75rem" },
  ratingIndex: {
    fontFamily: "var(--font-display)",
    fontSize: "1.1rem",
    color: "var(--text3)",
  },
  ratingDate: { fontSize: "0.8rem", color: "var(--text2)", flex: 1 },
  runTag: {
    fontSize: "0.7rem",
    fontWeight: 600,
    padding: "0.15rem 0.5rem",
    background: "var(--bg4)",
    border: "1px solid var(--border)",
    borderRadius: "3px",
    color: "var(--text2)",
  },
  avgScore: {
    fontFamily: "var(--font-display)",
    fontSize: "1.3rem",
    color: "var(--accent)",
  },
  miniSliders: { display: "flex", flexDirection: "column", gap: "0.8rem" },
  ratingNote: {
    fontSize: "0.85rem",
    color: "var(--text2)",
    background: "var(--bg4)",
    borderRadius: "4px",
    padding: "0.75rem",
    lineHeight: 1.6,
  },
  achCount: { fontSize: "0.8rem", color: "var(--green)" },
};
