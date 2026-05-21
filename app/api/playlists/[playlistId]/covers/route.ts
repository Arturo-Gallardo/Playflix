import { NextResponse } from "next/server";
import { fetchPlaylistCoverWirePage } from "../../../../lib/spotify/playlists";
import { getSpotifyAccessToken } from "../../../../lib/spotify/session";

type RouteContext = {
  params: Promise<{ playlistId: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const { playlistId } = await context.params;

    if (!playlistId.trim()) {
      return NextResponse.json(
        { error: "Playlist id is required." },
        { status: 400 },
      );
    }

    const accessToken = await getSpotifyAccessToken();

    if (!accessToken) {
      return NextResponse.json(
        { error: "Sign in with Spotify to load playlists." },
        { status: 401 },
      );
    }

    const cursor = new URL(request.url).searchParams.get("cursor");
    const cursorPath = cursor ? decodeURIComponent(cursor) : null;

    const result = await fetchPlaylistCoverWirePage(
      accessToken,
      playlistId,
      cursorPath,
    );

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 502 });
    }

    if (result.covers.length === 0 && !result.hasMore) {
      return NextResponse.json(
        { error: "That playlist has no tracks to show." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      covers: result.covers,
      hasMore: result.hasMore,
      nextCursor: result.nextPath,
    });
  } catch {
    return NextResponse.json(
      { error: "Could not load that playlist." },
      { status: 500 },
    );
  }
}
