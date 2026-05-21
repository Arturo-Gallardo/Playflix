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

export type TileOrderCriterion = "color" | "artist" | "date";

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

    return leftTile.cover.title.localeCompare(rightTile.cover.title, undefined, {
      sensitivity: "base",
    });
  });
}

export function sortTilesByDate(tiles: CanvasTile[]) {
  return [...tiles].sort((leftTile, rightTile) =>
    leftTile.cover.title.localeCompare(rightTile.cover.title, undefined, {
      sensitivity: "base",
    }),
  );
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

      return leftEntry.tile.cover.title.localeCompare(
        rightEntry.tile.cover.title,
        undefined,
        { sensitivity: "base" },
      );
    })
    .map((entry) => entry.tile);
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

function normalizeArtist(artist: string | null) {
  return artist?.trim().toLocaleLowerCase() ?? "\uffff";
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

export function getTileOrderCriterionLabel(criterion: TileOrderCriterion) {
  if (criterion === "color") {
    return "color";
  }

  if (criterion === "artist") {
    return "artist";
  }

  return "title";
}
