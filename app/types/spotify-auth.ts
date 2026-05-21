export type SpotifyUserProfile = {
  id: string;
  displayName: string;
  imageUrl: string | null;
};

export type SpotifySessionResponse =
  | {
      authenticated: true;
      user: SpotifyUserProfile;
    }
  | {
      authenticated: false;
      user: null;
    };

export type SpotifyAuthStatus = "loading" | "authenticated" | "unauthenticated";
