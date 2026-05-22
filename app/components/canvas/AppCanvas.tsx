"use client";

import { useState } from "react";
import { useSpotifyAuth } from "../../hooks/auth/useSpotifyAuth";
import { useWelcomeOverlay } from "../../hooks/canvas/useWelcomeOverlay";
import { useAppCanvas } from "../../hooks/canvas/useAppCanvas";
import { AppToolbar } from "../toolbar/AppToolbar";
import { ExportLayoutDialog } from "../toolbar/ExportLayoutDialog";
import { SettingsDialog } from "../toolbar/SettingsDialog";
import { CanvasEmptyState } from "./CanvasEmptyState";
import { CanvasErrorBoundary } from "./CanvasErrorBoundary";
import { CanvasOnboardingHints } from "./CanvasOnboardingHints";
import { CanvasShortcutLegend } from "./CanvasShortcutLegend";
import { CanvasOverlays } from "./overlays/CanvasOverlays";
import { WelcomeOverlay } from "./overlays/WelcomeOverlay";
import { CanvasCoverDetailsPanel } from "./viewport/CanvasCoverDetailsPanel";
import { CanvasViewport } from "./viewport/CanvasViewport";
import type { HoveredCoverDetails } from "./CoverGrid";
import { cn } from "../../lib/cn";

export function AppCanvas() {
  return (
    <main className="canvas-app-enter relative h-dvh overflow-hidden bg-[#111111] text-white">
      <AppCanvasRoot />
    </main>
  );
}

function AppCanvasRoot() {
  const auth = useSpotifyAuth();
  const canvas = useAppCanvas();
  const welcome = useWelcomeOverlay();
  const [stageKey, setStageKey] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  const isAppLocked = !auth.isAuthenticated;
  const showWelcomeOverlay =
    isAppLocked || (auth.isAuthenticated && welcome.isWelcomeVisible);

  return (
    <>
      <div
        aria-hidden={isAppLocked}
        className={cn(isAppLocked && "pointer-events-none select-none opacity-35")}
      >
        <AppToolbar
          canFitAllTiles={canvas.canFitAllTiles}
          canRedo={canvas.canRedoLayout}
          canSave={canvas.canSave}
          canUndo={canvas.canUndoLayout}
          canZoomIn={canvas.canZoomIn}
          canZoomOut={canvas.canZoomOut}
          errorMessage={canvas.errorMessage}
          hasTilesOnCanvas={canvas.tiles.length > 0}
          isAuthenticated={auth.isAuthenticated}
          isDemoMode={auth.isDemoMode}
          onCanvasClear={canvas.clearCanvas}
          onCanvasExport={() => setIsExportDialogOpen(true)}
          onCanvasImport={canvas.handleCanvasImport}
          onCanvasRedo={canvas.handleRedoLayout}
          onCanvasSave={canvas.saveCanvasNow}
          onCanvasUndo={canvas.handleUndoLayout}
          onFitAllTiles={canvas.handleFitAllTiles}
          onFocusCoverTile={canvas.handleFocusCoverTile}
          onPlaylistLoad={canvas.handlePlaylistLoad}
          onSettingsOpen={() => setIsSettingsOpen(true)}
          onSignIn={auth.signIn}
          onSignOut={() => {
            void auth.signOut();
          }}
          onSwitchAccount={auth.switchAccount}
          onZoomIn={canvas.handleZoomIn}
          onZoomOut={canvas.handleZoomOut}
          playlistStatus={canvas.playlistStatus}
          tiles={canvas.tiles}
          user={auth.user}
        />

        <CanvasErrorBoundary onReset={() => setStageKey((current) => current + 1)}>
          <AppCanvasStage
            canvas={canvas}
            isAppLocked={isAppLocked}
            isExportDialogOpen={isExportDialogOpen}
            key={stageKey}
            onCloseExport={() => setIsExportDialogOpen(false)}
            showOnboardingHints={
              auth.isAuthenticated && !welcome.isWelcomeVisible
            }
          />
        </CanvasErrorBoundary>
      </div>

      {showWelcomeOverlay ? (
        <WelcomeOverlay
          authError={auth.errorMessage}
          isAuthenticated={auth.isAuthenticated}
          isAuthLoading={auth.isLoading}
          onContinue={welcome.dismissWelcome}
          onSignIn={auth.signIn}
          user={auth.user}
        />
      ) : null}

      {isSettingsOpen && auth.isAuthenticated ? (
        <SettingsDialog
          areCoverDetailsHidden={canvas.areCoverDetailsHidden}
          isShortcutLegendVisible={canvas.isShortcutLegendVisible}
          isDemoMode={auth.isDemoMode}
          onClearPlaylistCache={canvas.handleClearPlaylistCache}
          onClearSavedLayout={canvas.handleClearSavedLayout}
          onClose={() => setIsSettingsOpen(false)}
          onCoverDetailsHiddenChange={canvas.setAreCoverDetailsHidden}
          onShortcutLegendVisibleChange={canvas.setIsShortcutLegendVisible}
          onSignOut={() => {
            void auth.signOut();
          }}
          onSwitchAccount={auth.switchAccount}
          user={auth.user}
        />
      ) : null}
    </>
  );
}

