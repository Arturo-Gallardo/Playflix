"use client";

import { useEffect } from "react";

/**
 * Spotify dev redirect URIs must use 127.0.0.1. Bounce localhost to loopback
 * without Next middleware (broken on Next.js 16 dev in this project).
 */
export function SpotifyDevHostRedirect() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") {
      return;
    }

    if (window.location.hostname !== "localhost") {
      return;
    }

    const nextUrl = new URL(window.location.href);
    nextUrl.hostname = "127.0.0.1";
    window.location.replace(nextUrl.toString());
  }, []);

  return null;
}
