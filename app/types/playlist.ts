export type PlaylistCoverWire = {
  id: string;
  title: string;
  url: string;
  artist: string | null;
  albumArtUrl: string | null;
};

export type PlaylistCover = PlaylistCoverWire;

export type PlaylistApiError = {
  error: string;
};

export type PlaylistApiSuccess = {
  covers: PlaylistCover[];
};

export type PlaylistApiResponse = PlaylistApiSuccess | PlaylistApiError;
