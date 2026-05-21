"use client";

import {
  Redo2,
  Save,
  Settings,
  Trash2,
  Undo2,
  User,
} from "lucide-react";
import type { PlaylistLoadStatus } from "../../hooks/playlist/usePlaylistCovers";
import { CanvasZoomControls } from "../canvas/CanvasZoomControls";
import type { CanvasTile } from "../../lib/canvas/canvas-layout";
import type { SpotifyUserProfile } from "../../types/spotify-auth";
import type { SpotifyPlaylistSelection } from "../../types/spotify-playlist";
import { PlaylistPicker } from "./PlaylistPicker";
import { ToolbarAccountMenu } from "./ToolbarAccountMenu";
import { ToolbarCoverSearch } from "./ToolbarCoverSearch";
import { ToolbarPanButton } from "./ToolbarPanButton";
import { ToolbarPressButton } from "./ToolbarPressButton";
import { ToolbarTooltipWrap } from "./ToolbarTooltipWrap";

const toolbarIconClassName = "size-4";

type AppToolbarProps = {
  canFitAllTiles: boolean;
  canRedo: boolean;
  canSave: boolean;
  canUndo: boolean;
  canZoomIn: boolean;
  canZoomOut: boolean;
  errorMessage: string | null;
  hasTilesOnCanvas: boolean;
  isAuthenticated: boolean;
  onCanvasClear: () => void;
  onCanvasExport: () => void;
  onCanvasImport: (file: File) => Promise<void>;
  onCanvasRedo: () => void;
  onCanvasSave: () => void;
  onCanvasUndo: () => void;
  onFitAllTiles: () => void;
  onFocusCoverTile: (tileId: string) => void;
  onPlaylistLoad: (playlist: SpotifyPlaylistSelection) => Promise<void>;
  onSettingsOpen: () => void;
  onSignIn: () => void;
  onSignOut: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  playlistStatus: PlaylistLoadStatus;
  tiles: CanvasTile[];
  user: SpotifyUserProfile | null;
};

export function AppToolbar({
  canFitAllTiles,
  canRedo,
  canSave,
  canUndo,
  canZoomIn,
  canZoomOut,
  errorMessage,
  hasTilesOnCanvas,
  isAuthenticated,
  onCanvasClear,
  onCanvasExport,
  onCanvasImport,
  onCanvasRedo,
  onCanvasSave,
  onCanvasUndo,
  onFitAllTiles,
  onFocusCoverTile,
  onPlaylistLoad,
  onSettingsOpen,
  onSignIn,
  onSignOut,
  onZoomIn,
  onZoomOut,
  playlistStatus,
  tiles,
  user,
}: AppToolbarProps) {
  return (
    <header className="canvas-toolbar-enter pointer-events-none absolute inset-x-0 top-0 z-10 grid grid-cols-[1fr_auto_1fr] items-start gap-4 overflow-visible p-5">
      <PlaylistPicker
        disabled={!isAuthenticated}
        errorMessage={errorMessage}
        hasTilesOnCanvas={hasTilesOnCanvas}
        onCanvasExport={onCanvasExport}
        onCanvasImport={onCanvasImport}
        onLoad={onPlaylistLoad}
        status={playlistStatus}
      />

      <div className="relative z-20">
        <nav className="group pointer-events-auto -m-5 hidden items-center gap-3 p-5 sm:flex">
        <ToolbarTooltipWrap
          hint={canSave ? "Ctrl+S" : "Load a playlist first"}
          label="Save layout"
        >
          <ToolbarPanButton
            ariaLabel="save canvas layout"
            className="disabled:cursor-not-allowed disabled:opacity-35"
            disabled={!canSave || !isAuthenticated}
            onClick={onCanvasSave}
          >
            <Save
              aria-hidden="true"
              className={toolbarIconClassName}
              strokeWidth={1.8}
            />
          </ToolbarPanButton>
        </ToolbarTooltipWrap>
        <ToolbarTooltipWrap hint="Ctrl+K" label="Clear layout">
          <ToolbarPanButton
            ariaLabel="clear saved canvas layout"
            disabled={!isAuthenticated}
            onClick={onCanvasClear}
          >
            <Trash2
              aria-hidden="true"
              className={toolbarIconClassName}
              strokeWidth={1.8}
            />
          </ToolbarPanButton>
        </ToolbarTooltipWrap>
        <ToolbarTooltipWrap hint="Ctrl+Z" label="Undo">
          <ToolbarPanButton
            ariaLabel="undo tile move"
            disabled={!canUndo || !isAuthenticated}
            onClick={onCanvasUndo}
          >
            <Undo2
              aria-hidden="true"
              className={toolbarIconClassName}
              strokeWidth={1.8}
            />
          </ToolbarPanButton>
        </ToolbarTooltipWrap>
        <ToolbarTooltipWrap hint="Ctrl+Y" label="Redo">
          <ToolbarPanButton
            ariaLabel="redo tile move"
            disabled={!canRedo || !isAuthenticated}
            onClick={onCanvasRedo}
          >
            <Redo2
              aria-hidden="true"
              className={toolbarIconClassName}
              strokeWidth={1.8}
            />
          </ToolbarPanButton>
        </ToolbarTooltipWrap>
        </nav>
      </div>

      <div className="group pointer-events-auto -m-3 flex min-w-0 items-center justify-end gap-2 p-3">
        <ToolbarCoverSearch
          disabled={!hasTilesOnCanvas || !isAuthenticated}
          onFocusTile={onFocusCoverTile}
          tiles={tiles}
        />
        <CanvasZoomControls
          canFitAll={canFitAllTiles && isAuthenticated}
          canZoomIn={canZoomIn && isAuthenticated}
          canZoomOut={canZoomOut && isAuthenticated}
          onFitAll={onFitAllTiles}
          onZoomIn={onZoomIn}
          onZoomOut={onZoomOut}
        />
        {isAuthenticated && user ? (
          <ToolbarAccountMenu onSignOut={onSignOut} user={user} />
        ) : (
          <ToolbarTooltipWrap label="Sign in with Spotify">
            <ToolbarPressButton
              aria-label="sign in with spotify"
              onClick={onSignIn}
              variant="icon"
            >
              <User
                aria-hidden="true"
                className={toolbarIconClassName}
                strokeWidth={1.8}
              />
            </ToolbarPressButton>
          </ToolbarTooltipWrap>
        )}
        <ToolbarTooltipWrap label="Settings">
          <ToolbarPressButton
            aria-label="open settings"
            disabled={!isAuthenticated}
            onClick={onSettingsOpen}
            variant="icon"
          >
            <Settings aria-hidden="true" className="size-4" strokeWidth={1.8} />
          </ToolbarPressButton>
        </ToolbarTooltipWrap>
      </div>
    </header>
  );
}
