import { spotifyApiBaseUrl } from "./constants";
import type { SpotifyUserProfile } from "../../types/spotify-auth";

type SpotifyMeResponse = {
  display_name: string | null;
  id: string;
  images: Array<{ url: string }>;
};

function parseSpotifyErrorMessage(body: string) {
  const trimmed = body.trim();

  if (!trimmed) {
    return "";
  }

  try {
    const payload = JSON.parse(trimmed) as {
      error?: { message?: string } | string;
      error_description?: string;
    };

    if (typeof payload.error === "string") {
      return payload.error_description ?? payload.error;
    }

    return payload.error?.message ?? payload.error_description ?? "";
  } catch {
    return trimmed;
  }
}

function buildProfileErrorMessage(status: number, detail: string) {
  if (
    status === 403 &&
    detail.toLowerCase().includes("premium subscription required")
  ) {
    return "Spotify blocked this app: the account that owns your Spotify Developer app needs an active Premium subscription (2026 API policy).";
  }

  if (detail) {
    return `Could not load your Spotify profile (${status}: ${detail}).`;
  }

  return `Could not load your Spotify profile (${status}).`;
}

export async function fetchSpotifyUserProfile(accessToken: string) {
  try {
    const response = await fetch(`${spotifyApiBaseUrl}/me`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const detail = parseSpotifyErrorMessage(await response.text());

      return {
        ok: false as const,
        error: buildProfileErrorMessage(response.status, detail),
      };
    }

    const payload = (await response.json()) as SpotifyMeResponse;

    if (!payload.id) {
      return {
        ok: false as const,
        error: "Spotify returned an unexpected profile response.",
      };
    }

    const profile: SpotifyUserProfile = {
      id: payload.id,
      displayName: payload.display_name?.trim() || "Spotify user",
      imageUrl: payload.images[0]?.url ?? null,
    };

    return { ok: true as const, profile };
  } catch {
    return {
      ok: false as const,
      error: "Could not reach Spotify to load your profile.",
    };
  }
}
