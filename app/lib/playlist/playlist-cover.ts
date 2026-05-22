import type { CanvasCoverWire } from "../../types/canvas-snapshot";
import type { PlaylistCover, PlaylistCoverWire } from "../../types/playlist";
import { formatCoverDateCompact } from "./cover-details-format";

const emptyCoverMetadata = {
  albumName: null,
  playlistName: null,
  addedAt: null,
  releaseDate: null,
  durationMs: null,
  popularity: null,
  tempo: null,
} as const;

export type CoverLabeledRow = {
  label: string;
  value: string;
};

export type CoverDisplayDetails = {
  artist: string | null;
  dateRows: CoverLabeledRow[];
  metaRows: CoverLabeledRow[];
  title: string;
};

export function hydratePlaylistCover(wire: PlaylistCoverWire): PlaylistCover {
  return {
    id: wire.id,
    title: wire.title,
    url: wire.url,
    artist: wire.artist,
    albumArtUrl: wire.albumArtUrl,
    albumName: wire.albumName ?? null,
    playlistName: wire.playlistName ?? null,
    addedAt: wire.addedAt ?? null,
    releaseDate: wire.releaseDate ?? null,
    durationMs: wire.durationMs ?? null,
    popularity: wire.popularity ?? null,
    tempo: wire.tempo ?? null,
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
    albumName: cover.albumName,
    playlistName: cover.playlistName,
    addedAt: cover.addedAt,
    releaseDate: cover.releaseDate,
    durationMs: cover.durationMs,
    popularity: cover.popularity,
    tempo: cover.tempo,
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

export function createEmptyCoverMetadata() {
  return { ...emptyCoverMetadata };
}

export function enrichCoverForDisplay(
  cover: PlaylistCover,
  loadedPlaylistNames: ReadonlyMap<string, string>,
  playlistSources: readonly string[],
): PlaylistCover {
  if (cover.playlistName) {
    return cover;
  }

  if (playlistSources.length !== 1) {
    return cover;
  }

  const playlistName = loadedPlaylistNames.get(playlistSources[0]);

  if (!playlistName) {
    return cover;
  }

  return {
    ...cover,
    playlistName,
  };
}

export function getCoverDisplayDetails(cover: PlaylistCover): CoverDisplayDetails {
  const albumName =
    cover.albumName &&
    cover.albumName.localeCompare(cover.title, undefined, {
      sensitivity: "accent",
    }) !== 0
      ? cover.albumName
      : null;

  const metaRows: CoverLabeledRow[] = [];

  if (albumName) {
    metaRows.push({ label: "Album", value: albumName });
  }

  if (cover.playlistName) {
    metaRows.push({ label: "Playlist", value: cover.playlistName });
  }

  const dateRows: CoverLabeledRow[] = [];

  if (cover.addedAt) {
    dateRows.push({
      label: "Date Added",
      value: formatCoverDateCompact(cover.addedAt),
    });
  }

  if (cover.releaseDate) {
    dateRows.push({
      label: "Date Released",
      value: formatCoverDateCompact(cover.releaseDate),
    });
  }

  return {
    artist: cover.artist,
    dateRows,
    metaRows,
    title: cover.title,
  };
}
