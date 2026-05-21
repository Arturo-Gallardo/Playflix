# App folder layout

```
app/
  components/
    canvas/        Grid, viewport, context menu, shortcuts, overlays
      overlays/    Toasts, loading, welcome
      viewport/    Pan/zoom surface + cover detail panel
    shared/        Cross-feature UI (keyboard chord, error fallback, legal)
    toolbar/       Header, playlist input, pan buttons, cover search, zoom, settings
    ui/            Primitive UI (kbd)
  data/            Sample covers for dev seeding
  hooks/
    canvas/        Tiles, camera, persistence, pointer, clipboard
    playlist/      Load playlists, cache helpers
    toolbar/       Toolbar press feedback, onboarding placements
  lib/
    canvas/        Layout, storage, import/export, ordering, selection, clipboard
    legal/         Contact email for legal pages
    playlist/      Cover wire format, cache, source helpers
  types/           Shared TypeScript types
  privacy/         Privacy page route
  terms/           Terms of service route
  error.tsx        Route-level error UI
  global-error.tsx Root layout error UI
```

When adding a feature, put files in the matching domain folder instead of the `app/` root.

Spotify-specific API routes and auth will live under `app/api/` when they are added.
