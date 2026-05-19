import type { CanvasTile } from "./canvas-layout";
import type {
  CanvasCameraWire,
  CanvasSnapshotWire,
  CanvasTileLayoutWire,
  CanvasCoverWire,
} from "../types/canvas-snapshot";

export const canvasLayoutStorageKey = "playflix:canvas-layout";

export function buildCanvasSnapshot({
  covers,
  tiles,
  movedTileIds,
  camera,
  playlistSources,
}: {
  covers: CanvasCoverWire[];
  tiles: CanvasTile[];
  movedTileIds: ReadonlySet<string>;
  camera: CanvasCameraWire;
  playlistSources: string[];
}): CanvasSnapshotWire {
  return {
    version: 2,
    savedAt: Date.now(),
    covers,
    tiles: tiles.map(toCanvasTileLayoutWire),
    movedTileIds: [...movedTileIds],
    camera,
    playlistSources,
  };
}

export function readCanvasSnapshot(): CanvasSnapshotWire | null {
  try {
    const storedValue = window.localStorage.getItem(canvasLayoutStorageKey);

    if (!storedValue) {
      return null;
    }

    const parsedValue: unknown = JSON.parse(storedValue);

    if (isCanvasSnapshotWire(parsedValue)) {
      return parsedValue;
    }

    return null;
  } catch {
    return null;
  }
}

export function clearCanvasSnapshot() {
  try {
    window.localStorage.removeItem(canvasLayoutStorageKey);
  } catch {
    // storage can be disabled in private browsing
  }
}

export function writeCanvasSnapshot(snapshot: CanvasSnapshotWire): boolean {
  if (snapshot.covers.length === 0) {
    return false;
  }

  try {
    window.localStorage.setItem(
      canvasLayoutStorageKey,
      JSON.stringify(snapshot),
    );
    return true;
  } catch {
    return false;
  }
}

function toCanvasTileLayoutWire(tile: CanvasTile): CanvasTileLayoutWire {
  return {
    id: tile.id,
    x: tile.x,
    y: tile.y,
  };
}

function isCanvasSnapshotWire(value: unknown): value is CanvasSnapshotWire {
  return (
    isRecord(value) &&
    value.version === 2 &&
    typeof value.savedAt === "number" &&
    Array.isArray(value.covers) &&
    value.covers.every(isCanvasCoverWire) &&
    Array.isArray(value.tiles) &&
    value.tiles.every(isCanvasTileLayoutWire) &&
    Array.isArray(value.movedTileIds) &&
    value.movedTileIds.every((tileId) => typeof tileId === "string") &&
    isCanvasCameraWire(value.camera) &&
    Array.isArray(value.playlistSources) &&
    value.playlistSources.every((source) => typeof source === "string")
  );
}

function isCanvasTileLayoutWire(
  value: unknown,
): value is CanvasTileLayoutWire {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.x === "number" &&
    typeof value.y === "number"
  );
}

function isCanvasCameraWire(value: unknown): value is CanvasCameraWire {
  return (
    isRecord(value) &&
    typeof value.x === "number" &&
    typeof value.y === "number" &&
    typeof value.zoom === "number"
  );
}

function isCanvasCoverWire(value: unknown): value is CanvasCoverWire {
  return (
    isRecord(value) &&
    typeof value.tileId === "string" &&
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.url === "string"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
