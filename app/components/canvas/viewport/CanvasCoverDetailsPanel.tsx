"use client";

import { getCoverDisplayDetails } from "../../../lib/playlist/playlist-cover";
import type { HoveredCoverDetails } from "../CoverGrid";

type CanvasCoverDetailsPanelProps = {
  details: HoveredCoverDetails;
};

function CoverDetailRow({ label, value }: { label: string; value: string }) {
  return (
    <p className="canvas-cover-details-row">
      <span className="canvas-cover-details-label">{label}:</span>{" "}
      <span className="canvas-cover-details-value">{value}</span>
    </p>
  );
}

export function CanvasCoverDetailsPanel({
  details,
}: CanvasCoverDetailsPanelProps) {
  const displayDetails = getCoverDisplayDetails(details.cover);
  const trackNumber = String(details.index + 1).padStart(2, "0");

  return (
    <aside className="canvas-cover-details-panel pointer-events-none fixed bottom-5 left-5 z-20 flex items-stretch overflow-hidden rounded-md border border-white/15 bg-[#111111]/65 shadow-2xl backdrop-blur-md">
      {details.cover.albumArtUrl ? (
        <div className="canvas-cover-details-art relative overflow-hidden rounded bg-white/5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt=""
            className="block size-full object-cover"
            src={details.cover.albumArtUrl}
          />
        </div>
      ) : null}

      <div className="canvas-cover-details-copy">
        <div className="canvas-cover-details-header">
          {displayDetails.artist ? (
            <p className="canvas-cover-details-artist">{displayDetails.artist}</p>
          ) : (
            <span />
          )}
          <span className="canvas-cover-details-index">{trackNumber}</span>
        </div>

        <p className="canvas-cover-details-title">{displayDetails.title}</p>

        {displayDetails.metaRows.length > 0 ? (
          <div className="canvas-cover-details-meta-block">
            {displayDetails.metaRows.map((row) => (
              <CoverDetailRow key={row.label} label={row.label} value={row.value} />
            ))}
          </div>
        ) : null}

        {displayDetails.dateRows.length > 0 ? (
          <div className="canvas-cover-details-dates">
            {displayDetails.dateRows.map((row) => (
              <CoverDetailRow key={row.label} label={row.label} value={row.value} />
            ))}
          </div>
        ) : null}
      </div>
    </aside>
  );
}
