import { getSpotifyConfig } from "./config";
import {
  spotifyAuthScopes,
  spotifyAuthorizeUrl,
  spotifyTokenUrl,
} from "./constants";

type SpotifyTokenSuccess = {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
  token_type: string;
};

type SpotifyTokenFailure = {
  error: string;
  error_description?: string;
};

export type SpotifyTokenBundle = {
  accessToken: string;
  expiresIn: number;
  refreshToken?: string;
};

type SpotifyAuthorizeOptions = {
  /** Ask Spotify to show the approve screen again. */
  showDialog?: boolean;
};

export function buildSpotifyAuthorizeUrl(
  state: string,
  options: SpotifyAuthorizeOptions = {},
) {
  const config = getSpotifyConfig();

  if (!config) {
    throw new Error("Spotify credentials are not configured.");
  }

  const params = new URLSearchParams({
    access_type: "offline",
    client_id: config.clientId,
    response_type: "code",
    redirect_uri: config.redirectUri,
    scope: spotifyAuthScopes.join(" "),
    state,
  });

  if (options.showDialog) {
    params.set("show_dialog", "true");
  }

  return `${spotifyAuthorizeUrl}?${params.toString()}`;
}

export async function exchangeAuthorizationCode(code: string) {
  const config = getSpotifyConfig();

  if (!config) {
    return {
      ok: false as const,
      error: "Spotify credentials are not configured.",
    };
  }

  return requestSpotifyTokens({
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: config.redirectUri,
    }),
    clientId: config.clientId,
    clientSecret: config.clientSecret,
  });
}

export async function refreshSpotifyAccessToken(refreshToken: string) {
  const config = getSpotifyConfig();

  if (!config) {
    return {
      ok: false as const,
      error: "Spotify credentials are not configured.",
    };
  }

  return requestSpotifyTokens({
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
    clientId: config.clientId,
    clientSecret: config.clientSecret,
  });
}

async function requestSpotifyTokens({
  body,
  clientId,
  clientSecret,
}: {
  body: URLSearchParams;
  clientId: string;
  clientSecret: string;
}) {
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64",
  );

  const response = await fetch(spotifyTokenUrl, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const payload = (await response.json()) as
    | SpotifyTokenSuccess
    | SpotifyTokenFailure;

  if (!response.ok) {
    const message =
      "error_description" in payload
        ? (payload.error_description ?? payload.error)
        : "Spotify rejected the token request.";

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
    tokens: {
      accessToken: payload.access_token,
      expiresIn: payload.expires_in,
      refreshToken: payload.refresh_token,
    } satisfies SpotifyTokenBundle,
  };
}
