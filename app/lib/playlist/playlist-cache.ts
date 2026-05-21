export const playlistCoverCacheKeyPrefix = "playlix:playlist-covers:";

export function getPlaylistCoverCacheKey(playlist: string) {
  return `${playlistCoverCacheKeyPrefix}${playlist.trim()}`;
}

export function clearAllPlaylistCoverCache() {
  if (typeof window === "undefined") {
    return 0;
  }

  let clearedCount = 0;

  for (let index = window.localStorage.length - 1; index >= 0; index -= 1) {
    const key = window.localStorage.key(index);

    if (key?.startsWith(playlistCoverCacheKeyPrefix)) {
      window.localStorage.removeItem(key);
      clearedCount += 1;
    }
  }

  return clearedCount;
}
