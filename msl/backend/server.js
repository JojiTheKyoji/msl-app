require("dotenv").config();
console.log("API KEY:", process.env.STEAM_API_KEY);
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { query, validationResult } = require("express-validator");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://msl-app-1.onrender.com/'
  ]
}));
app.use(express.json());

// ─── Helpers ────────────────────────────────────────────────────────────────

function extractSteamId(input) {
  if (!input) return null;
  const trimmed = input.trim();

  // Raw 64-bit SteamID
  if (/^\d{17}$/.test(trimmed)) return trimmed;

  // Vanity URL: https://steamcommunity.com/id/VANITYNAME[/]
  const vanityMatch = trimmed.match(/steamcommunity\.com\/id\/([^/?#]+)/i);
  if (vanityMatch) return { type: "vanity", value: vanityMatch[1] };

  // Profiles URL: https://steamcommunity.com/profiles/STEAMID64[/]
  const profileMatch = trimmed.match(
    /steamcommunity\.com\/profiles\/(\d{17})/i,
  );
  if (profileMatch) return profileMatch[1];

  // Short vanity string with no URL
  if (/^[a-zA-Z0-9_-]{2,32}$/.test(trimmed))
    return { type: "vanity", value: trimmed };

  return null;
}

async function resolveSteamId(input, apiKey) {
  const parsed = extractSteamId(input);
  if (!parsed) return null;

  if (typeof parsed === "string") return parsed; // Already a 64-bit ID

  if (parsed.type === "vanity") {
    try {
      const res = await axios.get(
        `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/`,
        { params: { key: apiKey, vanityurl: parsed.value }, timeout: 8000 },
      );
      if (res.data?.response?.success === 1) {
        return res.data.response.steamid;
      }
    } catch {
      return null;
    }
  }
  return null;
}

// ─── Routes ─────────────────────────────────────────────────────────────────

/**
 * GET /api/steam/library?url=<steam_url_or_id>
 * Returns the public game library for a given Steam profile.
 */
app.get(
  "/api/steam/library",
  [query("url").notEmpty().withMessage("URL alebo SteamID je povinný")],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Neplatný odkaz alebo SteamID, skúste to zadať znova.",
      });
    }

    const apiKey = process.env.STEAM_API_KEY;
    if (!apiKey) {
      return res
        .status(500)
        .json({ error: "Steam API kľúč nie je nastavený na serveri." });
    }

    const { url } = req.query;

    // 1. Resolve to 64-bit SteamID
    const steamId = await resolveSteamId(url, apiKey);
    if (!steamId) {
      return res.status(400).json({
        error: "Neplatný odkaz alebo SteamID, skúste to zadať znova.",
      });
    }

    // 2. Verify profile exists and is public
    let playerSummary;
    try {
      const summaryRes = await axios.get(
        `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/`,
        { params: { key: apiKey, steamids: steamId }, timeout: 8000 },
      );
      const players = summaryRes.data?.response?.players;
      if (!players || players.length === 0) {
        return res.status(404).json({ error: "Profil nebol nájdený." });
      }
      playerSummary = players[0];
    } catch {
      return res.status(502).json({ error: "Nepodarilo sa načítať knižnicu." });
    }

    // communityvisibilitystate: 1 = private, 3 = public
    if (playerSummary.communityvisibilitystate !== 3) {
      return res.status(403).json({ error: "Profil je súkromný." });
    }

    // 3. Fetch owned games
    try {
      const gamesRes = await axios.get(
        `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/`,
        {
          params: {
            key: apiKey,
            steamid: steamId,
            include_appinfo: true,
            include_played_free_games: true,
          },
          timeout: 12000,
        },
      );

      const games = gamesRes.data?.response?.games || [];
      if (games.length === 0) {
        return res.status(200).json({ games: [], profile: playerSummary });
      }

      const mapped = games.map((g) => ({
        steamAppId: g.appid,
        title: g.name,
        playtimeForever: g.playtime_forever,
        coverImage: `https://cdn.cloudflare.steamstatic.com/steam/apps/${g.appid}/library_600x900.jpg`,
        headerImage: `https://cdn.cloudflare.steamstatic.com/steam/apps/${g.appid}/header.jpg`,
      }));

      return res.json({
        games: mapped,
        profile: {
          steamId,
          name: playerSummary.personaname,
          avatar: playerSummary.avatarfull,
        },
      });
    } catch {
      return res.status(502).json({ error: "Nepodarilo sa načítať knižnicu." });
    }
  },
);

/**
 * GET /api/steam/achievements?appId=<id>
 * Returns achievement list for a game (schema only, no user data).
 */
app.get(
  "/api/steam/achievements",
  [query("appId").isInt({ min: 1 }).withMessage("Neplatné appId")],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: "Neplatné appId." });
    }

    const apiKey = process.env.STEAM_API_KEY;
    const { appId } = req.query;

    try {
      const achRes = await axios.get(
        `https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/`,
        { params: { key: apiKey, appid: appId }, timeout: 8000 },
      );
      const achievements =
        achRes.data?.game?.availableGameStats?.achievements || [];

      return res.json({
        achievements: achievements.map((a) => ({
          apiName: a.name,
          displayName: a.displayName,
          description: a.description || "",
          icon: a.icon,
        })),
      });
    } catch {
      return res
        .status(502)
        .json({ error: "Nepodarilo sa načítať achievementy." });
    }
  },
);

/**
 * Health check
 */
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.listen(PORT, () => {
  console.log(`MSL backend running on http://localhost:${PORT}`);
});