type AppCanvasStageProps = {
  canvas: ReturnType<typeof useAppCanvas>;
  isAppLocked: boolean;
  isExportDialogOpen: boolean;
  onCloseExport: () => void;
  showOnboardingHints: boolean;
};

function AppCanvasStage({
  canvas,
  isAppLocked,
  isExportDialogOpen,
  onCloseExport,
  showOnboardingHints,
}: AppCanvasStageProps) {
  const [hoveredCoverDetails, setHoveredCoverDetails] =
    useState<HoveredCoverDetails | null>(null);
  const { pointer } = canvas;

  return (
    <>
      {canvas.tiles.length === 0 && canvas.playlistStatus !== "loading" ? (
        <>
          <CanvasEmptyState isAuthenticated={!isAppLocked} />
          {showOnboardingHints ? <CanvasOnboardingHints isVisible /> : null}
        </>
      ) : null}

      <CanvasViewport
        bounds={canvas.bounds}
        cameraZoom={canvas.camera.zoom}
        dragModeType={pointer.dragMode?.type}
        isTileEnterActive={canvas.isTileEnterActive}
        movingTileIds={pointer.movingTileIds}
        onPointerCancel={pointer.handlePointerCancel}
        onPointerDown={pointer.handlePointerDown}
        onPointerMove={pointer.handlePointerMove}
        onPointerUp={pointer.handlePointerUp}
        onTileContextMenu={pointer.handleTileContextMenu}
        onTileDoubleClick={pointer.handleTileDoubleClick}
        onTilePointerDown={pointer.handleTilePointerDown}
        onCoverHover={setHoveredCoverDetails}
        onCoverHoverEnd={() => setHoveredCoverDetails(null)}
        onViewportContextMenu={pointer.handleViewportContextMenu}
        onWheel={pointer.handleWheel}
        selectionRect={pointer.selectionRect}
        selectedTileIds={canvas.validSelectedTileIds}
        viewportRef={canvas.viewportRef}
        visibleTiles={canvas.visibleTiles}
        worldLayerRef={canvas.worldLayerRef}
      />

      {hoveredCoverDetails && !canvas.areCoverDetailsHidden ? (
        <CanvasCoverDetailsPanel
          details={{
            ...hoveredCoverDetails,
            cover: canvas.resolveCoverForDisplay(hoveredCoverDetails.cover),
          }}
        />
      ) : null}

      {canvas.isShortcutLegendVisible ? (
        <CanvasShortcutLegend
          activeInteraction={pointer.activeCanvasInteraction}
          pointerModifiers={pointer.pointerModifiers}
        />
      ) : null}

      {isExportDialogOpen ? (
        <ExportLayoutDialog
          onClose={onCloseExport}
          onExport={canvas.handleCanvasExport}
        />
      ) : null}

      <CanvasOverlays
        closeContextMenu={canvas.closeContextMenu}
        contextMenuState={canvas.contextMenuState}
        handleContextMenuPaste={canvas.handleContextMenuPaste}
        handleCopyTiles={canvas.handleCopyTiles}
        handleDeleteTiles={canvas.handleDeleteTiles}
        handleOrderSelectedTiles={canvas.handleOrderSelectedTiles}
        isSlowPlaylistLoad={canvas.isSlowPlaylistLoad}
        loadNotification={canvas.loadNotification}
        menuCanPaste={canvas.menuCanPaste}
        playlistStatus={canvas.playlistStatus}
      />
    </>
  );
}
