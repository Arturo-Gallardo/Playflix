# Playlix

Visual canvas for Spotify playlists — pan, zoom, search, and arrange album covers on a grid instead of a flat list.

## What it does

- Paste a **Spotify playlist URL** and load tracks as square cover tiles (mock data until the API is wired)
- **Pan and zoom** an infinite canvas; drag tiles, snap with Shift, multi-select, copy/paste
- **Save layouts** in the browser (auto-save + manual save) or export/import `.playlix.json`
- **Find tracks** on the canvas, sort selections by color / artist / title, undo/redo
- Dev mode seeds **100 sample tiles** on first visit when no saved layout exists

Layouts stay in **localStorage** on that device unless you export a file. There is no cloud account database yet.

## Stack

- [Next.js](https://nextjs.org/) 16 (App Router)
- React 19, TypeScript, Tailwind CSS 4
- Spotify Web API (planned — playlist loading is currently stubbed)

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Other scripts:

```bash
npm run build   # production build
npm run start   # run production build locally
npm run lint    # ESLint
```

## Environment variables

Spotify integration is not wired yet. When it is, create `.env.local` in the project root with your Spotify app credentials (client ID, client secret, redirect URI).

See [`Instruccions.md`](Instruccions.md) for setup notes.

## Project layout

See [`app/STRUCTURE.md`](app/STRUCTURE.md) for how `components/`, `hooks/`, and `lib/` are organized.

## Legal

- `/privacy` — privacy summary (placeholder copy until Spotify sign-in ships)
- `/terms` — terms of service

## CI

GitHub Actions runs `npm run lint` and `npm run build` on pushes and pull requests (see `.github/workflows/ci.yml`).

## Related projects

Canvas architecture is ported from [Playlistly](../Playlistly) (YouTube). Playlistly is the reference implementation; only **Playlix** is modified for this app.
