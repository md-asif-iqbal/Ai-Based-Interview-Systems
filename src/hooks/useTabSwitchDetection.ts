"use client";

import { useState, useCallback, useEffect, useRef } from "react";

export function useTabSwitchDetection() {
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [isTabVisible, setIsTabVisible] = useState(true);
  const [isEnabled, setIsEnabled] = useState(false);
  const [lastSwitchAt, setLastSwitchAt] = useState<Date | null>(null);
  const onViolationRef = useRef<((type: string) => void) | null>(null);

  useEffect(() => {
    if (!isEnabled) return;

    const handleVisibility = () => {
      const visible = document.visibilityState === "visible";
      setIsTabVisible(visible);

      if (!visible) {
        setTabSwitchCount((prev) => prev + 1);
        setLastSwitchAt(new Date());
        onViolationRef.current?.("tab_switch");
      }
    };

    const handleBlur = () => {
      setTabSwitchCount((prev) => prev + 1);
      setLastSwitchAt(new Date());
      onViolationRef.current?.("window_blur");
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", handleBlur);
    };
  }, [isEnabled]);

  const enable = useCallback((onViolation?: (type: string) => void) => {
    setIsEnabled(true);
    setTabSwitchCount(0);
    if (onViolation) onViolationRef.current = onViolation;
  }, []);

  const disable = useCallback(() => {
    setIsEnabled(false);
    onViolationRef.current = null;
  }, []);

  return {
    tabSwitchCount,
    isTabVisible,
    isEnabled,
    lastSwitchAt,
    enable,
    disable,
  };
}
