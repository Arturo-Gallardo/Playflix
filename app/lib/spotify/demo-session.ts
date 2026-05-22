import type { SpotifySessionResponse } from "../../types/spotify-auth";
import { spotifyTokenRefreshSkewMs } from "./constants";
import {
  applyDemoDisplayNameOverride,
  getDemoRefreshToken,
  getDemoUserFromEnv,
} from "./demo-config";
import { refreshSpotifyAccessToken } from "./oauth";
import { fetchSpotifyUserProfile } from "./user-profile";

let cachedAccessToken: string | null = null;
let cachedExpiresAt = 0;
let cachedUser: SpotifySessionResponse["user"] = null;

export async function getDemoSpotifyAccessToken() {
  const refreshToken = getDemoRefreshToken();

  if (!refreshToken) {
    return null;
  }

  if (
    cachedAccessToken &&
    Date.now() < cachedExpiresAt - spotifyTokenRefreshSkewMs
  ) {
    return cachedAccessToken;
  }

  const refreshed = await refreshSpotifyAccessToken(refreshToken);

  if (!refreshed.ok) {
    cachedAccessToken = null;
    cachedExpiresAt = 0;
    return null;
  }

  cachedAccessToken = refreshed.tokens.accessToken;
  cachedExpiresAt = Date.now() + refreshed.tokens.expiresIn * 1000;

  return cachedAccessToken;
}

async function resolveDemoUser() {
  if (cachedUser) {
    return cachedUser;
  }

  const userFromEnv = getDemoUserFromEnv();

  if (userFromEnv) {
    cachedUser = userFromEnv;
    return cachedUser;
  }

  const accessToken = await getDemoSpotifyAccessToken();

  if (!accessToken) {
    return null;
  }

  const profileResult = await fetchSpotifyUserProfile(accessToken);

  if (!profileResult.ok) {
    return null;
  }

  cachedUser = applyDemoDisplayNameOverride(profileResult.profile);

  return cachedUser;
}

export async function getDemoSpotifySession(): Promise<SpotifySessionResponse> {
  const user = await resolveDemoUser();
  const accessToken = await getDemoSpotifyAccessToken();

  if (!user || !accessToken) {
    return {
      authenticated: false,
      isDemoMode: true,
      user: null,
    };
  }

  return {
    authenticated: true,
    isDemoMode: true,
    user,
  };
}
