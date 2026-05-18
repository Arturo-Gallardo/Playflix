import { Settings } from "lucide-react";

export function AppToolbar() {
  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-10 grid grid-cols-[1fr_auto_1fr] items-start gap-4 p-5">
      <div className="pointer-events-auto flex min-w-0 items-center gap-3">
        <div className="toolbar-logo">PL</div>

        <label className="sr-only" htmlFor="playlist-url">
          youtube playlist link
        </label>
        <input
          className="toolbar-input"
          id="playlist-url"
          placeholder="paste a youtube playlist link"
          type="url"
        />
      </div>

      <nav className="group pointer-events-auto -m-5 hidden items-center gap-3 p-5 sm:flex">
        <button className="toolbar-pan-button">L</button>
        <button className="toolbar-pan-button">U</button>
        <button className="toolbar-pan-button">D</button>
        <button className="toolbar-pan-button">R</button>
      </nav>

      <div className="pointer-events-auto flex justify-end gap-2">
        <button className="toolbar-button" type="button">
          login
        </button>
        <button
          aria-label="open settings"
          className="toolbar-icon-button"
          type="button"
        >
          <Settings aria-hidden="true" className="size-4" strokeWidth={1.8} />
        </button>
      </div>
    </header>
  );
}
