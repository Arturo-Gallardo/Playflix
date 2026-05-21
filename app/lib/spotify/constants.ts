export const spotifyAuthorizeUrl = "https://accounts.spotify.com/authorize";
export const spotifyTokenUrl = "https://accounts.spotify.com/api/token";
export const spotifyApiBaseUrl = "https://api.spotify.com/v1";

export const spotifyAuthScopes = [
  "playlist-read-private",
  "playlist-read-collaborative",
  "user-read-private",
] as const;

export const spotifyCookieNames = {
  accessToken: "spotify_access_token",
  refreshToken: "spotify_refresh_token",
  expiresAt: "spotify_expires_at",
  user: "spotify_user",
  oauthState: "spotify_oauth_state",
} as const;

/** Refresh one minute before Spotify says the token expires. */
export const spotifyTokenRefreshSkewMs = 60_000;

/** Keep refresh tokens around for 60 days. */
export const spotifyRefreshTokenMaxAgeSeconds = 60 * 24 * 60 * 60;
