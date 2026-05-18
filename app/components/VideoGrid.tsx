import type { PlaylistVideo } from "../data/sample-videos";
import { VideoCard } from "./VideoCard";

type VideoGridProps = {
  videos: PlaylistVideo[];
};

export function VideoGrid({ videos }: VideoGridProps) {
  return (
    <section className="w-[1320px]">
      <div className="grid grid-cols-10 gap-2">
        {videos.map((video, index) => (
          <VideoCard index={index} key={video.id} video={video} />
        ))}
      </div>
    </section>
  );
}
