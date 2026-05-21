import type { CanvasCoverWire } from "../../types/canvas-snapshot";
import type { PlaylistCover, PlaylistCoverWire } from "../../types/playlist";

export function hydratePlaylistCover(wire: PlaylistCoverWire): PlaylistCover {
  return {
    id: wire.id,
    title: wire.title,
    url: wire.url,
    artist: wire.artist,
    albumArtUrl: wire.albumArtUrl,
  };
}

export function hydrateCanvasCover(wire: CanvasCoverWire): PlaylistCover {
  return hydratePlaylistCover(wire);
}

export function hydrateCanvasCovers(wires: CanvasCoverWire[]): PlaylistCover[] {
  return wires.map(hydrateCanvasCover);
}

export function toPlaylistCoverWire(cover: PlaylistCover): PlaylistCoverWire {
  return {
    id: cover.id,
    title: cover.title,
    url: cover.url,
    artist: cover.artist,
    albumArtUrl: cover.albumArtUrl,
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

export type CoverDisplayDetails = {
  artist: string | null;
  title: string;
};

export function getCoverDisplayDetails(cover: PlaylistCover): CoverDisplayDetails {
  return {
    artist: cover.artist,
    title: cover.title,
  };
}
