"use client";

import type { MouseEvent, PointerEvent, WheelEvent } from "react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { PlaylistCover } from "../data/sample-covers";
import { useCanvasCamera } from "../hooks/useCanvasCamera";
import { useCanvasPersistence } from "../hooks/useCanvasPersistence";
import { useCanvasTiles } from "../hooks/useCanvasTiles";
import {
  applyTileSnap,
  buildGrabOffsets,
  getVisibleCanvasTiles,
  getVisibleWorldRect,
  normalizeRect,
  rectsIntersect,
  screenToWorld,
  type CanvasTile,
  type Point,
  type Rect,
  type ViewportSize,
} from "../lib/canvas-layout";
import {
  buildPastedTileEntries,
  buildPastedTileEntriesAtWorldPoint,
  buildTileClipboardPayload,
  parseTileClipboardText,
  serializeTileClipboardPayload,
  type TileClipboardPayload,
} from "../lib/tile-clipboard";
import { AppToolbar } from "./AppToolbar";
import { CanvasContextMenu } from "./CanvasContextMenu";
import { CanvasEmptyState } from "./CanvasEmptyState";
import {
  CanvasShortcutLegend,
  type CanvasInteraction,
} from "./CanvasShortcutLegend";
import { CoverGrid, type HoveredCoverDetails } from "./CoverGrid";
import { SelectionBox } from "./SelectionBox";

const tileDragThreshold = 4;

type AppCanvasProps = {
  initialCovers: PlaylistCover[];
};

type DragMode =
  | {
      type: "pan";
      pointerId: number;
    }
  | {
      type: "moveTiles";
      pointerId: number;
      tileIds: Set<string>;
      grabOffsets: Map<string, Point>;
    }
  | {
      type: "pendingTile";
      pointerId: number;
      tileIds: Set<string>;
      startScreenPoint: Point;
      grabOffsets: Map<string, Point>;
    }
  | {
      type: "selectBox";
      pointerId: number;
      startWorldPoint: Point;
      currentWorldPoint: Point;
    };

type ContextMenuState = {
  clientX: number;
  clientY: number;
  worldPoint: Point;
};

function isInteractiveElement(target: EventTarget) {
  return (
    target instanceof Element && Boolean(target.closest("a, button, input"))
  );
}

