import type { PlaylistCoverWire } from "../types/playlist";

export type PlaylistCover = PlaylistCoverWire;

const coverTitles = [
  "midnight drive",
  "daily rotation",
  "green room",
  "late night mix",
  "fresh finds",
  "repeat plays",
];

const coverArtists = [
  "Various Artists",
  "Playlix Demo",
  "Indie Mix",
  "Night Owl",
  "Fresh Picks",
  "On Repeat",
];

// A longer playlist makes the canvas feel closer to the final app.
export const sampleCovers: PlaylistCover[] = Array.from({ length: 100 }, (_, index) => ({
  id: `cover-${index + 1}`,
  title: coverTitles[index % coverTitles.length],
  url: "https://open.spotify.com",
  artist: coverArtists[index % coverArtists.length],
  albumArtUrl: null,
}));
