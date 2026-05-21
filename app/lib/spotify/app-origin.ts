import { getSpotifyConfig } from "./config";

/** App origin derived from REDIRECT_URI_SPOTIFY (e.g. http://127.0.0.1:3000). */
export function getSpotifyAppOrigin() {
  const config = getSpotifyConfig();

  if (!config) {
    return null;
  }

  try {
    const redirectUri = new URL(config.redirectUri);
    return redirectUri.origin;
  } catch {
    return null;
  }
}

export function buildSpotifyAppUrl(
  pathname: string,
  searchParams?: Record<string, string>,
) {
  const origin = getSpotifyAppOrigin() ?? "http://127.0.0.1:3000";
  const url = new URL(pathname, origin);

  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      url.searchParams.set(key, value);
    }
  }

  return url;
}
