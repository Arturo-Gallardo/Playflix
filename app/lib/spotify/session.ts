import { cookies } from "next/headers";
import type { SpotifySessionResponse, SpotifyUserProfile } from "../../types/spotify-auth";
import {
  spotifyCookieNames,
  spotifyRefreshTokenMaxAgeSeconds,
  spotifyTokenRefreshSkewMs,
} from "./constants";
import { refreshSpotifyAccessToken, type SpotifyTokenBundle } from "./oauth";

type StoredSpotifySession = {
  accessToken: string;
  expiresAt: number;
  refreshToken: string;
  user: SpotifyUserProfile;
};

function getCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    maxAge,
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
}

function parseStoredUser(value: string | undefined) {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as SpotifyUserProfile;

    if (
      typeof parsed.id !== "string" ||
      typeof parsed.displayName !== "string"
    ) {
      return null;
    }

    return {
      id: parsed.id,
      displayName: parsed.displayName,
      imageUrl:
        typeof parsed.imageUrl === "string" ? parsed.imageUrl : null,
    } satisfies SpotifyUserProfile;
  } catch {
    return null;
  }
}

async function readStoredSession(): Promise<StoredSpotifySession | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(spotifyCookieNames.accessToken)?.value;
  const refreshToken = cookieStore.get(spotifyCookieNames.refreshToken)?.value;
  const expiresAtRaw = cookieStore.get(spotifyCookieNames.expiresAt)?.value;
  const user = parseStoredUser(cookieStore.get(spotifyCookieNames.user)?.value);

  if (!accessToken || !refreshToken || !expiresAtRaw || !user) {
    return null;
  }

  const expiresAt = Number.parseInt(expiresAtRaw, 10);

  if (!Number.isFinite(expiresAt)) {
    return null;
  }

  return {
    accessToken,
    expiresAt,
    refreshToken,
    user,
  };
}

async function writeSessionCookies(
  tokens: SpotifyTokenBundle,
  user: SpotifyUserProfile,
  existingRefreshToken?: string,
) {
  const cookieStore = await cookies();
  const refreshToken = tokens.refreshToken ?? existingRefreshToken;

  if (!refreshToken) {
    throw new Error("Spotify did not return a refresh token.");
  }

  const expiresAt = Date.now() + tokens.expiresIn * 1000;

  cookieStore.set(
    spotifyCookieNames.accessToken,
    tokens.accessToken,
    getCookieOptions(tokens.expiresIn),
  );
  cookieStore.set(
    spotifyCookieNames.refreshToken,
    refreshToken,
    getCookieOptions(spotifyRefreshTokenMaxAgeSeconds),
  );
  cookieStore.set(
    spotifyCookieNames.expiresAt,
    String(expiresAt),
    getCookieOptions(tokens.expiresIn),
  );
  cookieStore.set(
    spotifyCookieNames.user,
    JSON.stringify(user),
    getCookieOptions(spotifyRefreshTokenMaxAgeSeconds),
  );
}

export async function clearSpotifySession() {
  const cookieStore = await cookies();

  for (const name of Object.values(spotifyCookieNames)) {
    cookieStore.delete(name);
  }
}

export async function setSpotifyOAuthState(state: string) {
  const cookieStore = await cookies();

  cookieStore.set(
    spotifyCookieNames.oauthState,
    state,
    getCookieOptions(600),
  );
}

export async function consumeSpotifyOAuthState(state: string | null) {
  if (!state) {
    return false;
  }

  const cookieStore = await cookies();
  const storedState = cookieStore.get(spotifyCookieNames.oauthState)?.value;

  cookieStore.delete(spotifyCookieNames.oauthState);

  return storedState === state;
}

export async function createSpotifySession(
  tokens: SpotifyTokenBundle,
  user: SpotifyUserProfile,
) {
  await writeSessionCookies(tokens, user);
}

export async function getSpotifySession(): Promise<SpotifySessionResponse> {
  const storedSession = await readStoredSession();

  if (!storedSession) {
    return { authenticated: false, user: null };
  }

  const isExpired =
    Date.now() >= storedSession.expiresAt - spotifyTokenRefreshSkewMs;

  if (!isExpired) {
    return {
      authenticated: true,
      user: storedSession.user,
    };
  }

  const refreshed = await refreshSpotifyAccessToken(storedSession.refreshToken);

  if (!refreshed.ok) {
    await clearSpotifySession();
    return { authenticated: false, user: null };
  }

  await writeSessionCookies(
    refreshed.tokens,
    storedSession.user,
    storedSession.refreshToken,
  );

  return {
    authenticated: true,
    user: storedSession.user,
  };
}

export async function getSpotifyAccessToken() {
  const storedSession = await readStoredSession();

  if (!storedSession) {
    return null;
  }

  const isExpired =
    Date.now() >= storedSession.expiresAt - spotifyTokenRefreshSkewMs;

  if (!isExpired) {
    return storedSession.accessToken;
  }

  const refreshed = await refreshSpotifyAccessToken(storedSession.refreshToken);

  if (!refreshed.ok) {
    await clearSpotifySession();
    return null;
  }

  await writeSessionCookies(
    refreshed.tokens,
    storedSession.user,
    storedSession.refreshToken,
  );

  return refreshed.tokens.accessToken;
}
