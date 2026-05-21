import { spotifyApiBaseUrl } from "./constants";

type SpotifyApiErrorBody = {
  error?: { message?: string; status?: number } | string;
  error_description?: string;
};

export async function spotifyApiFetch(
  accessToken: string,
  path: string,
  init?: RequestInit,
) {
  const response = await fetch(`${spotifyApiBaseUrl}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...init?.headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await readSpotifyErrorDetail(response);
    return {
      ok: false as const,
      error: detail || `Spotify request failed (${response.status}).`,
      status: response.status,
    };
  }

  const data = (await response.json()) as Record<string, unknown>;

  return { ok: true as const, data };
}

export async function spotifyApiFetchUrl(
  accessToken: string,
  url: string,
) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await readSpotifyErrorDetail(response);
    return {
      ok: false as const,
      error: detail || `Spotify request failed (${response.status}).`,
      status: response.status,
    };
  }

  const data = (await response.json()) as Record<string, unknown>;

  return { ok: true as const, data };
}

async function readSpotifyErrorDetail(response: Response) {
  const body = await response.text();

  if (!body.trim()) {
    return "";
  }

  try {
    const payload = JSON.parse(body) as SpotifyApiErrorBody;

    if (typeof payload.error === "string") {
      return payload.error_description ?? payload.error;
    }

    return payload.error?.message ?? payload.error_description ?? "";
  } catch {
    return body.trim();
  }
}
