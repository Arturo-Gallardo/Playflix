import type { CanvasTile } from "./canvas-layout";
import {
  getBalancedColumnCount,
  getCanvasCellStride,
} from "./canvas-layout";
import { getTilesTopLeftAnchor } from "./tile-clipboard";
import {
  getColorHue,
  getColorLightness,
  getThumbnailColor,
} from "./thumbnail-color";

export type TileOrderCriterion =
  | "artist"
  | "color"
  | "dateAdded"
  | "dateReleased"
  | "duration"
  | "tempo"
  | "popularity";

type TilePositionUpdate = {
  id: string;
  x: number;
  y: number;
};

const colorSampleConcurrency = 6;

export function sortTilesByArtist(tiles: CanvasTile[]) {
  return [...tiles].sort((leftTile, rightTile) => {
    const leftArtist = normalizeArtist(leftTile.cover.artist);
    const rightArtist = normalizeArtist(rightTile.cover.artist);

    if (leftArtist !== rightArtist) {
      return leftArtist.localeCompare(rightArtist, undefined, {
        sensitivity: "base",
      });
    }

    return compareTitles(leftTile, rightTile);
  });
}

export function sortTilesByDateAdded(tiles: CanvasTile[]) {
  return [...tiles].sort((leftTile, rightTile) => {
    const leftAddedAt = parseSortableTimestamp(leftTile.cover.addedAt);
    const rightAddedAt = parseSortableTimestamp(rightTile.cover.addedAt);

    if (leftAddedAt !== rightAddedAt) {
      return leftAddedAt - rightAddedAt;
    }

    return compareTitles(leftTile, rightTile);
  });
}

export function sortTilesByDateReleased(tiles: CanvasTile[]) {
  return [...tiles].sort((leftTile, rightTile) => {
    const leftReleaseDate = getReleaseDateSortKey(leftTile.cover.releaseDate);
    const rightReleaseDate = getReleaseDateSortKey(rightTile.cover.releaseDate);

    if (leftReleaseDate !== rightReleaseDate) {
      return leftReleaseDate.localeCompare(rightReleaseDate);
    }

    return compareTitles(leftTile, rightTile);
  });
}

export function sortTilesByDuration(tiles: CanvasTile[]) {
  return [...tiles].sort((leftTile, rightTile) => {
    const durationComparison = compareNullableNumbers(
      leftTile.cover.durationMs,
      rightTile.cover.durationMs,
    );

    if (durationComparison !== 0) {
      return durationComparison;
    }

    return compareTitles(leftTile, rightTile);
  });
}

export function sortTilesByPopularity(tiles: CanvasTile[]) {
  return [...tiles].sort((leftTile, rightTile) => {
    const popularityComparison = compareNullableNumbers(
      leftTile.cover.popularity,
      rightTile.cover.popularity,
      false,
    );

    if (popularityComparison !== 0) {
      return popularityComparison;
    }

    return compareTitles(leftTile, rightTile);
  });
}

export async function sortTilesByColor(tiles: CanvasTile[]) {
  const tilesWithColor = await mapWithConcurrency(
    tiles,
    async (tile) => {
      const color = await getThumbnailColor(tile.cover.albumArtUrl, tile.cover.id);

      return {
        tile,
        color,
        hue: getColorHue(color),
        lightness: getColorLightness(color),
      };
    },
    colorSampleConcurrency,
  );

  return tilesWithColor
    .sort((leftEntry, rightEntry) => {
      if (leftEntry.hue !== rightEntry.hue) {
        return leftEntry.hue - rightEntry.hue;
      }

      if (leftEntry.lightness !== rightEntry.lightness) {
        return leftEntry.lightness - rightEntry.lightness;
      }

      return compareTitles(leftEntry.tile, rightEntry.tile);
    })
    .map((entry) => entry.tile);
}

export async function sortTilesByTempo(tiles: CanvasTile[]) {
  const trackIds = [
    ...new Set(tiles.map((tile) => tile.cover.id).filter(Boolean)),
  ];
  const fetchedTempos = await fetchTrackTempos(trackIds);

  return [...tiles].sort((leftTile, rightTile) => {
    const leftTempo = resolveTempo(leftTile, fetchedTempos);
    const rightTempo = resolveTempo(rightTile, fetchedTempos);
    const tempoComparison = compareNullableNumbers(leftTempo, rightTempo);

    if (tempoComparison !== 0) {
      return tempoComparison;
    }

    return compareTitles(leftTile, rightTile);
  });
}

