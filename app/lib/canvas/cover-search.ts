import type { CanvasTile } from "./canvas-layout";

const maxListedMatches = 12;

export function findTilesByCoverQuery(tiles: CanvasTile[], query: string) {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return [];
  }

  return tiles
    .filter((tile) => {
      const title = tile.cover.title.toLowerCase();
      const artist = tile.cover.artist?.toLowerCase() ?? "";

      return title.includes(normalized) || artist.includes(normalized);
    })
    .sort((left, right) =>
      left.cover.title.localeCompare(right.cover.title, undefined, {
        sensitivity: "base",
      }),
    );
}

export function getListedCoverSearchMatches(matches: CanvasTile[]) {
  return {
    listed: matches.slice(0, maxListedMatches),
    overflowCount: Math.max(0, matches.length - maxListedMatches),
  };
}
