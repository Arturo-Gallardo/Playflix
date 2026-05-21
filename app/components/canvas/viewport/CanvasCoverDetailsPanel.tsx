"use client";

import { getCoverDisplayDetails } from "../../../lib/playlist/playlist-cover";
import type { HoveredCoverDetails } from "../CoverGrid";

type CanvasCoverDetailsPanelProps = {
  details: HoveredCoverDetails;
};

export function CanvasCoverDetailsPanel({ details }: CanvasCoverDetailsPanelProps) {
  const displayDetails = getCoverDisplayDetails(details.cover);

  return (
    <aside className="pointer-events-none fixed bottom-5 left-5 z-20 flex max-w-2xl gap-4 rounded-md border border-white/15 bg-[#111111]/45 p-3 shadow-2xl backdrop-blur-sm">
      <span className="font-control absolute right-3 top-3 rounded-full border border-white/15 bg-white/10 px-2 py-1 text-[10px] font-semibold text-white/60">
        {String(details.index + 1).padStart(2, "0")}
      </span>

      {details.cover.albumArtUrl ? (
        <div className="relative aspect-square w-28 shrink-0 overflow-hidden rounded bg-white/5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt=""
            className="size-full object-cover"
            height={112}
            src={details.cover.albumArtUrl}
            width={112}
          />
        </div>
      ) : null}

      <div className="min-w-0 self-center pr-10">
        {displayDetails.artist ? (
          <p className="font-control mb-2 text-[10px] uppercase tracking-[0.24em] text-white/55">
            {displayDetails.artist}
          </p>
        ) : null}
        <p className="font-control text-sm font-semibold leading-5 text-white drop-shadow">
          {displayDetails.title}
        </p>
      </div>
    </aside>
  );
}
