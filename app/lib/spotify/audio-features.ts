import { spotifyApiFetch } from "./spotify-api";

const audioFeaturesBatchSize = 100;

type SpotifyAudioFeature = {
  id?: string;
  tempo?: number;
};

type SpotifyAudioFeaturesResponse = {
  audio_features?: Array<SpotifyAudioFeature | null>;
};

export async function fetchTrackAudioFeatures(
  accessToken: string,
  trackIds: string[],
) {
  const tempos: Record<string, number | null> = {};

  for (
    let offset = 0;
    offset < trackIds.length;
    offset += audioFeaturesBatchSize
  ) {
    const batch = trackIds.slice(offset, offset + audioFeaturesBatchSize);
    const path = `/audio-features?ids=${encodeURIComponent(batch.join(","))}`;
    const result = await spotifyApiFetch(accessToken, path);

    if (!result.ok) {
      return result;
    }

    const page = result.data as SpotifyAudioFeaturesResponse;

    for (const feature of page.audio_features ?? []) {
      if (!feature?.id) {
        continue;
      }

      tempos[feature.id] =
        typeof feature.tempo === "number" ? feature.tempo : null;
    }
  }

  return {
    ok: true as const,
    tempos,
  };
}
