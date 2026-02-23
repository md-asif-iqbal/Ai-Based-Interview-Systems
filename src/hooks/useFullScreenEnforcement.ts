"use client";

import { useState, useCallback, useEffect, useRef } from "react";

export function useFullScreenEnforcement() {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [exitCount, setExitCount] = useState(0);
  const [isEnabled, setIsEnabled] = useState(false);
  const onViolationRef = useRef<((type: string) => void) | null>(null);
  const lastReentryRef = useRef(0);
  const reentryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const enterFullScreen = useCallback(async () => {
    try {
      // Don't try if already fullscreen
      if (document.fullscreenElement) {
        setIsFullScreen(true);
        return;
      }
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      } else if ((elem as unknown as { webkitRequestFullscreen: () => Promise<void> }).webkitRequestFullscreen) {
        await (elem as unknown as { webkitRequestFullscreen: () => Promise<void> }).webkitRequestFullscreen();
      }
      setIsFullScreen(true);
    } catch (err) {
      console.error("Failed to enter fullscreen:", err);
    }
  }, []);

  const exitFullScreen = useCallback(() => {
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen();
      }
    } catch {}
    setIsFullScreen(false);
    if (reentryTimeoutRef.current) {
      clearTimeout(reentryTimeoutRef.current);
      reentryTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    const handleChange = () => {
      const isFull = !!document.fullscreenElement;
      setIsFullScreen(isFull);

      if (!isFull && isEnabled) {
        const now = Date.now();
        const timeSinceLast = now - lastReentryRef.current;

        // Only count as violation if enough time passed (avoid rapid-fire violations)
        if (timeSinceLast > 2000) {
          setExitCount((prev) => prev + 1);
          onViolationRef.current?.("fullscreen_exit");
        }

        // Re-enter fullscreen with cooldown (3s minimum between attempts)
        // Also skip if the page is hidden (user might be in a permission dialog)
        if (reentryTimeoutRef.current) clearTimeout(reentryTimeoutRef.current);
        const delay = timeSinceLast < 3000 ? 3000 : 1500;
        reentryTimeoutRef.current = setTimeout(() => {
          if (isEnabled && !document.fullscreenElement && !document.hidden) {
            lastReentryRef.current = Date.now();
            enterFullScreen();
          }
        }, delay);
      }
    };

    document.addEventListener("fullscreenchange", handleChange);
    document.addEventListener("webkitfullscreenchange", handleChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleChange);
      document.removeEventListener("webkitfullscreenchange", handleChange);
      if (reentryTimeoutRef.current) clearTimeout(reentryTimeoutRef.current);
    };
  }, [isEnabled, enterFullScreen]);

  const enable = useCallback((onViolation?: (type: string) => void) => {
    setIsEnabled(true);
    if (onViolation) onViolationRef.current = onViolation;
    enterFullScreen();
  }, [enterFullScreen]);

  const disable = useCallback(() => {
    setIsEnabled(false);
    onViolationRef.current = null;
    exitFullScreen();
  }, [exitFullScreen]);

  return {
    isFullScreen,
    exitCount,
    isEnabled,
    enable,
    disable,
    enterFullScreen,
  };
}
