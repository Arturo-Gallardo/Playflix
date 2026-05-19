export function CanvasEmptyState() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[5] grid place-items-center px-6"
      aria-live="polite"
    >
      <p className="font-control max-w-md text-center text-sm font-semibold leading-6 text-white/80">
        Paste a spotify playlist link to load covers here.
      </p>
    </div>
  );
}
