import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { buildSpotifyAppUrl } from "../../../lib/spotify/app-origin";
import { getSpotifyConfig } from "../../../lib/spotify/config";
import { isPlaylixDemoMode } from "../../../lib/spotify/demo-config";
import { buildSpotifyAuthorizeUrl } from "../../../lib/spotify/oauth";
import {
  clearSpotifySession,
  setSpotifyOAuthState,
} from "../../../lib/spotify/session";

/** Clear Playlix session, then restart OAuth with Spotify's account picker. */
export async function GET() {
  if (isPlaylixDemoMode()) {
    return NextResponse.redirect(buildSpotifyAppUrl("/").toString());
  }

  const config = getSpotifyConfig();

  if (!config) {
    return NextResponse.json(
      { error: "Spotify credentials are not configured." },
      { status: 500 },
    );
  }

  await clearSpotifySession();

  const state = randomUUID();

  await setSpotifyOAuthState(state);

  return NextResponse.redirect(
    buildSpotifyAuthorizeUrl(state, { showDialog: true }),
  );
}
