import type { SpotifyUserProfile } from "../../types/spotify-auth";

export function isPlaylixDemoMode() {
  return process.env.PLAYLIX_DEMO_MODE?.trim().toLowerCase() === "true";
}

export function getDemoRefreshToken() {
  if (!isPlaylixDemoMode()) {
    return null;
  }

  const refreshToken = process.env.SPOTIFY_DEMO_REFRESH_TOKEN?.trim();

  return refreshToken || null;
}

function decodeEnvValue(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/** Profile from env; null if only the refresh token was provided. */
export function getDemoUserFromEnv(): SpotifyUserProfile | null {
  if (!isPlaylixDemoMode()) {
    return null;
  }

  const rawUser = process.env.SPOTIFY_DEMO_USER_ID?.trim();
  const displayNameOverride = process.env.SPOTIFY_DEMO_DISPLAY_NAME?.trim();
  const imageUrlOverride = process.env.SPOTIFY_DEMO_IMAGE_URL?.trim() || null;

  if (!rawUser) {
    return null;
  }

  const decoded = decodeEnvValue(rawUser);

  if (decoded.startsWith("{")) {
    try {
      const parsed = JSON.parse(decoded) as SpotifyUserProfile;

      if (typeof parsed.id === "string") {
        return {
          id: parsed.id,
          displayName: displayNameOverride || parsed.displayName || "Demo",
          imageUrl: imageUrlOverride ?? parsed.imageUrl ?? null,
        };
      }
    } catch {
      return null;
    }
  }

  return {
    id: decoded,
    displayName: displayNameOverride || "Demo",
    imageUrl: imageUrlOverride,
  };
}

export function applyDemoDisplayNameOverride(profile: SpotifyUserProfile) {
  const displayNameOverride = process.env.SPOTIFY_DEMO_DISPLAY_NAME?.trim();

  if (!displayNameOverride) {
    return profile;
  }

  return {
    ...profile,
    displayName: displayNameOverride,
  };
}
