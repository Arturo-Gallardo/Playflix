"use client";

import { useCallback, useRef, useState } from "react";
import {
  readPlaylistListCache,
  writePlaylistListCache,
} from "../../lib/playlist/playlist-list-cache";
import type { SpotifyPlaylistSummary } from "../../types/spotify-playlist";

export type UserPlaylistsStatus = "idle" | "loading" | "ready" | "error";

type PlaylistsPagePayload = {
  hasMore: boolean;
  nextOffset: number | null;
  playlists: SpotifyPlaylistSummary[];
  total: number;
};

async function fetchPlaylistsPage(offset: number) {
  const response = await fetch(
    `/api/playlists?limit=50&offset=${offset}`,
    { cache: "no-store" },
  );

  const payload = (await response.json()) as PlaylistsPagePayload & {
    error?: string;
  };

  if (!response.ok) {
    throw new Error(payload.error ?? "Could not load your playlists.");
  }

  return payload;
}

function mergeUniquePlaylists(
  currentPlaylists: SpotifyPlaylistSummary[],
  nextPlaylists: SpotifyPlaylistSummary[],
) {
  const seenIds = new Set(currentPlaylists.map((playlist) => playlist.id));
  const merged = [...currentPlaylists];

  for (const playlist of nextPlaylists) {
    if (seenIds.has(playlist.id)) {
      continue;
    }

    seenIds.add(playlist.id);
    merged.push(playlist);
  }

  return merged;
}

export function useUserPlaylists() {
  const requestIdRef = useRef(0);
  const [playlists, setPlaylists] = useState<SpotifyPlaylistSummary[]>([]);
  const [status, setStatus] = useState<UserPlaylistsStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [nextOffset, setNextOffset] = useState<number | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const applyPage = useCallback(
    (
      page: PlaylistsPagePayload,
      append: boolean,
    ) => {
      setPlaylists((currentPlaylists) => {
        const mergedPlaylists = append
          ? mergeUniquePlaylists(currentPlaylists, page.playlists)
          : page.playlists;

        writePlaylistListCache({
          hasMore: page.hasMore,
          nextOffset: page.nextOffset,
          playlists: mergedPlaylists,
          total: page.total,
        });

        return mergedPlaylists;
      });
      setHasMore(page.hasMore);
      setNextOffset(page.nextOffset);
      setTotalCount(page.total);
      setStatus("ready");
    },
    [],
  );

  const loadPlaylists = useCallback(async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    const cachedEntry = readPlaylistListCache();

    if (cachedEntry) {
      setPlaylists(cachedEntry.playlists);
      setHasMore(cachedEntry.hasMore);
      setNextOffset(cachedEntry.nextOffset);
      setTotalCount(cachedEntry.total);
      setStatus("ready");
      setErrorMessage(null);
    } else {
      setStatus("loading");
      setErrorMessage(null);
    }

    try {
      const page = await fetchPlaylistsPage(0);

      if (requestIdRef.current !== requestId) {
        return null;
      }

      applyPage(page, false);
      return page.playlists;
    } catch (error) {
      if (requestIdRef.current !== requestId) {
        return null;
      }

      if (!cachedEntry) {
        setPlaylists([]);
        setStatus("error");
      }

      setErrorMessage(
        error instanceof Error ? error.message : "Could not load your playlists.",
      );
      return null;
    }
  }, [applyPage]);

  const loadMorePlaylists = useCallback(async () => {
    if (!hasMore || isLoadingMore || nextOffset === null) {
      return null;
    }

    setIsLoadingMore(true);

    try {
      const page = await fetchPlaylistsPage(nextOffset);
      applyPage(page, true);
      return page.playlists;
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Could not load more playlists.",
      );
      return null;
    } finally {
      setIsLoadingMore(false);
    }
  }, [applyPage, hasMore, isLoadingMore, nextOffset]);

  return {
    errorMessage,
    hasMore,
    isLoadingMore,
    loadMorePlaylists,
    loadPlaylists,
    playlists,
    status,
    totalCount,
  };
}
