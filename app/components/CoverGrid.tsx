import type { MouseEvent, PointerEvent } from "react";
import type {
  CanvasTile,
  Rect,
  VisibleCanvasTile,
} from "../lib/canvas-layout";
import type { PlaylistCover } from "../data/sample-covers";
import { CoverCard } from "./CoverCard";

export type HoveredCoverDetails = {
  index: number;
  cover: PlaylistCover;
};

type CoverGridProps = {
  bounds: Rect;
  movingTileIds: Set<string>;
  onCoverHover: (details: HoveredCoverDetails) => void;
  onCoverHoverEnd: () => void;
  onTileContextMenu: (
    event: MouseEvent<HTMLDivElement>,
    tile: CanvasTile,
  ) => void;
  onTileDoubleClick: (
    tile: CanvasTile,
    source: "react-double-click",
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
  movingTileIds,
  onCoverHover,
  onCoverHoverEnd,
  onTileContextMenu,
  onTileDoubleClick,
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
          className="absolute"
          key={tile.id}
          style={{
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
