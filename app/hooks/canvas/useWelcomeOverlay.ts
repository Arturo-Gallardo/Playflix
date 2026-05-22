"use client";

import { useCallback, useEffect, useState } from "react";
import {
  hasWelcomeBeenDismissed,
  markWelcomeDismissed,
} from "../../lib/canvas/welcome-storage";

export function useWelcomeOverlay(isDemoMode = false) {
  const [isWelcomeVisible, setIsWelcomeVisible] = useState(false);
  const [hasHydratedWelcomeState, setHasHydratedWelcomeState] = useState(false);

  useEffect(() => {
    setIsWelcomeVisible(isDemoMode || !hasWelcomeBeenDismissed());
    setHasHydratedWelcomeState(true);
  }, [isDemoMode]);

  const dismissWelcome = useCallback(() => {
    if (!isDemoMode) {
      markWelcomeDismissed();
    }

    setIsWelcomeVisible(false);
  }, [isDemoMode]);

  return {
    dismissWelcome,
    isWelcomeVisible: hasHydratedWelcomeState && isWelcomeVisible,
  };
}
