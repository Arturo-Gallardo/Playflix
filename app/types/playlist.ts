export type PlaylistCoverWire = {
  id: string;
  title: string;
  url: string;
  artist: string | null;
  albumArtUrl: string | null;
  albumName: string | null;
  playlistName: string | null;
  addedAt: string | null;
  releaseDate: string | null;
  durationMs: number | null;
  popularity: number | null;
  tempo: number | null;
};

export type PlaylistCover = PlaylistCoverWire;

export type PlaylistApiError = {
  error: string;
};

export type PlaylistApiSuccess = {
  covers: PlaylistCover[];
};

export type PlaylistApiResponse = PlaylistApiSuccess | PlaylistApiError;
