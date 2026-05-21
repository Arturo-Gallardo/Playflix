export function CanvasEmptyState() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[5] grid place-items-center px-6"
      aria-live="polite"
    >
      <div className="canvas-empty-state-enter max-w-md text-center">
        <p className="font-control text-base font-semibold leading-7 text-white/80 sm:text-lg sm:leading-8">
          Paste a Spotify playlist link to see it here!
        </p>
      </div>
    </div>
  );
}
