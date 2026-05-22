import type { PlaylistCoverWire } from "../../types/playlist";
import { spotifyApiFetch } from "./spotify-api";

const trackDetailsBatchSize = 50;

type SpotifyTrackDetails = {
  album?: {
    images?: Array<{ url: string }>;
    name?: string;
    release_date?: string;
  };
  artists?: Array<{ name: string }>;
  duration_ms?: number;
  id?: string;
  popularity?: number;
};

type SpotifyTracksResponse = {
  tracks?: Array<SpotifyTrackDetails | null>;
};

export function mergeTrackDetailsIntoCover(
  cover: PlaylistCoverWire,
  track: SpotifyTrackDetails,
): PlaylistCoverWire {
  const artistNames = (track.artists ?? [])
    .map((artist) => artist.name.trim())
    .filter(Boolean);

  return {
    ...cover,
    albumArtUrl: cover.albumArtUrl ?? track.album?.images?.[0]?.url ?? null,
    albumName: cover.albumName ?? track.album?.name?.trim() ?? null,
    artist:
      cover.artist ??
      (artistNames.length > 0 ? artistNames.join(", ") : null),
    durationMs:
      cover.durationMs ??
      (typeof track.duration_ms === "number" ? track.duration_ms : null),
    popularity:
      cover.popularity ??
      (typeof track.popularity === "number" ? track.popularity : null),
    releaseDate: cover.releaseDate ?? track.album?.release_date ?? null,
  };
}

export async function enrichCoversWithTrackMetadata(
  accessToken: string,
  covers: PlaylistCoverWire[],
) {
  const trackIds = [
    ...new Set(
      covers.filter(coverNeedsTrackEnrichment).map((cover) => cover.id),
    ),
  ];

  if (trackIds.length === 0) {
    return covers;
  }

  const tracksResult = await fetchTrackDetailsBatch(accessToken, trackIds);

  if (!tracksResult.ok) {
    return covers;
  }

  return covers.map((cover) => {
    const track = tracksResult.tracks[cover.id];

    if (!track) {
      return cover;
    }

    return mergeTrackDetailsIntoCover(cover, track);
  });
}

async function fetchTrackDetailsBatch(
  accessToken: string,
  trackIds: string[],
) {
  const tracks: Record<string, SpotifyTrackDetails> = {};

  for (
    let offset = 0;
    offset < trackIds.length;
    offset += trackDetailsBatchSize
  ) {
    const batch = trackIds.slice(offset, offset + trackDetailsBatchSize);
    const path = `/tracks?ids=${encodeURIComponent(batch.join(","))}`;
    const result = await spotifyApiFetch(accessToken, path);

    if (!result.ok) {
      return result;
    }

    const page = result.data as SpotifyTracksResponse;

    for (const track of page.tracks ?? []) {
      if (track?.id) {
        tracks[track.id] = track;
      }
    }
  }

  return {
    ok: true as const,
    tracks,
  };
}

function coverNeedsTrackEnrichment(cover: PlaylistCoverWire) {
  return (
    !cover.albumName ||
    cover.durationMs === null ||
    cover.popularity === null ||
    cover.releaseDate === null
  );
}