export function AppCanvas({ initialCovers }: AppCanvasProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const didCenterInitialTilesRef = useRef(false);
  const centeredBatchRequestRef = useRef(0);
  const didSeedInitialCoversRef = useRef(false);
  const clipboardPayloadRef = useRef<TileClipboardPayload | null>(null);
  const pasteCountRef = useRef(0);
  const shiftHeldRef = useRef(false);

  const [centerBatchRequest, setCenterBatchRequest] = useState(0);
  const [dragMode, setDragMode] = useState<DragMode | null>(null);
  const [hoveredCoverDetails, setHoveredCoverDetails] =
    useState<HoveredCoverDetails | null>(null);
  const [viewportSize, setViewportSize] = useState<ViewportSize | null>(null);
  const [selectedTileIds, setSelectedTileIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [hasClipboard, setHasClipboard] = useState(false);
  const [playlistSources, setPlaylistSources] = useState<string[]>([]);
  const playlistSourcesRef = useRef(playlistSources);
  const panLastScreenPointRef = useRef<Point | null>(null);

  playlistSourcesRef.current = playlistSources;

  const {
    camera,
    centerCameraOnRect,
    getLiveCamera,
    panBy,
    resetCamera,
    restoreCamera,
    syncCamera,
    worldLayerRef,
    zoomAtPoint,
  } = useCanvasCamera();

  const saveCanvasSilentlyRef = useRef<() => void>(() => {});

  const getPlaylistSources = useCallback(
    () => playlistSourcesRef.current,
    [],
  );

  const {
    appendCoverTiles,
    beginTileDragCheckpoint,
    bounds,
    canUndo,
    commitTileDragCheckpoint,
    getCoversForSnapshot,
    getLayoutSnapshot,
    insertTilesAtPositions,
    movedTileIds,
    placeTilesAtWorldPoint,
    redoTiles,
    removeTilesByIds,
    resetTileState,
    restoreTileState,
    revertTileDragCheckpoint,
    tiles,
    undoTiles,
  } = useCanvasTiles({
    getPlaylistSources,
    onLayoutCommitted: () => {
      saveCanvasSilentlyRef.current();
    },
    onPlaylistSourcesRestore: setPlaylistSources,
  });

  const tilesLayoutKey = useMemo(
    () =>
      tiles
        .map((tile) => `${tile.id}:${tile.x}:${tile.y}`)
        .join("|"),
    [tiles],
  );

  const {
    clearCanvas,
    hasFinishedInitialRestore,
    saveCanvasSilently,
    undoClear,
  } = useCanvasPersistence({
    camera,
    getCoversForSnapshot,
    getLayoutSnapshot,
    getLiveCamera,
    getPlaylistSources,
    hasTiles: tiles.length > 0,
    onCanvasClear: () => {
      setSelectedTileIds(new Set());
      didSeedInitialCoversRef.current = false;
    },
    playlistSourcesKey: playlistSources.join("|"),
    resetCamera,
    resetTileState,
    restoreCamera,
    restoreTileState,
    setPlaylistSources,
    tilesLayoutKey,
  });

  saveCanvasSilentlyRef.current = saveCanvasSilently;

  function screenPointToWorld(screenPoint: Point) {
    return screenToWorld(screenPoint, getLiveCamera());
  }

  const selectionRect = getSelectionRect(dragMode);
  const movingTileIds =
    dragMode?.type === "moveTiles" ? dragMode.tileIds : new Set<string>();
  const activeInteraction = getActiveInteraction(dragMode);

  const visibleTiles = useMemo(() => {
    if (!viewportSize) {
      return [];
    }

    return getVisibleCanvasTiles({
      tiles,
      cameraZoom: camera.zoom,
      movedTileIds,
      visibleRect: getVisibleWorldRect({
        camera,
        viewportSize,
      }),
    });
  }, [camera, movedTileIds, tiles, viewportSize]);

  const selectedTiles = useMemo(
    () => tiles.filter((tile) => selectedTileIds.has(tile.id)),
    [selectedTileIds, tiles],
  );

  useLayoutEffect(() => {
    const viewportElement = viewportRef.current;

    if (!viewportElement) {
      return;
    }

    function updateViewportSize() {
      if (!viewportElement) {
        return;
      }

      const rect = viewportElement.getBoundingClientRect();
      setViewportSize({
        height: rect.height,
        width: rect.width,
      });
    }

    updateViewportSize();

    const resizeObserver = new ResizeObserver(updateViewportSize);
    resizeObserver.observe(viewportElement);

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!hasFinishedInitialRestore || didSeedInitialCoversRef.current) {
      return;
    }

    if (tiles.length > 0) {
      didSeedInitialCoversRef.current = true;
      return;
    }

    didSeedInitialCoversRef.current = true;
    appendCoverTiles(initialCovers, "seed");
    setPlaylistSources(["sample"]);
    setCenterBatchRequest((currentRequest) => currentRequest + 1);
  }, [
    appendCoverTiles,
    hasFinishedInitialRestore,
    initialCovers,
    tiles.length,
  ]);

  useLayoutEffect(() => {
    if (!viewportSize || tiles.length === 0) {
      return;
    }

    const shouldCenterInitialTiles = !didCenterInitialTilesRef.current;
    const shouldCenterLoadedBatch =
      centerBatchRequest > centeredBatchRequestRef.current;

    if (!shouldCenterInitialTiles && !shouldCenterLoadedBatch) {
      return;
    }

    centerCameraOnRect(bounds, viewportSize);
    didCenterInitialTilesRef.current = true;
    centeredBatchRequestRef.current = centerBatchRequest;
  }, [bounds, centerBatchRequest, centerCameraOnRect, tiles.length, viewportSize]);

  const copySelectedTiles = useCallback(() => {
    const payload = buildTileClipboardPayload(selectedTiles);

    if (!payload) {
      return false;
    }

    clipboardPayloadRef.current = payload;
    pasteCountRef.current = 0;
    setHasClipboard(true);

    void navigator.clipboard.writeText(serializeTileClipboardPayload(payload)).catch(
      () => {
        // internal clipboard ref still works if system clipboard is blocked
      },
    );

    setSelectedTileIds(new Set());
    return true;
  }, [selectedTiles]);

  const pasteTiles = useCallback(
    (worldPoint?: Point) => {
      const payload = clipboardPayloadRef.current;

      if (!payload) {
        return false;
      }

      pasteCountRef.current += 1;
      const batchId = `paste:${Date.now()}`;
      const entries = worldPoint
        ? buildPastedTileEntriesAtWorldPoint(payload, worldPoint)
        : buildPastedTileEntries(payload, pasteCountRef.current);
      const newTileIds = insertTilesAtPositions(entries, batchId);

      if (newTileIds.length > 0) {
        setSelectedTileIds(new Set(newTileIds));
      }

      return newTileIds.length > 0;
    },
    [insertTilesAtPositions],
  );

  const deleteSelectedTiles = useCallback(() => {
    if (selectedTileIds.size === 0) {
      return false;
    }

    removeTilesByIds(selectedTileIds);
    setSelectedTileIds(new Set());
    return true;
  }, [removeTilesByIds, selectedTileIds]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (isEditableTarget(event.target)) {
        return;
      }

      shiftHeldRef.current = event.shiftKey;

      const isMod = event.ctrlKey || event.metaKey;

      if (isMod && event.code === "KeyZ" && !event.shiftKey) {
        event.preventDefault();
        if (canUndo) {
          undoTiles();
        } else {
          undoClear();
        }
        return;
      }

      if (
        isMod &&
        (event.code === "KeyY" || (event.code === "KeyZ" && event.shiftKey))
      ) {
        event.preventDefault();
        redoTiles();
        return;
      }

      if (isMod && event.code === "KeyC") {
        event.preventDefault();
        copySelectedTiles();
        return;
      }

      if (isMod && event.code === "KeyV") {
        event.preventDefault();
        void readClipboardAndPaste();
        return;
      }

      if (event.code === "Backspace" || event.code === "Delete") {
        event.preventDefault();
        deleteSelectedTiles();
        return;
      }

      if (event.code === "Escape") {
        setSelectedTileIds(new Set());
        setContextMenu(null);
      }
    }

    function handleKeyUp(event: KeyboardEvent) {
      shiftHeldRef.current = event.shiftKey;
    }

    async function readClipboardAndPaste() {
      try {
        const clipboardText = await navigator.clipboard.readText();
        const parsedPayload = parseTileClipboardText(clipboardText);

        if (parsedPayload) {
          clipboardPayloadRef.current = parsedPayload;
          setHasClipboard(true);
        }
      } catch {
        // fall back to the in-memory clipboard payload
      }

      pasteTiles();
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [
    canUndo,
    copySelectedTiles,
    deleteSelectedTiles,
    pasteTiles,
    redoTiles,
    undoClear,
    undoTiles,
  ]);

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (isInteractiveElement(event.target)) {
      return;
    }

    if (event.button !== 0 && event.button !== 1) {
      return;
    }

    setContextMenu(null);

    const screenPoint = getViewportPoint(event, viewportRef.current);
    const worldPoint = screenPointToWorld(screenPoint);

    event.currentTarget.setPointerCapture(event.pointerId);

    if (shouldPanCanvas(event)) {
      panLastScreenPointRef.current = screenPoint;
      setDragMode({
        type: "pan",
        pointerId: event.pointerId,
      });
      return;
    }

    setSelectedTileIds(new Set());
    setDragMode({
      type: "selectBox",
      pointerId: event.pointerId,
      startWorldPoint: worldPoint,
      currentWorldPoint: worldPoint,
    });
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!dragMode || dragMode.pointerId !== event.pointerId) {
      return;
    }

    const screenPoint = getViewportPoint(event, viewportRef.current);
    let worldPoint = screenPointToWorld(screenPoint);

    if (dragMode.type === "pan") {
      const lastScreenPoint = panLastScreenPointRef.current;

      if (lastScreenPoint) {
        panBy({
          x: screenPoint.x - lastScreenPoint.x,
          y: screenPoint.y - lastScreenPoint.y,
        });
      }

      panLastScreenPointRef.current = screenPoint;
      return;
    }

    if (dragMode.type === "moveTiles" || dragMode.type === "pendingTile") {
      if (event.shiftKey || shiftHeldRef.current) {
        worldPoint = applyTileSnap(
          worldPoint,
          dragMode.tileIds,
          dragMode.grabOffsets,
          tiles,
        );
      }
    }

    if (dragMode.type === "moveTiles") {
      placeTilesAtWorldPoint(
        dragMode.tileIds,
        worldPoint,
        dragMode.grabOffsets,
      );
      return;
    }

    if (dragMode.type === "pendingTile") {
      const movedDistance = getDistance(dragMode.startScreenPoint, screenPoint);

      if (movedDistance < tileDragThreshold) {
        return;
      }

      beginTileDragCheckpoint();
      placeTilesAtWorldPoint(
        dragMode.tileIds,
        worldPoint,
        dragMode.grabOffsets,
      );
      setDragMode({
        type: "moveTiles",
        pointerId: dragMode.pointerId,
        tileIds: dragMode.tileIds,
        grabOffsets: dragMode.grabOffsets,
      });
      return;
    }

    setDragMode({
      ...dragMode,
      currentWorldPoint: worldPoint,
    });
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    if (!dragMode || dragMode.pointerId !== event.pointerId) {
      return;
    }

    if (dragMode.type === "pan") {
      syncCamera();
      panLastScreenPointRef.current = null;
    }

    if (dragMode.type === "moveTiles") {
      commitTileDragCheckpoint();
    }

    if (dragMode.type === "pendingTile") {
      cancelTileDrag();
    }

    if (dragMode.type === "selectBox") {
      const rect = normalizeRect(
        dragMode.startWorldPoint,
        dragMode.currentWorldPoint,
      );
      const selectedIds = getTilesInsideRect(tiles, rect);
      setSelectedTileIds(selectedIds);
    }

    setDragMode(null);
  }

  function cancelTileDrag() {
    revertTileDragCheckpoint();
  }

  function handleTilePointerDown(
    event: PointerEvent<HTMLDivElement>,
    tile: CanvasTile,
  ) {
    if (event.button !== 0) {
      return;
    }

    event.stopPropagation();
    setContextMenu(null);

    if (event.detail >= 2) {
      handleTileDoubleClick(tile);
      return;
    }

    const nextSelectedTileIds = getNextSelectedTileIds({
      isAdditive: event.shiftKey || event.ctrlKey || event.metaKey,
      selectedTileIds,
      tileId: tile.id,
    });
    const startScreenPoint = getViewportPoint(event, viewportRef.current);
    const grabOffsets = buildGrabOffsets(
      nextSelectedTileIds,
      tiles,
      screenPointToWorld(startScreenPoint),
    );

    viewportRef.current?.setPointerCapture(event.pointerId);

    setSelectedTileIds(nextSelectedTileIds);
    setDragMode({
      type: "pendingTile",
      pointerId: event.pointerId,
      tileIds: nextSelectedTileIds,
      startScreenPoint,
      grabOffsets,
    });
  }

  function handleTileDoubleClick(
    tile: CanvasTile,
    _source: "react-double-click" | "pointer-detail" = "react-double-click",
  ) {
    void _source;
    window.open(tile.cover.url, "_blank", "noreferrer");
    setDragMode(null);
  }

  function handleTileContextMenu(
    event: MouseEvent<HTMLDivElement>,
    tile: CanvasTile,
  ) {
    event.preventDefault();
    event.stopPropagation();

    const nextSelectedTileIds = selectedTileIds.has(tile.id)
      ? selectedTileIds
      : new Set([tile.id]);

    setSelectedTileIds(nextSelectedTileIds);

    const screenPoint = getViewportPoint(event, viewportRef.current);

    setContextMenu({
      clientX: event.clientX,
      clientY: event.clientY,
      worldPoint: screenPointToWorld(screenPoint),
    });
  }

  function handleCanvasContextMenu(event: MouseEvent<HTMLDivElement>) {
    if (isInteractiveElement(event.target)) {
      return;
    }

    event.preventDefault();

    const screenPoint = getViewportPoint(event, viewportRef.current);

    setContextMenu({
      clientX: event.clientX,
      clientY: event.clientY,
      worldPoint: screenPointToWorld(screenPoint),
    });
  }

  function handleWheel(event: WheelEvent<HTMLDivElement>) {
    event.preventDefault();

    const rect = viewportRef.current?.getBoundingClientRect();
    const zoomDirection = event.deltaY > 0 ? -1 : 1;

    zoomAtPoint(
      {
        x: event.clientX - (rect?.left ?? 0),
        y: event.clientY - (rect?.top ?? 0),
      },
      camera.zoom + zoomDirection * 0.12,
    );
  }

  const pointerModifiers = {
    alt: Boolean(dragMode?.type === "pan"),
    mod: false,
    primaryDown: dragMode !== null,
    shift: shiftHeldRef.current,
  };

  return (
    <main className="relative h-dvh overflow-hidden bg-[#111111] text-white">
      <AppToolbar onClearCanvas={clearCanvas} />

      <div
        className={`absolute inset-0 touch-none select-none bg-[radial-gradient(circle,_rgba(255,255,255,0.16)_1px,_transparent_1px)] [background-size:20px_20px] ${
          dragMode?.type === "pan" ? "cursor-grabbing" : "cursor-crosshair"
        }`}
        onContextMenu={handleCanvasContextMenu}
        onPointerCancel={() => {
          if (dragMode?.type === "pan") {
            syncCamera();
            panLastScreenPointRef.current = null;
          }

          if (dragMode?.type === "moveTiles") {
            cancelTileDrag();
          }

          setDragMode(null);
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
        ref={viewportRef}
      >
        <div
          className="origin-top-left will-change-transform"
          ref={worldLayerRef}
        >
          <CoverGrid
            bounds={bounds}
            movingTileIds={movingTileIds}
            onCoverHover={setHoveredCoverDetails}
            onCoverHoverEnd={() => setHoveredCoverDetails(null)}
            onTileContextMenu={handleTileContextMenu}
            onTileDoubleClick={handleTileDoubleClick}
            onTilePointerDown={handleTilePointerDown}
            selectedTileIds={selectedTileIds}
            visibleTiles={visibleTiles}
          />
          {selectionRect ? <SelectionBox rect={selectionRect} /> : null}
        </div>
      </div>

      {tiles.length === 0 ? <CanvasEmptyState /> : null}

      {hoveredCoverDetails ? (
        <aside className="pointer-events-none fixed bottom-5 left-5 z-20 max-w-md rounded-md border border-white/15 bg-[#111111]/45 p-3 shadow-2xl backdrop-blur-sm">
          <span className="font-control absolute right-3 top-3 rounded-full border border-white/15 bg-white/10 px-2 py-1 text-[10px] font-semibold text-white/60">
            {String(hoveredCoverDetails.index + 1).padStart(2, "0")}
          </span>
          <p className="font-control pr-10 text-sm font-semibold leading-5 text-white drop-shadow">
            {hoveredCoverDetails.cover.title}
          </p>
          <p className="font-control mt-2 text-[10px] uppercase tracking-[0.24em] text-white/45">
            double-click to open on spotify
          </p>
        </aside>
      ) : null}

      <CanvasShortcutLegend
        activeInteraction={activeInteraction}
        pointerModifiers={pointerModifiers}
      />

      {contextMenu ? (
        <CanvasContextMenu
          canCopy={selectedTiles.length > 0}
          canPaste={hasClipboard}
          clientX={contextMenu.clientX}
          clientY={contextMenu.clientY}
          onClose={() => setContextMenu(null)}
          onCopy={copySelectedTiles}
          onPaste={() => {
            pasteTiles(contextMenu.worldPoint);
          }}
        />
      ) : null}
    </main>
  );
}

function getViewportPoint(
  event: PointerEvent<Element> | MouseEvent<Element>,
  viewportElement: HTMLElement | null,
): Point {
  const rect = viewportElement?.getBoundingClientRect();

  return {
    x: event.clientX - (rect?.left ?? 0),
    y: event.clientY - (rect?.top ?? 0),
  };
}

function getDistance(firstPoint: Point, secondPoint: Point) {
  return Math.hypot(firstPoint.x - secondPoint.x, firstPoint.y - secondPoint.y);
}

function shouldPanCanvas(event: PointerEvent<Element>) {
  return event.altKey || event.button === 1;
}

function getSelectionRect(dragMode: DragMode | null): Rect | null {
  if (dragMode?.type !== "selectBox") {
    return null;
  }

  return normalizeRect(dragMode.startWorldPoint, dragMode.currentWorldPoint);
}

function getTilesInsideRect(tiles: CanvasTile[], rect: Rect) {
  const selectedIds = new Set<string>();

  for (const tile of tiles) {
    if (rectsIntersect(tile, rect)) {
      selectedIds.add(tile.id);
    }
  }

  return selectedIds;
}

function getNextSelectedTileIds({
  isAdditive,
  selectedTileIds,
  tileId,
}: {
  isAdditive: boolean;
  selectedTileIds: Set<string>;
  tileId: string;
}) {
  if (!isAdditive) {
    return selectedTileIds.has(tileId) ? selectedTileIds : new Set([tileId]);
  }

  const nextSelectedTileIds = new Set(selectedTileIds);

  if (nextSelectedTileIds.has(tileId)) {
    nextSelectedTileIds.delete(tileId);
  } else {
    nextSelectedTileIds.add(tileId);
  }

  return nextSelectedTileIds;
}

function getActiveInteraction(dragMode: DragMode | null): CanvasInteraction {
  if (dragMode?.type === "pan") {
    return "pan";
  }

  if (dragMode?.type === "moveTiles" || dragMode?.type === "pendingTile") {
    return "moveTiles";
  }

  return null;
}

function isEditableTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    Boolean(target.closest("input, textarea, [contenteditable='true']"))
  );
}
