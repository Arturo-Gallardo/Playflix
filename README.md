# Playlix

Visual canvas for Spotify playlists — load your library, pan and zoom an infinite grid of album art, rearrange tiles, and export layouts.

![Playlix logo](public/playlix-logo.png)

## What it does

Playlix turns Spotify playlists into a **spatial canvas** instead of a scrollable list. Each track is a cover tile you can move, select, and organize. Layouts auto-save in your browser; you can also export them as `.playlix.json` files to share or back up.

**Core flow**

1. **Sign in with Spotify** (read-only) — or skip this on the public demo; see [Demo account](#demo-account-public-preview).
2. **Pick a playlist** from the toolbar dropdown.
3. Tracks load in batches and appear as a **landscape grid** (~3:2 aspect ratio).
4. **Pan, zoom, drag, and multi-select** tiles. Hold **Shift** while dragging to snap to neighbors.
5. **Add more playlists** — each new one is placed in its own grid block **to the right** of the previous one, with spacing. The camera snaps to the new block as it loads.
6. **Sort** selected tiles from the canvas context menu (artist, color, date added, date released, tempo, popularity).
7. **Hover** a tile for track details (album, playlist, dates).
8. **Save / export / import** layouts from the toolbar.

There is no Playlix cloud database. Playlist data comes from Spotify on demand; your tile positions live in **localStorage** unless you export a file.

## Demo account (public preview)

The live deployment runs in **demo mode** — a single shared Spotify account (the “dummy account”) that every visitor uses. You do **not** sign in with your own Spotify on the public site.

| | Normal mode (local dev) | Demo mode (public PoC) |
|--|-------------------------|-------------------------|
| **Who’s signed in** | Each visitor’s Spotify account | One server-configured demo account |
| **Sign in button** | Required on first visit | Skipped — auto-authenticated |
| **Playlists shown** | Yours | The demo account’s playlists |
| **Sign out / Switch account** | Works | Visible but **disabled** |
| **Layout on canvas** | Still per-browser (`localStorage`) | Still per-browser |

**Why it exists:** Spotify OAuth per visitor is fine for personal use, but a public demo shouldn’t require everyone to connect their account. Demo mode keeps one read-only Spotify session on the server so anyone can try the canvas immediately.

**What visitors should know:** You’re browsing a fixed demo library, not your own. Tile arrangements you make are saved only in your browser on that device. The avatar menu shows **Demo account** when this mode is active.

**For developers:** Turn it on with `PLAYLIX_DEMO_MODE=true` and a `SPOTIFY_DEMO_REFRESH_TOKEN` in env (see [Demo mode setup](#demo-mode-setup)). Set `PLAYLIX_DEMO_MODE=false` or remove it to restore normal per-user Spotify sign-in.

## How it works (architecture)

```
Browser                         Playlix (Next.js)                    Spotify
───────                         ─────────────────                    ───────

Normal mode:
Sign in ─────────────────────► /api/auth/spotify ───────────────► OAuth
        ◄── session cookies ─── /api/auth/callback/spotify

Demo mode:
Open app ────────────────────► session uses SPOTIFY_DEMO_REFRESH_TOKEN
        (no visitor OAuth)     from server env ──────────────────► API

Pick playlist ─────────────────► /api/playlists
              ─────────────────► /api/playlists/[id]/covers (paginated)
              ◄── cover + metadata ─── Spotify Web API

Sort by tempo ─────────────────► /api/tracks/audio-features
```

| Layer | Role |
|--------|------|
| **Auth** | Spotify OAuth with httpOnly cookies (normal mode), or a server-stored demo refresh token shared by all visitors (demo mode). Sign out / switch account only apply in normal mode. |
| **Playlists** | Server routes fetch the signed-in user’s playlists and paginate track items. Missing metadata is backfilled via batch `/tracks` lookups. |
| **Canvas** | Client-side tile state, camera, selection, clipboard, undo/redo. Progressive loading continues **one grid per playlist** via `continueGrid` + block origin. |
| **Persistence** | Layout snapshot (tiles, camera, playlist sources) in `localStorage`. Optional `.playlix.json` export/import. |

### Demo mode setup

Use a **dedicated Spotify account** for the dummy user — not your personal library. Populate its playlists with content you’re okay showing publicly.

```env
PLAYLIX_DEMO_MODE=true
SPOTIFY_DEMO_REFRESH_TOKEN=...   # required — server-side session for the dummy account
SPOTIFY_DEMO_USER_ID=...         # optional — Spotify user id or URL-encoded profile JSON
SPOTIFY_DEMO_DISPLAY_NAME=Demo   # optional — label shown in the UI
SPOTIFY_DEMO_IMAGE_URL=...       # optional — avatar override
```

**One-time token setup**

1. Set `PLAYLIX_DEMO_MODE=false` (or leave demo off) and run the app locally.
2. Sign in with the **dummy** Spotify account (not your main one).
3. DevTools → **Application** → **Cookies** → `127.0.0.1` → copy `spotify_refresh_token`.
4. Paste into `SPOTIFY_DEMO_REFRESH_TOKEN` in `.env.local` / Vercel env.
5. Set `PLAYLIX_DEMO_MODE=true` and redeploy.

OAuth routes are no-ops in demo mode — visitors never go through Spotify login. If the refresh token expires or is revoked, repeat the steps above.

## Stack

- [Next.js](https://nextjs.org/) 16 (App Router)
- React 19, TypeScript, Tailwind CSS 4
- [Spotify Web API](https://developer.spotify.com/documentation/web-api) (OAuth + playlists + audio features)
- [Vercel Analytics](https://vercel.com/docs/analytics) and [Speed Insights](https://vercel.com/docs/speed-insights) on deploy

## Local development

```bash
npm install
npm run dev
```

Open **[http://127.0.0.1:3000](http://127.0.0.1:3000)** — use `127.0.0.1`, not `localhost`. Spotify redirect URIs and cookies expect the loopback host.

Other scripts:

```bash
npm run build   # production build
npm run start   # run production build locally
npm run lint    # ESLint
```

## Environment variables

Create `.env.local` in the project root:

```env
CLIENT_ID_SPOTIFY=your_client_id
CLIENT_SECRET_SPOTIFY=your_client_secret
REDIRECT_URI_SPOTIFY=http://127.0.0.1:3000/api/auth/callback/spotify
```

In the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard):

1. Create an app (or use an existing one).
2. Add redirect URI **`http://127.0.0.1:3000/api/auth/callback/spotify`** exactly.
3. Copy Client ID and Client secret into `.env.local`.

For production, add your deployed callback URL (e.g. `https://your-app.vercel.app/api/auth/callback/spotify`) to the same Spotify app.

**Public demo deploy:** include the [demo mode variables](#demo-mode-setup) in Vercel. You still need `CLIENT_ID_SPOTIFY` and `CLIENT_SECRET_SPOTIFY` — the server uses them to refresh the dummy account token.

### Health check

`GET /api/spotify/health` verifies Spotify credentials can obtain a client-credentials token.

## Keyboard shortcuts

| Action | Shortcut |
|--------|----------|
| Save layout | `Ctrl+S` |
| Clear saved layout | `Ctrl+K` |
| Undo / Redo tile moves | `Ctrl+Z` / `Ctrl+Y` |
| Snap while dragging | Hold `Shift` |

More shortcuts are listed in the bottom-right legend (toggle in Settings).

## Project layout

See [`app/STRUCTURE.md`](app/STRUCTURE.md) for how `components/`, `hooks/`, and `lib/` are organized.

## Legal

- `/privacy` — privacy summary (browser storage, Spotify sign-in, Vercel Analytics)
- `/terms` — terms of service

## CI

GitHub Actions runs `npm run lint` and `npm run build` on pushes and pull requests (`.github/workflows/ci.yml`).

## Deploying on Vercel

1. Push the repo and import the project in Vercel.
2. Set Spotify credentials **and** demo mode env vars (`PLAYLIX_DEMO_MODE`, `SPOTIFY_DEMO_REFRESH_TOKEN`, etc.).
3. Enable **Web Analytics** and **Speed Insights** in the Vercel project dashboard.
4. Add the production Spotify redirect URI to your Spotify app (needed for the one-time dummy-account token setup, even if the live site runs in demo mode).

## Related projects

Canvas architecture is ported from [Playlistly](../Playlistly) (YouTube). Playlistly is the reference implementation; only **Playlix** is modified for this app.

## Disclaimer

Playlix is not affiliated with Spotify. Spotify’s terms and policies apply to playlist data and sign-in.
