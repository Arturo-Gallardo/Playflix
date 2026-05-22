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

  const releaseParsed = Date.parse(value);

  if (Number.isFinite(releaseParsed)) {
    return new Intl.DateTimeFormat(undefined, {
      day: "numeric",
      month: "short",
      year: "2-digit",
    }).format(releaseParsed);
  }

  return value;
}
