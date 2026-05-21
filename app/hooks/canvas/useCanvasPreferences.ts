"use client";

import { useCallback, useEffect, useState } from "react";

const canvasPreferencesStorageKey = "playlix:canvas-preferences";

type CanvasPreferences = {
  areCoverDetailsHidden: boolean;
  isShortcutLegendVisible: boolean;
};

const defaultPreferences: CanvasPreferences = {
  areCoverDetailsHidden: false,
  isShortcutLegendVisible: true,
};

export function useCanvasPreferences() {
  const [preferences, setPreferences] =
    useState<CanvasPreferences>(defaultPreferences);
  const [hasHydratedPreferences, setHasHydratedPreferences] = useState(false);

  useEffect(() => {
    setPreferences(readCanvasPreferences());
    setHasHydratedPreferences(true);
  }, []);

  useEffect(() => {
    if (!hasHydratedPreferences) {
      return;
    }

    writeCanvasPreferences(preferences);
  }, [hasHydratedPreferences, preferences]);

  const setAreCoverDetailsHidden = useCallback(
    (value: boolean | ((currentValue: boolean) => boolean)) => {
      setPreferences((currentPreferences) => {
        const nextValue =
          typeof value === "function"
            ? value(currentPreferences.areCoverDetailsHidden)
            : value;

        return {
          ...currentPreferences,
          areCoverDetailsHidden: nextValue,
        };
      });
    },
    [],
  );

  const setIsShortcutLegendVisible = useCallback(
    (value: boolean | ((currentValue: boolean) => boolean)) => {
      setPreferences((currentPreferences) => {
        const nextValue =
          typeof value === "function"
            ? value(currentPreferences.isShortcutLegendVisible)
            : value;

        return {
          ...currentPreferences,
          isShortcutLegendVisible: nextValue,
        };
      });
    },
    [],
  );

  return {
    areCoverDetailsHidden: preferences.areCoverDetailsHidden,
    isShortcutLegendVisible: preferences.isShortcutLegendVisible,
    setAreCoverDetailsHidden,
    setIsShortcutLegendVisible,
  };
}

function readCanvasPreferences(): CanvasPreferences {
  try {
    const storedValue = window.localStorage.getItem(canvasPreferencesStorageKey);

    if (!storedValue) {
      return defaultPreferences;
    }

    const parsedValue: unknown = JSON.parse(storedValue);

    if (!isCanvasPreferences(parsedValue)) {
      return defaultPreferences;
    }

    return parsedValue;
  } catch {
    return defaultPreferences;
  }
}

function writeCanvasPreferences(preferences: CanvasPreferences) {
  try {
    window.localStorage.setItem(
      canvasPreferencesStorageKey,
      JSON.stringify(preferences),
    );
  } catch {
    // storage can be full or disabled
  }
}

function isCanvasPreferences(value: unknown): value is CanvasPreferences {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as CanvasPreferences).areCoverDetailsHidden === "boolean" &&
    typeof (value as CanvasPreferences).isShortcutLegendVisible === "boolean"
  );
}
