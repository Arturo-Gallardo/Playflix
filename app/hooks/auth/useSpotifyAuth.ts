"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  SpotifyAuthStatus,
  SpotifySessionResponse,
  SpotifyUserProfile,
} from "../../types/spotify-auth";

function readAuthErrorFromUrl() {
  if (typeof window === "undefined") {
    return null;
  }

  const params = new URLSearchParams(window.location.search);
  const authError = params.get("auth_error");

  if (!authError) {
    return null;
  }

  const nextUrl = new URL(window.location.href);
  nextUrl.searchParams.delete("auth_error");
  nextUrl.searchParams.delete("auth");
  window.history.replaceState({}, "", nextUrl.toString());

  return authError;
}

function readAuthSuccessFromUrl() {
  if (typeof window === "undefined") {
    return false;
  }

  const params = new URLSearchParams(window.location.search);
  const didSignIn = params.get("auth") === "success";

  if (!didSignIn) {
    return false;
  }

  const nextUrl = new URL(window.location.href);
  nextUrl.searchParams.delete("auth");
  nextUrl.searchParams.delete("auth_error");
  window.history.replaceState({}, "", nextUrl.toString());

  return true;
}

function getAppAuthPath(pathname: string) {
  const currentUrl = new URL(window.location.href);

  if (currentUrl.hostname === "localhost") {
    currentUrl.hostname = "127.0.0.1";
  }

  currentUrl.pathname = pathname;
  currentUrl.search = "";
  currentUrl.hash = "";

  return currentUrl.toString();
}

function getSignInUrl() {
  return getAppAuthPath("/api/auth/spotify");
}

function getSwitchAccountUrl() {
  return getAppAuthPath("/api/auth/switch");
}

async function fetchSpotifySession() {
  const response = await fetch("/api/auth/session", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Could not load your Spotify session.");
  }

  return (await response.json()) as SpotifySessionResponse;
}

export function useSpotifyAuth() {
  const [status, setStatus] = useState<SpotifyAuthStatus>("loading");
  const [user, setUser] = useState<SpotifyUserProfile | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const applySession = useCallback((session: SpotifySessionResponse) => {
    setIsDemoMode(session.isDemoMode);

    if (session.authenticated) {
      setStatus("authenticated");
      setUser(session.user);
      return;
    }

    setStatus("unauthenticated");
    setUser(null);

    if (session.isDemoMode) {
      setErrorMessage(
        "Demo account is unavailable. Check SPOTIFY_DEMO_REFRESH_TOKEN in your environment.",
      );
    }
  }, []);

  const refreshSession = useCallback(async () => {
    const session = await fetchSpotifySession();
    applySession(session);
    return session;
  }, [applySession]);

  useEffect(() => {
    const authError = readAuthErrorFromUrl();
    const didSignIn = readAuthSuccessFromUrl();

    if (authError) {
      setErrorMessage(authError);
    }

    void refreshSession()
      .catch(() => {
        setStatus("unauthenticated");
        setUser(null);
        setIsDemoMode(false);

        if (!authError) {
          setErrorMessage("Could not verify your Spotify session.");
        }
      })
      .finally(() => {
        if (didSignIn) {
          setErrorMessage(null);
        }
      });
  }, [refreshSession]);

  const signIn = useCallback(() => {
    if (isDemoMode) {
      return;
    }

    setErrorMessage(null);
    window.location.assign(getSignInUrl());
  }, [isDemoMode]);

  const signOut = useCallback(async () => {
    if (isDemoMode) {
      return;
    }

    setErrorMessage(null);

    const response = await fetch("/api/auth/logout", {
      method: "POST",
    });

    if (!response.ok) {
      setErrorMessage("Could not sign out. Try again.");
      return;
    }

    setStatus("unauthenticated");
    setUser(null);
  }, [isDemoMode]);

  const switchAccount = useCallback(() => {
    if (isDemoMode) {
      return;
    }

    setErrorMessage(null);
    window.location.assign(getSwitchAccountUrl());
  }, [isDemoMode]);

  return {
    errorMessage,
    isAuthenticated: status === "authenticated",
    isDemoMode,
    isLoading: status === "loading",
    refreshSession,
    signIn,
    signOut,
    switchAccount,
    status,
    user,
  };
}
