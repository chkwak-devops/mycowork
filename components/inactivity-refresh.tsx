"use client";

import { useEffect, useCallback } from "react";

export function InactivityRefresh({
  timeoutMinutes = 5,
}: {
  timeoutMinutes?: number;
}) {
  const refreshPage = useCallback(() => {
    window.location.reload();
  }, []);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(refreshPage, timeoutMinutes * 60 * 1000);
    };

    resetTimer();

    const events = [
      "mousedown",
      "mousemove",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];

    events.forEach((event) => {
      document.addEventListener(event, resetTimer, { passive: true });
    });

    return () => {
      clearTimeout(timeoutId);
      events.forEach((event) => {
        document.removeEventListener(event, resetTimer);
      });
    };
  }, [refreshPage, timeoutMinutes]);

  return null;
}
