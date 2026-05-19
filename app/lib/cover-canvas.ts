import type { CanvasCoverWire } from "../types/canvas-snapshot";
import type { PlaylistCover, PlaylistCoverWire } from "../data/sample-covers";

export function hydratePlaylistCover(wire: PlaylistCoverWire): PlaylistCover {
  return {
    id: wire.id,
    title: wire.title,
    url: wire.url,
  };
}

export function hydrateCanvasCover(wire: CanvasCoverWire): PlaylistCover {
  return hydratePlaylistCover(wire);
}

export function toPlaylistCoverWire(cover: PlaylistCover): PlaylistCoverWire {
  return {
    id: cover.id,
    title: cover.title,
    url: cover.url,
  };
}

export function toCanvasCoverWire(
  tileId: string,
  cover: PlaylistCover,
): CanvasCoverWire {
  return {
    tileId,
    ...toPlaylistCoverWire(cover),
  };
}
