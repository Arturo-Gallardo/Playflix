export function formatCoverDuration(durationMs: number) {
  const totalSeconds = Math.max(0, Math.round(durationMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function formatCoverDateCompact(value: string) {
  const parsed = Date.parse(value);

  if (Number.isFinite(parsed)) {
    return new Intl.DateTimeFormat(undefined, {
      day: "numeric",
      month: "short",
      year: "2-digit",
    }).format(parsed);
  }

  const parts = value.split("-");

  if (parts.length === 1) {
    return parts[0];
  }

  if (parts.length === 2) {
    const monthIndex = Number.parseInt(parts[1], 10) - 1;

    if (Number.isFinite(monthIndex) && monthIndex >= 0 && monthIndex < 12) {
      return new Intl.DateTimeFormat(undefined, {
        month: "short",
        year: "2-digit",
      }).format(new Date(Number.parseInt(parts[0], 10), monthIndex, 1));
    }
  }

  return formatCoverReleaseDate(value);
}

export function formatCoverAddedDate(addedAt: string) {
  const parsed = Date.parse(addedAt);

  if (!Number.isFinite(parsed)) {
    return addedAt;
  }

  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

export function formatCoverReleaseDate(releaseDate: string) {
  const parts = releaseDate.split("-");

  if (parts.length === 1) {
    return parts[0];
  }

  if (parts.length === 2) {
    const monthIndex = Number.parseInt(parts[1], 10) - 1;

    if (Number.isFinite(monthIndex) && monthIndex >= 0 && monthIndex < 12) {
      return new Intl.DateTimeFormat(undefined, {
        month: "long",
        year: "numeric",
      }).format(new Date(Number.parseInt(parts[0], 10), monthIndex, 1));
    }
  }

  const parsed = Date.parse(releaseDate);

  if (Number.isFinite(parsed)) {
    return new Intl.DateTimeFormat(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(parsed);
  }

  return releaseDate;
}
