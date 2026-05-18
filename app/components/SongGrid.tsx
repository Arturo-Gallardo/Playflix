import type { PlaylistCover } from "../data/sample-covers";
import { CoverCard } from "./CoverCard";

type SongGridProps = {
  covers: PlaylistCover[];
};

export function SongGrid({ covers }: SongGridProps) {
  return (
    <section className="w-[1320px]">
      <div className="grid grid-cols-10 gap-2">
        {covers.map((cover, index) => (
          <CoverCard cover={cover} index={index} key={cover.id} />
        ))}
      </div>
    </section>
  );
}
