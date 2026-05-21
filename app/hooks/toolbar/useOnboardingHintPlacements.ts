"use client";

import { useLayoutEffect, useState } from "react";

export type OnboardingHintPlacement = {
  anchorX: number;
  anchorY: number;
};

const playlistPickerSelector = '[data-onboarding-target="playlist-picker"]';
const toolbarSelector = "header";
const anchorGapPx = 14;

export function useOnboardingHintPlacements(isEnabled: boolean) {
  const [playlistInput, setPlaylistInput] =
    useState<OnboardingHintPlacement | null>(null);

  useLayoutEffect(() => {
    if (!isEnabled) {
      setPlaylistInput(null);
      return;
    }

    function measureTarget(selector: string) {
      const element = document.querySelector(selector);

      if (!element) {
        return null;
      }

      const anchorElement =
        element instanceof HTMLInputElement
          ? element
          : element.querySelector("input");

      const rect = (anchorElement ?? element).getBoundingClientRect();

      if (rect.width === 0 || rect.height === 0) {
        return null;
      }

      return {
        anchorX: rect.left + rect.width / 2,
        anchorY: rect.bottom + anchorGapPx,
      } satisfies OnboardingHintPlacement;
    }

    function updatePlacements() {
      setPlaylistInput(measureTarget(playlistPickerSelector));
    }

    function scheduleMeasure() {
      window.requestAnimationFrame(() => {
        updatePlacements();
      });
    }

    scheduleMeasure();

    const observedElements = [
      document.querySelector(toolbarSelector),
      document.querySelector(playlistPickerSelector),
    ].filter((element): element is Element => element !== null);

    const resizeObserver = new ResizeObserver(scheduleMeasure);
    observedElements.forEach((element) => resizeObserver.observe(element));

    window.addEventListener("resize", scheduleMeasure);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", scheduleMeasure);
    };
  }, [isEnabled]);

  return { playlistInput };
}
