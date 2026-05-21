"use client";

import { useRef, useState } from "react";
import type { PlaylistCover } from "../../types/playlist";
import type { PlaylistCoversPageResponse } from "../../types/spotify-playlist";

export type PlaylistLoadStatus = "idle" | "loading" | "ready" | "error";

type LoadPlaylistProgressivelyOptions = {
  onBatch: (covers: PlaylistCover[]) => void;
};

async function fetchCoverPage(playlistId: string, cursor: string | null) {
  const trimmedPlaylistId = playlistId.trim();
  const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
  const response = await fetch(
    `/api/playlists/${encodeURIComponent(trimmedPlaylistId)}/covers${query}`,
    { cache: "no-store" },
  );

  const payload = (await response.json()) as PlaylistCoversPageResponse;

  if (!response.ok || "error" in payload) {
    throw new Error(
      "error" in payload ? payload.error : "Could not load that playlist.",
    );
  }

  return payload;
}

export function usePlaylistCovers() {
  const requestIdRef = useRef(0);
  const [status, setStatus] = useState<PlaylistLoadStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function loadPlaylistProgressively(
    playlistId: string,
    { onBatch }: LoadPlaylistProgressivelyOptions,
  ): Promise<number | null> {
    const trimmedPlaylistId = playlistId.trim();

    if (!trimmedPlaylistId) {
      return null;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setStatus("loading");
    setErrorMessage(null);

    let totalTracks = 0;
    let nextCursor: string | null = null;

    try {
      while (true) {
        const payload = await fetchCoverPage(trimmedPlaylistId, nextCursor);

        if (requestIdRef.current !== requestId) {
          return null;
        }

        if (payload.covers.length > 0) {
          onBatch(payload.covers);
          totalTracks += payload.covers.length;
        }

        if (!payload.hasMore || !payload.nextCursor) {
          break;
        }

        nextCursor = payload.nextCursor;
      }

      if (requestIdRef.current !== requestId) {
        return null;
      }

      if (totalTracks === 0) {
        setStatus("error");
        setErrorMessage("That playlist has no tracks to show.");
        return null;
      }

      setStatus("ready");
      return totalTracks;
    } catch (error) {
      if (requestIdRef.current !== requestId) {
        return null;
      }

      if (totalTracks > 0) {
        setStatus("ready");
        setErrorMessage(
          error instanceof Error
            ? `${error.message} Some tracks were still added.`
            : "Some tracks could not be loaded.",
        );
        return totalTracks;
      }

      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Could not load that playlist.",
      );
      return null;
    }
  }

  return {
    errorMessage,
    loadPlaylistProgressively,
    status,
  };
}
