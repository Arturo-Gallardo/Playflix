import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getSpotifyConfig } from "../../../lib/spotify/config";
import { buildSpotifyAuthorizeUrl } from "../../../lib/spotify/oauth";
import { setSpotifyOAuthState } from "../../../lib/spotify/session";

export async function GET() {
  const config = getSpotifyConfig();

  if (!config) {
    return NextResponse.json(
      { error: "Spotify credentials are not configured." },
      { status: 500 },
    );
  }

  const state = randomUUID();

  await setSpotifyOAuthState(state);

  return NextResponse.redirect(buildSpotifyAuthorizeUrl(state));
}
