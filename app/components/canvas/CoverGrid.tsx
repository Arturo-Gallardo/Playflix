import type { MouseEvent, PointerEvent } from "react";
import type {
  CanvasTile,
  Rect,
  VisibleCanvasTile,
} from "../../lib/canvas/canvas-layout";
import { cn } from "../../lib/cn";
import type { PlaylistCover } from "../../types/playlist";
import { CoverCard } from "./CoverCard";

export type HoveredCoverDetails = {
  index: number;
  cover: PlaylistCover;
};

type CoverGridProps = {
  bounds: Rect;
  cameraZoom: number;
  isTileEnterActive: boolean;
  movingTileIds: Set<string>;
  onTileDoubleClick: (
    tile: CanvasTile,
    source: "react-double-click",
  ) => void;
  onCoverHover: (details: HoveredCoverDetails) => void;
  onCoverHoverEnd: () => void;
  onTileContextMenu: (
    event: MouseEvent<HTMLDivElement>,
    tile: CanvasTile,
  ) => void;
  onTilePointerDown: (
    event: PointerEvent<HTMLDivElement>,
    tile: CanvasTile,
  ) => void;
  selectedTileIds: Set<string>;
  visibleTiles: VisibleCanvasTile[];
};

export function CoverGrid({
  bounds,
  isTileEnterActive,
  movingTileIds,
  onTileDoubleClick,
  onCoverHover,
  onCoverHoverEnd,
  onTileContextMenu,
  onTilePointerDown,
  selectedTileIds,
  visibleTiles,
}: CoverGridProps) {
  return (
    <section
      className="relative"
      style={{
        height: Math.max(1, bounds.y + bounds.height),
        width: Math.max(1, bounds.x + bounds.width),
      }}
    >
      {visibleTiles.map((tile) => (
        <div
          className={cn(
            "absolute",
            isTileEnterActive && "canvas-tile-enter",
          )}
          key={`${tile.index}:${tile.id}`}
          style={{
            animationDelay: isTileEnterActive
              ? `${Math.min(tile.index, 48) * 16}ms`
              : undefined,
            height: tile.height,
            left: tile.x,
            top: tile.y,
            width: tile.width,
          }}
        >
          <CoverCard
            cover={tile.cover}
            index={tile.index}
            isMoving={movingTileIds.has(tile.id)}
            isSelected={selectedTileIds.has(tile.id)}
            onContextMenu={(event) => onTileContextMenu(event, tile)}
            onDoubleClick={() => onTileDoubleClick(tile, "react-double-click")}
            onHover={(cover) => onCoverHover({ index: tile.index, cover })}
            onHoverEnd={onCoverHoverEnd}
            onPointerDown={(event) => onTilePointerDown(event, tile)}
          />
        </div>
      ))}
    </section>
  );
}