export function buildOrderedTilePositions(
  sortedTiles: CanvasTile[],
  sourceTiles: CanvasTile[],
): TilePositionUpdate[] {
  const anchor = getTilesTopLeftAnchor(sourceTiles);
  const columnCount = getSelectionColumnCount(sourceTiles);
  const stride = getCanvasCellStride();

  return sortedTiles.map((tile, index) => ({
    id: tile.id,
    x: anchor.x + (index % columnCount) * stride.width,
    y: anchor.y + Math.floor(index / columnCount) * stride.height,
  }));
}

export function getTileOrderCriterionLabel(criterion: TileOrderCriterion) {
  const labels: Record<TileOrderCriterion, string> = {
    artist: "artist",
    color: "color",
    dateAdded: "date added",
    dateReleased: "date released",
    duration: "hours played",
    tempo: "tempo",
    popularity: "popularity",
  };

  return labels[criterion];
}

function getSelectionColumnCount(tiles: CanvasTile[]) {
  if (tiles.length <= 1) {
    return 1;
  }

  const anchor = getTilesTopLeftAnchor(tiles);
  const stride = getCanvasCellStride();
  const maxX = Math.max(...tiles.map((tile) => tile.x));
  const inferredColumns = Math.round((maxX - anchor.x) / stride.width) + 1;

  return Math.max(
    1,
    Math.min(inferredColumns, tiles.length, getBalancedColumnCount(tiles.length)),
  );
}

function compareTitles(leftTile: CanvasTile, rightTile: CanvasTile) {
  return leftTile.cover.title.localeCompare(rightTile.cover.title, undefined, {
    sensitivity: "base",
  });
}

function normalizeArtist(artist: string | null) {
  return artist?.trim().toLocaleLowerCase() ?? "\uffff";
}

function parseSortableTimestamp(value: string | null) {
  if (!value) {
    return Number.POSITIVE_INFINITY;
  }

  const parsed = Date.parse(value);

  return Number.isFinite(parsed) ? parsed : Number.POSITIVE_INFINITY;
}

function getReleaseDateSortKey(releaseDate: string | null) {
  if (!releaseDate) {
    return "\uffff";
  }

  const parts = releaseDate.split("-");
  const year = parts[0]?.padStart(4, "0") ?? "0000";
  const month = parts[1]?.padStart(2, "0") ?? "01";
  const day = parts[2]?.padStart(2, "0") ?? "01";

  return `${year}-${month}-${day}`;
}

function compareNullableNumbers(
  leftValue: number | null,
  rightValue: number | null,
  ascending = true,
) {
  const missingValue = ascending ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
  const leftNumber = leftValue ?? missingValue;
  const rightNumber = rightValue ?? missingValue;

  return leftNumber - rightNumber;
}

function resolveTempo(
  tile: CanvasTile,
  fetchedTempos: Record<string, number | null>,
) {
  return fetchedTempos[tile.cover.id] ?? tile.cover.tempo;
}

async function fetchTrackTempos(trackIds: string[]) {
  if (trackIds.length === 0) {
    return {};
  }

  const response = await fetch("/api/tracks/audio-features", {
    body: JSON.stringify({ ids: trackIds }),
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  const payload = (await response.json()) as
    | { tempos: Record<string, number | null> }
    | { error: string };

  if (!response.ok || "error" in payload) {
    throw new Error(
      "error" in payload ? payload.error : "Could not load track tempo data.",
    );
  }

  return payload.tempos;
}

async function mapWithConcurrency<TInput, TOutput>(
  items: TInput[],
  mapper: (item: TInput) => Promise<TOutput>,
  concurrency: number,
) {
  const results: TOutput[] = new Array(items.length);
  let nextIndex = 0;

  async function runWorker() {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await mapper(items[currentIndex]);
    }
  }

  const workerCount = Math.min(concurrency, items.length);
  await Promise.all(Array.from({ length: workerCount }, () => runWorker()));

  return results;
}
