import type { PlaylistCoverWire } from "../../types/playlist";
import type { SpotifyPlaylistSummary } from "../../types/spotify-playlist";
import { enrichCoversWithTrackMetadata } from "./track-metadata";
import { spotifyApiFetch, spotifyApiFetchUrl } from "./spotify-api";

const playlistListFields =
  "items(id,name,images,items(total),tracks(total),external_urls,owner(id),collaborative),total,next,limit,offset";
const playlistItemFields =
  "items(added_at,item(type,id,name,artists(name),album(name,release_date,images(url)),duration_ms,popularity,external_urls(spotify))),limit,offset,total,next";
const playlistPageLimit = 50;
const playlistTrackPageLimit = 50;

type SpotifyPlaylistItem = {
  collaborative?: boolean;
  external_urls?: { spotify?: string };
  id?: string;
  images?: Array<{ url: string }>;
  items?: { total?: number };
  name?: string;
  owner?: { id?: string };
  tracks?: { total?: number };
};

type SpotifyPlaylistListPage = {
  items?: Array<SpotifyPlaylistItem | null>;
  limit?: number;
  next?: string | null;
  offset?: number;
  total?: number;
};

type SpotifyTrackItem = {
  added_at?: string;
  item?: SpotifyTrack | null;
  track?: SpotifyTrack | null;
};

type SpotifyTrack = {
  album?: {
    images?: Array<{ url: string }>;
    name?: string;
    release_date?: string;
  };
  artists?: Array<{ name: string }>;
  duration_ms?: number;
  external_urls?: { spotify?: string };
  id?: string;
  name?: string;
  popularity?: number;
  type?: string;
};

type SpotifyPlaylistItemsPage = {
  items?: Array<SpotifyTrackItem | null>;
  limit?: number;
  next?: string | null;
  offset?: number;
  total?: number;
};

export function buildSpotifyPlaylistUrl(playlistId: string) {
  return `https://open.spotify.com/playlist/${playlistId}`;
}

function buildSpotifyTrackUrl(trackId: string) {
  return `https://open.spotify.com/track/${trackId}`;
}

export async function fetchCurrentUserPlaylistsPage(
  accessToken: string,
  currentUserId: string,
  offset = 0,
  limit = playlistPageLimit,
) {
  const path = `/me/playlists?limit=${limit}&offset=${offset}&fields=${encodeURIComponent(playlistListFields)}`;
  const pageResult = await spotifyApiFetch(accessToken, path);

  if (!pageResult.ok) {
    return pageResult;
  }

  const page = pageResult.data as SpotifyPlaylistListPage;
  const playlists: SpotifyPlaylistSummary[] = [];
  const seenPlaylistIds = new Set<string>();

  for (const item of page.items ?? []) {
    if (!isLoadablePlaylist(item, currentUserId)) {
      continue;
    }

    const summary = mapPlaylistItemToSummary(item);

    if (summary && !seenPlaylistIds.has(summary.id)) {
      seenPlaylistIds.add(summary.id);
      playlists.push(summary);
    }
  }

  const pageOffset = page.offset ?? offset;
  const pageLimit = page.limit ?? limit;
  const total = page.total ?? playlists.length;
  const nextOffset = pageOffset + pageLimit;
  const hasMore = Boolean(page.next) && nextOffset < total;

  return {
    ok: true as const,
    hasMore,
    nextOffset: hasMore ? nextOffset : null,
    playlists,
    total,
  };
}

