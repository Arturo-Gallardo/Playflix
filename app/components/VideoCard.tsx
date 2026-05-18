import type { PlaylistVideo } from "../data/sample-videos";

type VideoCardProps = {
  video: PlaylistVideo;
  index: number;
};

export function VideoCard({ video, index }: VideoCardProps) {
  return (
    <a
      className="group relative block aspect-video border border-white/90 bg-transparent transition hover:border-[#CA3E47] hover:bg-[#525252]"
      href={video.url}
      aria-label={`open ${video.title} on youtube`}
      rel="noreferrer"
      target="_blank"
    >
      <span className="font-control absolute left-2 top-2 text-[10px] font-semibold text-white/55 transition group-hover:text-white">
        {String(index + 1).padStart(2, "0")}
      </span>

      <div className="absolute inset-x-2 bottom-2 translate-y-1 opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">
        <h3 className="font-control line-clamp-2 text-[11px] font-semibold leading-4 text-white">
          {video.title}
        </h3>
      </div>
    </a>
  );
}
