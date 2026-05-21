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
import { PlaylistInput } from "./PlaylistInput";
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
  onCanvasClear: () => void;
  onCanvasExport: () => void;
  onCanvasImport: (file: File) => Promise<void>;
  onCanvasRedo: () => void;
  onCanvasSave: () => void;
  onCanvasUndo: () => void;
  onFitAllTiles: () => void;
  onFocusCoverTile: (tileId: string) => void;
  onPlaylistLoad: (playlist: string) => Promise<void>;
  onSettingsOpen: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  playlistStatus: PlaylistLoadStatus;
  tiles: CanvasTile[];
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
  onZoomIn,
  onZoomOut,
  playlistStatus,
  tiles,
}: AppToolbarProps) {
  return (
    <header className="canvas-toolbar-enter pointer-events-none absolute inset-x-0 top-0 z-10 grid grid-cols-[1fr_auto_1fr] items-start gap-4 overflow-visible p-5">
      <PlaylistInput
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
            disabled={!canSave}
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
            disabled={!canUndo}
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
            disabled={!canRedo}
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
          disabled={!hasTilesOnCanvas}
          onFocusTile={onFocusCoverTile}
          tiles={tiles}
        />
        <CanvasZoomControls
          canFitAll={canFitAllTiles}
          canZoomIn={canZoomIn}
          canZoomOut={canZoomOut}
          onFitAll={onFitAllTiles}
          onZoomIn={onZoomIn}
          onZoomOut={onZoomOut}
        />
        <ToolbarTooltipWrap label="Log in">
          <ToolbarPressButton aria-label="log in" variant="icon">
            <User
              aria-hidden="true"
              className={toolbarIconClassName}
              strokeWidth={1.8}
            />
          </ToolbarPressButton>
        </ToolbarTooltipWrap>
        <ToolbarTooltipWrap label="Settings">
          <ToolbarPressButton
            aria-label="open settings"
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