export async function fetchPlaylistCoverWirePage(
  accessToken: string,
  playlistId: string,
  cursorPath: string | null = null,
) {
  const path =
    cursorPath ??
    `/playlists/${playlistId}/items?limit=${playlistTrackPageLimit}&additional_types=track&fields=${encodeURIComponent(playlistItemFields)}`;

  const pageResult = path.startsWith("http")
    ? await spotifyApiFetchUrl(accessToken, path)
    : await spotifyApiFetch(accessToken, path);

  if (!pageResult.ok) {
    return pageResult;
  }

  const page = pageResult.data as SpotifyPlaylistItemsPage;
  const covers: PlaylistCoverWire[] = [];

  for (const item of page.items ?? []) {
    const cover = mapPlaylistItemToCoverWire(item);

    if (cover) {
      covers.push(cover);
    }
  }

  const enrichedCovers = await enrichCoversWithTrackMetadata(
    accessToken,
    covers,
  );

  const pageOffset = page.offset ?? parsePlaylistItemsOffset(path) ?? 0;
  const pageLimit = page.limit ?? playlistTrackPageLimit;
  const rawItemCount = page.items?.length ?? 0;
  const totalItems = page.total;
  let nextPath = page.next ?? null;

  // Spotify sometimes omits `next` even when more playlist rows exist.
  if (
    !nextPath &&
    typeof totalItems === "number" &&
    pageOffset + rawItemCount < totalItems
  ) {
    nextPath = buildPlaylistItemsPath(
      playlistId,
      pageOffset + rawItemCount,
      pageLimit,
    );
  }

  return {
    ok: true as const,
    covers: enrichedCovers,
    hasMore: Boolean(nextPath),
    nextPath,
  };
}

function buildPlaylistItemsPath(
  playlistId: string,
  offset: number,
  limit: number,
) {
  return `/playlists/${playlistId}/items?offset=${offset}&limit=${limit}&additional_types=track&fields=${encodeURIComponent(playlistItemFields)}`;
}

function parsePlaylistItemsOffset(path: string) {
  try {
    const url = path.startsWith("http")
      ? new URL(path)
      : new URL(`${path.startsWith("/") ? path : `/${path}`}`, "https://api.spotify.com/v1");
    const offset = url.searchParams.get("offset");

    if (!offset) {
      return null;
    }

    const parsedOffset = Number.parseInt(offset, 10);

    return Number.isFinite(parsedOffset) ? parsedOffset : null;
  } catch {
    return null;
  }
}

function isLoadablePlaylist(
  item: SpotifyPlaylistItem | null,
  currentUserId: string,
) {
  if (!item?.id) {
    return false;
  }

  const ownerId = item.owner?.id;

  if (!ownerId) {
    return false;
  }

  if (ownerId === currentUserId) {
    return true;
  }

  // Followed playlists owned by someone else cannot be read via the API.
  return item.collaborative === true;
}

function mapPlaylistItemToSummary(
  item: SpotifyPlaylistItem | null,
): SpotifyPlaylistSummary | null {
  if (!item?.id || !item.name) {
    return null;
  }

  return {
    id: item.id,
    imageUrl: item.images?.[0]?.url ?? null,
    name: item.name,
    trackCount: item.items?.total ?? item.tracks?.total ?? 0,
    url: item.external_urls?.spotify ?? buildSpotifyPlaylistUrl(item.id),
  };
}

function mapPlaylistItemToCoverWire(
  row: SpotifyTrackItem | null,
): PlaylistCoverWire | null {
  if (!row) {
    return null;
  }

  const track = row.item ?? row.track ?? null;
  const cover = mapTrackToCoverWire(track);

  if (!cover) {
    return null;
  }

  return {
    ...cover,
    addedAt: row.added_at ?? null,
    releaseDate: track?.album?.release_date ?? null,
    durationMs:
      typeof track?.duration_ms === "number" ? track.duration_ms : null,
    popularity:
      typeof track?.popularity === "number" ? track.popularity : null,
    tempo: null,
  };
}

function mapTrackToCoverWire(track: SpotifyTrack | null): PlaylistCoverWire | null {
  if (!track?.id || !track.name) {
    return null;
  }

  if (track.type === "episode") {
    return null;
  }

  const artistNames = (track.artists ?? [])
    .map((artist) => artist.name.trim())
    .filter(Boolean);

  return {
    id: track.id,
    title: track.name,
    url: track.external_urls?.spotify ?? buildSpotifyTrackUrl(track.id),
    artist: artistNames.length > 0 ? artistNames.join(", ") : null,
    albumArtUrl: track.album?.images?.[0]?.url ?? null,
    albumName: track.album?.name?.trim() || null,
    playlistName: null,
    addedAt: null,
    releaseDate: null,
    durationMs: null,
    popularity: null,
    tempo: null,
  };
}
