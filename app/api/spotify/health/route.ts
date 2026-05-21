import { NextResponse } from "next/server";
import { requestClientCredentialsToken } from "../../../lib/spotify/client-credentials";
import {
  getMissingSpotifyEnvKeys,
  getSpotifyConfig,
} from "../../../lib/spotify/config";

/** Quick check that `.env.local` credentials can reach Spotify. */
export async function GET() {
  const missingKeys = getMissingSpotifyEnvKeys();

  if (missingKeys.length > 0) {
    return NextResponse.json(
      {
        ok: false,
        error: `Missing environment variables: ${missingKeys.join(", ")}`,
      },
      { status: 500 },
    );
  }

  const config = getSpotifyConfig();
  const tokenResult = await requestClientCredentialsToken();

  if (!tokenResult.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: tokenResult.error,
        redirectUri: config?.redirectUri ?? null,
      },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    message: "Spotify credentials are valid.",
    redirectUri: config?.redirectUri ?? null,
    tokenExpiresInSeconds: tokenResult.expiresIn,
  });
}
