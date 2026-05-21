"use client";

import { useRef, useState } from "react";
import { sampleCovers } from "../../data/sample-covers";
import type { PlaylistCover } from "../../types/playlist";

export type PlaylistLoadStatus = "idle" | "loading" | "ready" | "error";

export function usePlaylistCovers() {
  const requestIdRef = useRef(0);
  const [status, setStatus] = useState<PlaylistLoadStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function fetchPlaylist(playlist: string): Promise<PlaylistCover[] | null> {
    const trimmedPlaylist = playlist.trim();

    if (!trimmedPlaylist) {
      return null;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setStatus("loading");
    setErrorMessage(null);

    // Placeholder until Spotify API is wired — returns sample covers for valid links
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (requestIdRef.current !== requestId) {
      return null;
    }

    if (!isSpotifyPlaylistUrl(trimmedPlaylist)) {
      setStatus("error");
      setErrorMessage("Paste a valid Spotify playlist link.");
      return null;
    }

    const batchId = crypto.randomUUID().slice(0, 8);
    const covers = sampleCovers.map((cover, index) => ({
      ...cover,
      id: `${batchId}-${index + 1}`,
      url: trimmedPlaylist,
    }));

    setStatus("ready");
    return covers;
  }

  return {
    errorMessage,
    fetchPlaylist,
    status,
  };
}

function isSpotifyPlaylistUrl(value: string) {
  const normalized = value.toLowerCase();

  return (
    normalized.includes("open.spotify.com/playlist") ||
    normalized.startsWith("spotify:playlist:")
  );
}
