"use client";

import { useState, useCallback, useRef } from "react";

interface Violation {
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  timestamp: Date;
}

const SEVERITY_PENALTY: Record<string, number> = {
  low: 2,
  medium: 5,
  high: 10,
  critical: 25,
};

const VIOLATION_DESCRIPTIONS: Record<string, { severity: "low" | "medium" | "high" | "critical"; desc: string }> = {
  tab_switch: { severity: "medium", desc: "Switched to another tab" },
  window_blur: { severity: "medium", desc: "Window lost focus" },
  fullscreen_exit: { severity: "high", desc: "Exited fullscreen mode" },
  no_face: { severity: "high", desc: "No face detected in camera" },
  multiple_faces: { severity: "critical", desc: "Multiple faces detected" },
  looking_away: { severity: "low", desc: "Looking away from screen" },
  copy_paste: { severity: "high", desc: "Copy/paste attempt detected" },
  right_click: { severity: "low", desc: "Right-click detected" },
  dev_tools: { severity: "critical", desc: "Developer tools opened" },
  screenshot: { severity: "high", desc: "Screenshot attempt detected" },
};

export function useViolationLogger(interviewId: string) {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [totalScore, setTotalScore] = useState(100);
  const pendingRef = useRef<Violation[]>([]);
  const flushTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flushToServer = useCallback(async (items: Violation[]) => {
    if (items.length === 0 || !interviewId) return;

    try {
      await fetch(`/api/interviews/${interviewId}/violations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          violations: items.map((v) => ({
            type: v.type,
            severity: v.severity,
            description: v.description,
            timestamp: v.timestamp.toISOString(),
          })),
        }),
      });
    } catch (err) {
      console.error("Failed to log violations:", err);
    }
  }, [interviewId]);

  const logViolation = useCallback((type: string) => {
    const config = VIOLATION_DESCRIPTIONS[type] || { severity: "low" as const, desc: type };
    const violation: Violation = {
      type,
      severity: config.severity,
      description: config.desc,
      timestamp: new Date(),
    };

    setViolations((prev) => [...prev, violation]);
    setTotalScore((prev) => Math.max(0, prev - SEVERITY_PENALTY[config.severity]));

    // Batch violations and flush
    pendingRef.current.push(violation);
    if (flushTimeoutRef.current) clearTimeout(flushTimeoutRef.current);
    flushTimeoutRef.current = setTimeout(() => {
      flushToServer([...pendingRef.current]);
      pendingRef.current = [];
    }, 3000);
  }, [flushToServer]);

  const getViolationSummary = useCallback(() => {
    const counts: Record<string, number> = {};
    violations.forEach((v) => {
      counts[v.type] = (counts[v.type] || 0) + 1;
    });
    return {
      total: violations.length,
      counts,
      securityScore: totalScore,
      shouldTerminate: totalScore <= 0,
    };
  }, [violations, totalScore]);

  return {
    violations,
    totalScore,
    logViolation,
    getViolationSummary,
  };
}
