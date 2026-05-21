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

function getSignInUrl() {
  const currentUrl = new URL(window.location.href);

  if (currentUrl.hostname === "localhost") {
    currentUrl.hostname = "127.0.0.1";
  }

  currentUrl.pathname = "/api/auth/spotify";
  currentUrl.search = "";
  currentUrl.hash = "";

  return currentUrl.toString();
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const applySession = useCallback((session: SpotifySessionResponse) => {
    if (session.authenticated) {
      setStatus("authenticated");
      setUser(session.user);
      return;
    }

    setStatus("unauthenticated");
    setUser(null);
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
    setErrorMessage(null);
    window.location.assign(getSignInUrl());
  }, []);

  const signOut = useCallback(async () => {
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
  }, []);

  return {
    errorMessage,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    refreshSession,
    signIn,
    signOut,
    status,
    user,
  };
}
