/** Normalize playlist URLs/ids for duplicate checks on the canvas. */
export function normalizePlaylistSource(source: string) {
  return source.trim().toLowerCase();
}

export function extractPlaylistId(source: string) {
  const trimmed = source.trim();
  const urlMatch = trimmed.match(/playlist[/:]([a-zA-Z0-9]+)/i);

  if (urlMatch?.[1]) {
    return urlMatch[1];
  }

  if (/^[a-zA-Z0-9]+$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

export function playlistSourcesInclude(
  sources: readonly string[],
  candidate: string,
) {
  const candidateId = extractPlaylistId(candidate);

  if (candidateId) {
    return sources.some(
      (source) => extractPlaylistId(source) === candidateId,
    );
  }

  const normalizedCandidate = normalizePlaylistSource(candidate);

  return sources.some(
    (source) => normalizePlaylistSource(source) === normalizedCandidate,
  );
}

export function playlistSourcesIncludeId(
  sources: readonly string[],
  playlistId: string,
) {
  return playlistSourcesInclude(sources, playlistId);
}
