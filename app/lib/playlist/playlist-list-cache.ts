import type { SpotifyPlaylistSummary } from "../../types/spotify-playlist";

const playlistListCacheKey = "playlix:playlist-list:v2";
const playlistListCacheTtlMs = 5 * 60 * 1000;

type PlaylistListCacheEntry = {
  playlists: SpotifyPlaylistSummary[];
  savedAt: number;
  total: number;
  hasMore: boolean;
  nextOffset: number | null;
};

export function readPlaylistListCache(): PlaylistListCacheEntry | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawValue = window.sessionStorage.getItem(playlistListCacheKey);

    if (!rawValue) {
      return null;
    }

    const parsed = JSON.parse(rawValue) as PlaylistListCacheEntry;

    if (
      !Array.isArray(parsed.playlists) ||
      typeof parsed.savedAt !== "number" ||
      typeof parsed.total !== "number" ||
      typeof parsed.hasMore !== "boolean"
    ) {
      return null;
    }

    if (Date.now() - parsed.savedAt > playlistListCacheTtlMs) {
      window.sessionStorage.removeItem(playlistListCacheKey);
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function writePlaylistListCache(entry: Omit<PlaylistListCacheEntry, "savedAt">) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const payload: PlaylistListCacheEntry = {
      ...entry,
      savedAt: Date.now(),
    };

    window.sessionStorage.setItem(playlistListCacheKey, JSON.stringify(payload));
  } catch {
    // sessionStorage may be unavailable
  }
}

export function clearPlaylistListCache() {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.removeItem(playlistListCacheKey);
  } catch {
    // sessionStorage may be unavailable
  }
}
