import { NextResponse } from "next/server";
import { fetchCurrentUserPlaylistsPage } from "../../lib/spotify/playlists";
import {
  getSpotifyAccessToken,
  getSpotifySession,
} from "../../lib/spotify/session";

const defaultLimit = 50;
const maxLimit = 50;

function parsePagination(searchParams: URLSearchParams) {
  const offsetRaw = Number.parseInt(searchParams.get("offset") ?? "0", 10);
  const limitRaw = Number.parseInt(
    searchParams.get("limit") ?? String(defaultLimit),
    10,
  );

  const offset = Number.isFinite(offsetRaw) && offsetRaw >= 0 ? offsetRaw : 0;
  const limit =
    Number.isFinite(limitRaw) && limitRaw > 0
      ? Math.min(limitRaw, maxLimit)
      : defaultLimit;

  return { limit, offset };
}

export async function GET(request: Request) {
  try {
    const accessToken = await getSpotifyAccessToken();

    if (!accessToken) {
      return NextResponse.json(
        { error: "Sign in with Spotify to view your playlists." },
        { status: 401 },
      );
    }

    const session = await getSpotifySession();

    if (!session.authenticated) {
      return NextResponse.json(
        { error: "Sign in with Spotify to view your playlists." },
        { status: 401 },
      );
    }

    const { limit, offset } = parsePagination(new URL(request.url).searchParams);
    const result = await fetchCurrentUserPlaylistsPage(
      accessToken,
      session.user.id,
      offset,
      limit,
    );

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 502 });
    }

    return NextResponse.json({
      hasMore: result.hasMore,
      nextOffset: result.nextOffset,
      playlists: result.playlists,
      total: result.total,
    });
  } catch {
    return NextResponse.json(
      { error: "Could not load your Spotify playlists." },
      { status: 500 },
    );
  }
}
