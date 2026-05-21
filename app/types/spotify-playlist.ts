import type { PlaylistCover } from "./playlist";

export type SpotifyPlaylistSummary = {
  id: string;
  imageUrl: string | null;
  name: string;
  trackCount: number;
  url: string;
};

export type SpotifyPlaylistSelection = Pick<
  SpotifyPlaylistSummary,
  "id" | "name" | "trackCount" | "url"
>;

export type SpotifyPlaylistsResponse =
  | {
      hasMore: boolean;
      nextOffset: number | null;
      playlists: SpotifyPlaylistSummary[];
      total: number;
    }
  | {
      error: string;
    };

export type PlaylistCoversPageResponse =
  | {
      covers: PlaylistCover[];
      hasMore: boolean;
      nextCursor: string | null;
    }
  | {
      error: string;
    };
