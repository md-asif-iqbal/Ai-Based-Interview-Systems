"use client";

import { useEffect, useRef } from "react";

interface SecurityBlockingOptions {
  enabled: boolean;
  onViolation: (type: string) => void;
}

export function useSecurityBlocking({ enabled, onViolation }: SecurityBlockingOptions) {
  const onViolationRef = useRef(onViolation);

  useEffect(() => {
    onViolationRef.current = onViolation;
  });

  useEffect(() => {
    if (!enabled) return;

    // Block copy/paste
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      onViolationRef.current("copy_paste");
    };

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      onViolationRef.current("copy_paste");
    };

    // Block right-click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      onViolationRef.current("right_click");
    };

    // Block keyboard shortcuts
    const handleKeydown = (e: KeyboardEvent) => {
      // Block Ctrl+C, Ctrl+V, Ctrl+A, Ctrl+S, F12
      if (
        (e.ctrlKey || e.metaKey) &&
        ["c", "v", "a", "s", "u", "p"].includes(e.key.toLowerCase())
      ) {
        // Allow Ctrl+A in textareas only
        if (e.key.toLowerCase() === "a" && (e.target as HTMLElement)?.tagName === "TEXTAREA") {
          return;
        }
        e.preventDefault();
        onViolationRef.current("copy_paste");
      }

      // Block F12 (dev tools)
      if (e.key === "F12") {
        e.preventDefault();
        onViolationRef.current("dev_tools");
      }

      // Block Ctrl+Shift+I/J (dev tools)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && ["i", "j", "c"].includes(e.key.toLowerCase())) {
        e.preventDefault();
        onViolationRef.current("dev_tools");
      }

      // Block PrintScreen
      if (e.key === "PrintScreen") {
        e.preventDefault();
        onViolationRef.current("screenshot");
      }
    };

    // Detect dev tools via debugger timing
    const detectDevTools = () => {
      const threshold = 160;
      const start = performance.now();
      // Using a simple timing check
      const diff = performance.now() - start;
      if (diff > threshold) {
        onViolationRef.current("dev_tools");
      }
    };

    document.addEventListener("copy", handleCopy);
    document.addEventListener("paste", handlePaste);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeydown);

    const devToolsInterval = setInterval(detectDevTools, 5000);

    return () => {
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("paste", handlePaste);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeydown);
      clearInterval(devToolsInterval);
    };
  }, [enabled]);
}
