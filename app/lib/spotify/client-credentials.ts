import { getSpotifyConfig } from "./config";

type SpotifyTokenResponse = {
  access_token: string;
  expires_in: number;
  token_type: string;
};

type SpotifyTokenError = {
  error: string;
  error_description?: string;
};

/** App-only token — used to verify credentials during setup. */
export async function requestClientCredentialsToken() {
  const config = getSpotifyConfig();

  if (!config) {
    return {
      ok: false as const,
      error: "Missing Spotify environment variables.",
    };
  }

  const credentials = Buffer.from(
    `${config.clientId}:${config.clientSecret}`,
  ).toString("base64");

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }),
  });

  const payload = (await response.json()) as
    | SpotifyTokenResponse
    | SpotifyTokenError;

  if (!response.ok) {
    const message =
      "error_description" in payload
        ? payload.error_description ?? payload.error
        : "Spotify rejected the client credentials request.";

    return { ok: false as const, error: message };
  }

  if (!("access_token" in payload)) {
    return {
      ok: false as const,
      error: "Spotify returned an unexpected token response.",
    };
  }

  return {
    ok: true as const,
    accessToken: payload.access_token,
    expiresIn: payload.expires_in,
  };
}
