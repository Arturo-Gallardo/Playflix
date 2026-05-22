import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { buildSpotifyAppUrl } from "../../../../lib/spotify/app-origin";
import { isPlaylixDemoMode } from "../../../../lib/spotify/demo-config";
import { exchangeAuthorizationCode } from "../../../../lib/spotify/oauth";
import {
  consumeSpotifyOAuthState,
  createSpotifySession,
} from "../../../../lib/spotify/session";
import { spotifyCookieNames } from "../../../../lib/spotify/constants";
import { fetchSpotifyUserProfile } from "../../../../lib/spotify/user-profile";

function redirectWithAuthError(message: string) {
  return NextResponse.redirect(
    buildSpotifyAppUrl("/", { auth_error: message }),
  );
}

export async function GET(request: Request) {
  if (isPlaylixDemoMode()) {
    return NextResponse.redirect(buildSpotifyAppUrl("/").toString());
  }

  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const state = requestUrl.searchParams.get("state");
  const spotifyError = requestUrl.searchParams.get("error");

  if (spotifyError) {
    const message =
      spotifyError === "access_denied"
        ? "Spotify sign-in was cancelled."
        : "Spotify sign-in failed.";

    return redirectWithAuthError(message);
  }

  if (!code) {
    return redirectWithAuthError("Missing Spotify authorization code.");
  }

  const isValidState = await consumeSpotifyOAuthState(state);

  if (!isValidState) {
    return redirectWithAuthError("Invalid Spotify sign-in state.");
  }

  const tokenResult = await exchangeAuthorizationCode(code);

  if (!tokenResult.ok) {
    return redirectWithAuthError(tokenResult.error);
  }

  if (!tokenResult.tokens.refreshToken) {
    const cookieStore = await cookies();
    const existingRefreshToken = cookieStore.get(
      spotifyCookieNames.refreshToken,
    )?.value;

    if (!existingRefreshToken) {
      return redirectWithAuthError("Spotify did not return a refresh token.");
    }

    tokenResult.tokens.refreshToken = existingRefreshToken;
  }

  const profileResult = await fetchSpotifyUserProfile(
    tokenResult.tokens.accessToken,
  );

  if (!profileResult.ok) {
    return redirectWithAuthError(profileResult.error);
  }

  await createSpotifySession(tokenResult.tokens, profileResult.profile);

  return NextResponse.redirect(
    buildSpotifyAppUrl("/", { auth: "success" }),
  );
}
