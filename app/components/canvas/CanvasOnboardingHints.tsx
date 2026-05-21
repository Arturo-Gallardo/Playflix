"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  useOnboardingHintPlacements,
  type OnboardingHintPlacement,
} from "../../hooks/toolbar/useOnboardingHintPlacements";
import { CurvedHintArrow } from "./CurvedHintArrow";

type CanvasOnboardingHintsProps = {
  isVisible: boolean;
};

export function CanvasOnboardingHints({ isVisible }: CanvasOnboardingHintsProps) {
  const [isMounted, setIsMounted] = useState(false);
  const placements = useOnboardingHintPlacements(isVisible && isMounted);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isVisible || !isMounted) {
    return null;
  }

  return createPortal(
    <>
      {placements.playlistInput ? (
        <OnboardingHint
          bend="left"
          label="open your playlists and pick one to load"
          placement={placements.playlistInput}
        />
      ) : null}
    </>,
    document.body,
  );
}

function OnboardingHint({
  bend,
  label,
  placement,
}: {
  bend: "left" | "right";
  label: string;
  placement: OnboardingHintPlacement;
}) {
  return (
    <div
      className="canvas-onboarding-hint pointer-events-none fixed z-[6] flex w-[12rem] flex-col items-center"
      style={{
        left: placement.anchorX,
        top: placement.anchorY,
        transform: "translateX(-50%)",
      }}
    >
      <CurvedHintArrow bend={bend} />
      <p className="font-control mt-1.5 text-center text-[11px] font-medium leading-snug text-white/40">
        {label}
      </p>
    </div>
  );
}
