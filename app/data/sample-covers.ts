export type PlaylistCoverWire = {
  id: string;
  title: string;
  url: string;
};

export type PlaylistCover = PlaylistCoverWire;

const coverTitles = [
  "midnight drive",
  "daily rotation",
  "green room",
  "late night mix",
  "fresh finds",
  "repeat plays",
];

// A longer playlist makes the canvas feel closer to the final app.
export const sampleCovers: PlaylistCover[] = Array.from({ length: 60 }, (_, index) => ({
  id: `cover-${index + 1}`,
  title: coverTitles[index % coverTitles.length],
  url: "https://open.spotify.com",
}));
