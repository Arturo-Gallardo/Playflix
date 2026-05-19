import type { PlaylistCoverWire } from "../data/sample-covers";

export type CanvasCameraWire = {
  x: number;
  y: number;
  zoom: number;
};

export type CanvasTileLayoutWire = {
  id: string;
  x: number;
  y: number;
};

export type CanvasCoverWire = PlaylistCoverWire & {
  tileId: string;
};

export type CanvasSnapshotWire = {
  version: 2;
  savedAt: number;
  covers: CanvasCoverWire[];
  tiles: CanvasTileLayoutWire[];
  movedTileIds: string[];
  camera: CanvasCameraWire;
  playlistSources: string[];
};
