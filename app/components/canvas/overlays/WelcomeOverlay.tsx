"use client";

import { LayoutGrid, Library, Loader2, Palette, Upload, type LucideIcon } from "lucide-react";
import { LegalPageLinks } from "../../shared/LegalPageLinks";
import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import type { SpotifyUserProfile } from "../../../types/spotify-auth";

type WelcomeOverlayProps = {
  authError: string | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  onContinue: () => void;
  onSignIn: () => void;
  user: SpotifyUserProfile | null;
};

const welcomeTips = [
  {
    description: "Open your playlists and pick one to load tracks",
    icon: Library,
  },
  {
    description: "Pan, zoom, and rearrange tiles however you want",
    icon: LayoutGrid,
  },
  {
    description: "Sort selections by color, artist, or title",
    icon: Palette,
  },
  {
    description: "Export your layout and share it with friends",
    icon: Upload,
  },
] as const;

export function WelcomeOverlay({
  authError,
  isAuthenticated,
  isAuthLoading,
  onContinue,
  onSignIn,
  user,
}: WelcomeOverlayProps) {
  const dialogTitleId = useId();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onContinue();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAuthenticated, onContinue]);

  if (!isMounted) {
    return null;
  }

  return createPortal(
    <>
      <div
        aria-hidden="true"
        className="welcome-overlay-backdrop-enter fixed inset-0 z-[120] bg-black/60"
      />
      <div className="pointer-events-none fixed inset-0 z-[121] grid place-items-center p-4">
        <div
          aria-labelledby={dialogTitleId}
          aria-modal="true"
          className="welcome-overlay-enter welcome-overlay-panel pointer-events-auto font-control flex w-full max-w-md flex-col gap-5 rounded-xl border border-white/15 bg-[#111111] p-5 sm:p-6"
          role="dialog"
        >
          <header className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="toolbar-logo font-logo shrink-0">SP</div>
              <div className="min-w-0">
                <p className="text-[11px] text-[#1DB954]">
                  {isAuthenticated ? "You're connected" : "Sign in required"}
                </p>
                <h2
                  className="text-xl font-semibold leading-snug text-white sm:text-[1.35rem]"
                  id={dialogTitleId}
                >
                  Welcome to{" "}
                  <span className="font-logo text-[#1DB954]">Playlix</span>
                </h2>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-white/65">
              {isAuthenticated
                ? "A visual workspace for your Spotify playlists. Load years of additions and see every thumbnail on one canvas — not just a scrollable list."
                : "Playlix loads your Spotify playlists on a visual canvas. Connect your account to get started."}
            </p>
          </header>

          {isAuthenticated && user ? (
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
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  {user.displayName}
                </p>
                <p className="text-[11px] text-white/45">Signed in with Spotify</p>
              </div>
            </div>
          ) : null}

          {isAuthenticated ? (
            <section aria-label="Getting started tips" className="space-y-2.5">
              <p className="text-[11px] font-semibold text-white/45">
                A few things to try:
              </p>
              <ul className="welcome-tip-list">
                {welcomeTips.map((tip) => (
                  <WelcomeTip
                    description={tip.description}
                    icon={tip.icon}
                    key={tip.description}
                  />
                ))}
              </ul>
            </section>
          ) : (
            <section aria-label="Spotify sign in" className="space-y-2.5">
              <p className="text-[11px] font-semibold text-white/45">
                Before you start:
              </p>
              <ul className="welcome-tip-list">
                <WelcomeTip
                  description="Sign in with Spotify to load your playlists"
                  icon={Library}
                />
                <WelcomeTip
                  description="We only request read access — nothing gets posted or changed"
                  icon={Upload}
                />
              </ul>
              {authError ? (
                <p className="text-xs leading-relaxed text-[#1DB954]">{authError}</p>
              ) : null}
            </section>
          )}

          <footer className="flex items-center justify-between gap-3 border-t border-white/10 pt-4">
            <LegalPageLinks />
            {isAuthenticated ? (
              <button
                className="toolbar-button px-5 py-2 text-[11px]"
                onClick={onContinue}
                type="button"
              >
                got it
              </button>
            ) : (
              <button
                className="spotify-sign-in-button spotify-sign-in-button-compact"
                disabled={isAuthLoading}
                onClick={onSignIn}
                type="button"
              >
                {isAuthLoading ? (
                  <Loader2
                    aria-hidden="true"
                    className="size-4 animate-spin"
                    strokeWidth={2}
                  />
                ) : null}
                <span>Sign in with Spotify</span>
              </button>
            )}
          </footer>
        </div>
      </div>
    </>,
    document.body,
  );
}

function WelcomeTip({
  description,
  icon: Icon,
}: {
  description: string;
  icon: LucideIcon;
}) {
  return (
    <li className="welcome-tip-item">
      <span className="welcome-tip-icon-slot">
        <Icon aria-hidden="true" className="welcome-tip-icon" strokeWidth={2} />
      </span>
      <p className="welcome-tip-text">{description}</p>
    </li>
  );
}
