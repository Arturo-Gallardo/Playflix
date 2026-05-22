"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import type { SpotifyUserProfile } from "../../types/spotify-auth";
import { LegalPageLinks } from "../shared/LegalPageLinks";
import { cn } from "../../lib/cn";

type SettingsDialogProps = {
  areCoverDetailsHidden: boolean;
  isShortcutLegendVisible: boolean;
  onClearPlaylistCache: () => void;
  onClearSavedLayout: () => void;
  onClose: () => void;
  onCoverDetailsHiddenChange: (hidden: boolean) => void;
  onShortcutLegendVisibleChange: (visible: boolean) => void;
  isDemoMode: boolean;
  onSignOut: () => void;
  onSwitchAccount: () => void;
  user: SpotifyUserProfile | null;
};

export function SettingsDialog({
  areCoverDetailsHidden,
  isShortcutLegendVisible,
  onClearPlaylistCache,
  onClearSavedLayout,
  onClose,
  onCoverDetailsHiddenChange,
  onShortcutLegendVisibleChange,
  isDemoMode,
  onSignOut,
  onSwitchAccount,
  user,
}: SettingsDialogProps) {
  const dialogTitleId = useId();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!isMounted) {
    return null;
  }

  return createPortal(
    <>
      <button
        aria-label="close settings"
        className="settings-dialog-backdrop-enter fixed inset-0 z-[110] cursor-default bg-black/55"
        onClick={onClose}
        type="button"
      />
      <div className="pointer-events-none fixed inset-0 z-[111] grid place-items-center p-4">
        <div
          aria-labelledby={dialogTitleId}
          aria-modal="true"
          className="settings-dialog-enter pointer-events-auto font-control flex w-full max-w-md flex-col gap-5 rounded-xl border border-white/15 bg-[#111111]/95 p-4 shadow-[0_18px_48px_rgb(0_0_0/0.55)] backdrop-blur-md sm:p-5"
          onPointerDown={(event) => event.stopPropagation()}
          role="dialog"
        >
          <header className="space-y-1">
            <h2
              className="text-xs font-semibold uppercase tracking-[0.24em] text-white/75"
              id={dialogTitleId}
            >
              settings
            </h2>
            <p className="text-[11px] text-white/50">
              display and local storage for this browser.
            </p>
          </header>

          {user ? (
            <section className="space-y-3">
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">
                account
              </h3>
              <div className="flex items-center gap-3 rounded-md border border-white/10 bg-white/[0.03] px-3 py-2.5">
                {user.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    alt=""
                    className="size-9 rounded-full object-cover"
                    height={36}
                    src={user.imageUrl}
                    width={36}
                  />
                ) : (
                  <div className="grid size-9 place-items-center rounded-full bg-[#1DB954]/20 text-xs font-semibold text-[#1DB954]">
                    {user.displayName.slice(0, 1).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">
                    {user.displayName}
                  </p>
                  <p className="text-[10px] text-white/45">
                    {isDemoMode ? "Demo account (read-only session)" : "Connected to Spotify"}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col gap-1.5">
                  <button
                    className="toolbar-button px-3 py-1.5 text-[10px] disabled:cursor-not-allowed disabled:opacity-40"
                    disabled={isDemoMode}
                    onClick={onSwitchAccount}
                    title={isDemoMode ? "Disabled in demo mode" : undefined}
                    type="button"
                  >
                    switch account
                  </button>
                  <button
                    className="toolbar-button px-3 py-1.5 text-[10px] disabled:cursor-not-allowed disabled:opacity-40"
                    disabled={isDemoMode}
                    onClick={onSignOut}
                    title={isDemoMode ? "Disabled in demo mode" : undefined}
                    type="button"
                  >
                    sign out
                  </button>
                </div>
              </div>
            </section>
          ) : null}

          <section className="space-y-3">
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">
              display
            </h3>
            <SettingsToggle
              description="show artist and title when hovering a tile"
              isOn={!areCoverDetailsHidden}
              label="cover details on hover"
              onChange={(isOn) => onCoverDetailsHiddenChange(!isOn)}
            />
            <SettingsToggle
              description="shortcut reference in the bottom-right corner"
              isOn={isShortcutLegendVisible}
              label="keyboard shortcuts"
              onChange={onShortcutLegendVisibleChange}
            />
          </section>

          <section className="space-y-3">
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">
              storage
            </h3>
            <SettingsAction
              description="forces fresh playlist data on the next load"
              label="clear playlist cache"
              onClick={onClearPlaylistCache}
            />
            <SettingsAction
              description="removes the auto-saved layout from this browser"
              label="clear saved layout"
              onClick={onClearSavedLayout}
            />
          </section>

          <footer className="flex items-center justify-between gap-3 border-t border-white/10 pt-3">
            <LegalPageLinks onNavigate={onClose} />
            <button
              className="toolbar-button px-4 py-2 text-[10px]"
              onClick={onClose}
              type="button"
            >
              done
            </button>
          </footer>
        </div>
      </div>
    </>,
    document.body,
  );
}

function SettingsToggle({
  description,
  isOn,
  label,
  onChange,
}: {
  description: string;
  isOn: boolean;
  label: string;
  onChange: (isOn: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-md border border-white/10 bg-white/[0.03] px-3 py-2.5">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/85">
          {label}
        </p>
        <p className="mt-1 text-[10px] leading-relaxed text-white/45">
          {description}
        </p>
      </div>
      <button
        aria-checked={isOn}
        aria-label={label}
        className={cn(
          "relative mt-0.5 h-6 w-11 shrink-0 rounded-full border transition",
          isOn
            ? "border-[#1DB954] bg-[#1DB954]/35"
            : "border-white/20 bg-white/5",
        )}
        onClick={() => onChange(!isOn)}
        role="switch"
        type="button"
      >
        <span
          className={cn(
            "absolute top-0.5 size-4 rounded-full bg-white transition",
            isOn ? "left-[1.35rem]" : "left-0.5",
          )}
        />
      </button>
    </div>
  );
}

function SettingsAction({
  description,
  label,
  onClick,
}: {
  description: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-md border border-white/10 bg-white/[0.03] px-3 py-2.5">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/85">
          {label}
        </p>
        <p className="mt-1 text-[10px] leading-relaxed text-white/45">
          {description}
        </p>
      </div>
      <button
        className="toolbar-button shrink-0 px-3 py-1.5 text-[10px]"
        onClick={onClick}
        type="button"
      >
        clear
      </button>
    </div>
  );
}
