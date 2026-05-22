import { NextResponse } from "next/server";
import { fetchTrackAudioFeatures } from "../../../lib/spotify/audio-features";
import { getSpotifyAccessToken } from "../../../lib/spotify/session";

export async function POST(request: Request) {
  try {
    const accessToken = await getSpotifyAccessToken();

    if (!accessToken) {
      return NextResponse.json(
        { error: "Sign in with Spotify to sort by tempo." },
        { status: 401 },
      );
    }

    const body = (await request.json()) as { ids?: unknown };
    const rawIds = body.ids;

    if (!Array.isArray(rawIds)) {
      return NextResponse.json(
        { error: "Track ids are required." },
        { status: 400 },
      );
    }

    const trackIds = [
      ...new Set(
        rawIds
          .filter((id): id is string => typeof id === "string")
          .map((id) => id.trim())
          .filter(Boolean),
      ),
    ];

    if (trackIds.length === 0) {
      return NextResponse.json({ tempos: {} });
    }

    const result = await fetchTrackAudioFeatures(accessToken, trackIds);

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 502 });
    }

    return NextResponse.json({ tempos: result.tempos });
  } catch {
    return NextResponse.json(
      { error: "Could not load track tempo data." },
      { status: 500 },
    );
  }
}
