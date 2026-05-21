"use client";

import {
  ChevronDown,
  Download,
  Library,
  Loader2,
  Search,
  Upload,
} from "lucide-react";
import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type UIEvent,
} from "react";
import { createPortal } from "react-dom";
import type { PlaylistLoadStatus } from "../../hooks/playlist/usePlaylistCovers";
import { useUserPlaylists } from "../../hooks/playlist/useUserPlaylists";
import { canvasLayoutFileExtension } from "../../lib/canvas/canvas-import-export";
import type { SpotifyPlaylistSelection } from "../../types/spotify-playlist";
import { ToolbarPressButton } from "./ToolbarPressButton";
import { ToolbarTooltipWrap } from "./ToolbarTooltipWrap";

const toolbarIconClassName = "size-4";

type PlaylistPickerProps = {
  disabled?: boolean;
  errorMessage: string | null;
  hasTilesOnCanvas: boolean;
  onCanvasExport: () => void;
  onCanvasImport: (file: File) => Promise<void>;
  onLoad: (playlist: SpotifyPlaylistSelection) => Promise<void>;
  status: PlaylistLoadStatus;
};

type PanelPosition = {
  left: number;
  top: number;
  width: number;
};

export function PlaylistPicker({
  disabled = false,
  errorMessage,
  hasTilesOnCanvas,
  onCanvasExport,
  onCanvasImport,
  onLoad,
  status,
}: PlaylistPickerProps) {
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const [panelPosition, setPanelPosition] = useState<PanelPosition>({
    left: 0,
    top: 0,
    width: 320,
  });

  const {
    errorMessage: playlistsError,
    hasMore,
    isLoadingMore,
    loadMorePlaylists,
    loadPlaylists,
    playlists,
    status: playlistsStatus,
  } = useUserPlaylists();

  const isLoadingPlaylist = status === "loading";
  const isLoadingList = playlistsStatus === "loading" && playlists.length === 0;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (disabled) {
      return;
    }

    void loadPlaylists();
  }, [disabled, loadPlaylists]);

  useEffect(() => {
    if (!isOpen || disabled) {
      return;
    }

    if (playlistsStatus === "idle") {
      void loadPlaylists();
    }
  }, [disabled, isOpen, loadPlaylists, playlistsStatus]);

  useLayoutEffect(() => {
    if (!isOpen) {
      return;
    }

    function updatePanelPosition() {
      const triggerElement = triggerRef.current;

      if (!triggerElement) {
        return;
      }

      const rect = triggerElement.getBoundingClientRect();
      const padding = 8;
      const width = Math.max(rect.width, 320);
      const maxLeft = Math.max(padding, window.innerWidth - width - padding);

      setPanelPosition({
        left: Math.min(Math.max(padding, rect.left), maxLeft),
        top: rect.bottom + 8,
        width,
      });
    }

    function handleScroll(event: Event) {
      const target = event.target;

      if (target instanceof Node && panelRef.current?.contains(target)) {
        return;
      }

      updatePanelPosition();
    }

    updatePanelPosition();
    window.addEventListener("resize", updatePanelPosition);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      window.removeEventListener("resize", updatePanelPosition);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target;

      if (!(target instanceof Node)) {
        return;
      }

      if (
        rootRef.current?.contains(target) ||
        panelRef.current?.contains(target)
      ) {
        return;
      }

      setIsOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const filteredPlaylists = useMemo(() => {
    const query = filter.trim().toLowerCase();

    if (!query) {
      return playlists;
    }

    return playlists.filter((playlist) =>
      playlist.name.toLowerCase().includes(query),
    );
  }, [filter, playlists]);

  const visibleError = errorMessage ?? playlistsError;

  async function handleSelect(playlist: SpotifyPlaylistSelection) {
    setIsOpen(false);
    setFilter("");
    await onLoad(playlist);
  }

  function handleListScroll(event: UIEvent<HTMLDivElement>) {
    if (!hasMore || isLoadingMore) {
      return;
    }

    const listElement = event.currentTarget;
    const remainingScroll =
      listElement.scrollHeight - listElement.scrollTop - listElement.clientHeight;

    if (remainingScroll > 72) {
      return;
    }

    void loadMorePlaylists();
  }

  function handleImportClick() {
    importInputRef.current?.click();
  }

  async function handleImportFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    await onCanvasImport(file);
  }

  return (
    <div className="pointer-events-auto flex min-w-0 items-center gap-3">
      <div className="toolbar-logo font-logo">SP</div>

      <div className="min-w-0" data-onboarding-target="playlist-picker" ref={rootRef}>
        <button
          aria-controls={isOpen ? listboxId : undefined}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          className="toolbar-playlist-trigger"
          disabled={disabled || isLoadingPlaylist}
          onClick={() => setIsOpen((current) => !current)}
          ref={triggerRef}
          type="button"
        >
          {isLoadingPlaylist ? (
            <Loader2
              aria-hidden="true"
              className="toolbar-playlist-trigger-icon animate-spin"
              strokeWidth={1.8}
            />
          ) : (
            <Library
              aria-hidden="true"
              className="toolbar-playlist-trigger-icon"
              strokeWidth={1.8}
            />
          )}
          <span className="toolbar-playlist-trigger-label">
            {hasTilesOnCanvas ? "Add a playlist" : "Your playlists"}
          </span>
          <ChevronDown
            aria-hidden="true"
            className="toolbar-playlist-trigger-chevron"
            strokeWidth={1.8}
          />
        </button>

        {visibleError ? (
          <p className="font-control mt-2 max-w-80 text-xs text-[#1DB954]">
            {visibleError}
          </p>
        ) : null}
      </div>

      {isMounted && isOpen
        ? createPortal(
            <div
              className="toolbar-playlist-panel font-control"
              ref={panelRef}
              style={{
                left: `${panelPosition.left}px`,
                top: `${panelPosition.top}px`,
                width: `${panelPosition.width}px`,
              }}
            >
              <div className="toolbar-playlist-panel-search">
                <Search
                  aria-hidden="true"
                  className="toolbar-playlist-panel-search-icon"
                  size={14}
                  strokeWidth={1.8}
                />
                <input
                  aria-label="Filter playlists"
                  autoComplete="off"
                  className="toolbar-playlist-panel-search-input"
                  onChange={(event) => setFilter(event.target.value)}
                  placeholder="Filter playlists"
                  spellCheck={false}
                  type="text"
                  value={filter}
                />
              </div>

              <div className="toolbar-playlist-panel-meta">
                {isLoadingList
                  ? "Loading your playlists…"
                  : hasMore
                    ? `${playlists.length} playlists · scroll for more`
                    : `${filteredPlaylists.length} loadable playlist${filteredPlaylists.length === 1 ? "" : "s"}`}
              </div>

              <div
                className="toolbar-playlist-list-scroll"
                onScroll={handleListScroll}
                onWheel={(event) => {
                  event.stopPropagation();
                }}
              >
                <ul
                  aria-label="Your Spotify playlists"
                  className="toolbar-playlist-list"
                  id={listboxId}
                  role="listbox"
                >
                {isLoadingList ? (
                  <PlaylistSkeletonRows count={4} />
                ) : filteredPlaylists.length === 0 ? (
                  <li className="toolbar-playlist-empty">
                    {playlists.length === 0
                      ? "No playlists found on your account."
                      : "No playlists match your filter."}
                  </li>
                ) : (
                  filteredPlaylists.map((playlist, index) => (
                    <li key={`${playlist.id}-${index}`} role="presentation">
                      <button
                        className="toolbar-playlist-option"
                        onClick={() => {
                          void handleSelect(playlist);
                        }}
                        role="option"
                        type="button"
                      >
                        {playlist.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            alt=""
                            className="toolbar-playlist-option-cover"
                            height={40}
                            src={playlist.imageUrl}
                            width={40}
                          />
                        ) : (
                          <span className="toolbar-playlist-option-cover-fallback">
                            <Library aria-hidden="true" className="size-4" />
                          </span>
                        )}
                        <span className="min-w-0 flex-1 text-left">
                          <span className="toolbar-playlist-option-title">
                            {playlist.name}
                          </span>
                          <span className="toolbar-playlist-option-meta">
                            {playlist.trackCount}{" "}
                            {playlist.trackCount === 1 ? "track" : "tracks"}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))
                )}
                {isLoadingMore ? (
                  <li className="toolbar-playlist-loading-more">Loading more…</li>
                ) : null}
                </ul>
              </div>
            </div>,
            document.body,
          )
        : null}

      <ToolbarTooltipWrap label="Export layout">
        <ToolbarPressButton
          aria-label="export layout"
          disabled={!hasTilesOnCanvas}
          onClick={onCanvasExport}
          variant="icon"
        >
          <Upload
            aria-hidden="true"
            className={toolbarIconClassName}
            strokeWidth={1.8}
          />
        </ToolbarPressButton>
      </ToolbarTooltipWrap>
      <ToolbarTooltipWrap label="Import layout">
        <ToolbarPressButton
          aria-label="import layout"
          onClick={handleImportClick}
          variant="icon"
        >
          <Download
            aria-hidden="true"
            className={toolbarIconClassName}
            strokeWidth={1.8}
          />
        </ToolbarPressButton>
      </ToolbarTooltipWrap>
      <input
        accept={`application/json,${canvasLayoutFileExtension},.json`}
        className="sr-only"
        onChange={(event) => {
          void handleImportFileChange(event);
        }}
        ref={importInputRef}
        type="file"
      />
    </div>
  );
}

function PlaylistSkeletonRows({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <li
          aria-hidden="true"
          className="toolbar-playlist-skeleton-row"
          key={`playlist-skeleton-${index}`}
        >
          <span className="toolbar-playlist-skeleton-cover" />
          <span className="toolbar-playlist-skeleton-lines">
            <span className="toolbar-playlist-skeleton-line toolbar-playlist-skeleton-line-long" />
            <span className="toolbar-playlist-skeleton-line toolbar-playlist-skeleton-line-short" />
          </span>
        </li>
      ))}
    </>
  );
}
