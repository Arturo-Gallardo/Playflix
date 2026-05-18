import type { PlaylistCover } from "../data/sample-covers";

type CoverCardProps = {
  cover: PlaylistCover;
  index: number;
};

export function CoverCard({ cover, index }: CoverCardProps) {
  return (
    <a
      aria-label={`open ${cover.title} on spotify`}
      className="group relative block aspect-square border border-white/90 bg-transparent transition hover:border-[#1DB954] hover:bg-[#191414]"
      href={cover.url}
      rel="noreferrer"
      target="_blank"
    >
      <span className="font-control absolute left-2 top-2 text-[10px] font-semibold text-white/55 transition group-hover:text-white">
        {String(index + 1).padStart(2, "0")}
      </span>

      <div className="absolute inset-x-2 bottom-2 translate-y-1 opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">
        <h3 className="font-control line-clamp-2 text-[11px] font-semibold leading-4 text-white">
          {cover.title}
        </h3>
      </div>
    </a>
  );
}
