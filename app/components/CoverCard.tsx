import type { MouseEvent, PointerEvent } from "react";
import { memo } from "react";
import type { PlaylistCover } from "../data/sample-covers";

type CoverCardProps = {
  cover: PlaylistCover;
  index: number;
  isMoving: boolean;
  isSelected: boolean;
  onContextMenu: (event: MouseEvent<HTMLDivElement>) => void;
  onDoubleClick: () => void;
  onHover: (cover: PlaylistCover) => void;
  onHoverEnd: () => void;
  onPointerDown: (event: PointerEvent<HTMLDivElement>) => void;
};

export const CoverCard = memo(function CoverCard({
  cover,
  index,
  isMoving,
  isSelected,
  onContextMenu,
  onDoubleClick,
  onHover,
  onHoverEnd,
  onPointerDown,
}: CoverCardProps) {
  return (
    <div
      className={getCoverCardClassName({ isMoving, isSelected })}
      data-tile-card="true"
      aria-label={`open ${cover.title} on spotify`}
      onBlur={onHoverEnd}
      onFocus={() => onHover(cover)}
      onMouseEnter={() => onHover(cover)}
      onMouseLeave={onHoverEnd}
      onContextMenu={onContextMenu}
      onDoubleClick={onDoubleClick}
      onPointerDown={onPointerDown}
      role="group"
      tabIndex={0}
    >
      <span className="font-control absolute left-2 top-2 text-[10px] font-semibold text-white/55 transition group-hover:text-white">
        {String(index + 1).padStart(2, "0")}
      </span>

      <div className="absolute inset-x-2 bottom-2 translate-y-1 opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">
        <h3 className="font-control line-clamp-2 text-[11px] font-semibold leading-4 text-white">
          {cover.title}
        </h3>
      </div>

      {isSelected ? (
        <span className="pointer-events-none absolute inset-0 rounded-md ring-2 ring-[#1DB954] ring-offset-2 ring-offset-[#111111]" />
      ) : null}
    </div>
  );
}, areCoverCardPropsEqual);

function areCoverCardPropsEqual(
  currentProps: CoverCardProps,
  nextProps: CoverCardProps,
) {
  return (
    currentProps.index === nextProps.index &&
    currentProps.isMoving === nextProps.isMoving &&
    currentProps.isSelected === nextProps.isSelected &&
    currentProps.cover === nextProps.cover
  );
}

function getCoverCardClassName({
  isMoving,
  isSelected,
}: {
  isMoving: boolean;
  isSelected: boolean;
}) {
  const borderColor = isSelected ? "border-[#1DB954]" : "border-white/90";
  const cursor = isMoving ? "cursor-grabbing" : "cursor-grab";

  return `group relative block size-full aspect-square overflow-hidden rounded-md border bg-transparent transition hover:border-[#1DB954] hover:bg-[#191414] ${borderColor} ${cursor}`;
}
