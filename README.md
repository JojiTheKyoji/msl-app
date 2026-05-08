# MSL – My Steam List

Webová aplikácia na evidenciu hier, import knižnice zo Steam a uchovávanie osobných hodnotení.

---

## Štruktúra

```
msl/
├── backend/      Express.js API
└── frontend/     React + Vite SPA
```

---

## Spustenie

### 1. Backend

```bash
cd backend
npm install

# Vytvor .env podľa vzoru
cp .env.example .env
# Nastav STEAM_API_KEY (získaš na https://steamcommunity.com/dev/apikey)

npm run dev     # nodemon – port 3001
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev     # Vite – port 5173
```

Otvor: **http://localhost:5173**

---

## Steam API kľúč

1. Prihlás sa na [https://steamcommunity.com/dev/apikey](https://steamcommunity.com/dev/apikey)
2. Zadaj názov domény (napr. `localhost`)
3. Skopíruj kľúč do `backend/.env` ako `STEAM_API_KEY=...`

---

## API endpointy (backend)

| Method | Path | Popis |
|--------|------|-------|
| GET | `/api/steam/library?url=` | Načíta knižnicu hier zo Steam profilu |
| GET | `/api/steam/achievements?appId=` | Načíta zoznam achievementov pre hru |
| GET | `/api/health` | Health check |

### Chybové odpovede

| Kód | Správa |
|-----|--------|
| 400 | Neplatný odkaz alebo SteamID |
| 403 | Profil je súkromný |
| 404 | Profil nebol nájdený |
| 502 | Nepodarilo sa načítať knižnicu |

---

## Frontend – stránky

| URL | Popis |
|-----|-------|
| `/` | Import knižnice zo Steam |
| `/library` | Osobný zoznam hier |
| `/game/:id` | Detail hry + hodnotenie |
| `/journal` | Herný denník (prehľad hodnotení) |

---

## Dáta

Všetky hodnotenia sú uložené v **LocalStorage** prehliadača. Nie je potrebná databáza ani prihlásenie.

```
localStorage:
  msl_games    – zoznam pridaných hier
  msl_ratings  – všetky hodnotenia (viacero na hru)
```
