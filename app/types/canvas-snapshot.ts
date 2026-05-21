import type { PlaylistCoverWire } from "./playlist";

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

export type CanvasSnapshotWireV1 = {
  version: 1;
  savedAt: number;
  covers: PlaylistCoverWire[];
  tiles: CanvasTileLayoutWire[];
  movedTileIds: string[];
  camera: CanvasCameraWire;
  playlistSource: string | null;
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
