export type SpotifyConfig = {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
};

export function getSpotifyConfig(): SpotifyConfig | null {
  const clientId = process.env.CLIENT_ID_SPOTIFY?.trim();
  const clientSecret = process.env.CLIENT_SECRET_SPOTIFY?.trim();
  const redirectUri = process.env.REDIRECT_URI_SPOTIFY?.trim();

  if (!clientId || !clientSecret || !redirectUri) {
    return null;
  }

  return { clientId, clientSecret, redirectUri };
}

export function getMissingSpotifyEnvKeys() {
  const keys = [
    "CLIENT_ID_SPOTIFY",
    "CLIENT_SECRET_SPOTIFY",
    "REDIRECT_URI_SPOTIFY",
  ] as const;

  return keys.filter((key) => !process.env[key]?.trim());
}
