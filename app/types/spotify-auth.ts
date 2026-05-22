export type SpotifyUserProfile = {
  id: string;
  displayName: string;
  imageUrl: string | null;
};

export type SpotifySessionResponse =
  | {
      authenticated: true;
      isDemoMode: boolean;
      user: SpotifyUserProfile;
    }
  | {
      authenticated: false;
      isDemoMode: boolean;
      user: null;
    };

export type SpotifyAuthStatus = "loading" | "authenticated" | "unauthenticated";
