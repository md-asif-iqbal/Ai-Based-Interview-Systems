import { ISecurityLog } from "@/types";

interface SecurityScoreResult {
  score: number;
  integrity: "VERIFIED - High Integrity" | "VERIFIED - Good Integrity" | "FLAGGED - Review Recommended" | "FLAGGED - High Risk";
  breakdown: {
    baseScore: number;
    violationDeductions: number;
    faceVisibilityAdjustment: number;
    bonusPoints: number;
  };
  details: Record<string, number>;
}

const VIOLATION_DEDUCTIONS: Record<string, number> = {
  tab_switch: 5,
  fullscreen_exit: 10,
  multiple_faces: 15,
  face_not_visible: 8,
  copy_paste: 3,
  devtools_open: 10,
  suspicious_audio: 7,
  looking_away: 4,
};

export function calculateSecurityScore(
  violations: ISecurityLog[],
  faceVisibilityPercentage: number = 100
): SecurityScoreResult {
  let score = 100;
  let totalDeductions = 0;
  const details: Record<string, number> = {};

  // Deduct for violations
  for (const violation of violations) {
    const deduction = VIOLATION_DEDUCTIONS[violation.violationType] || 5;
    totalDeductions += deduction;
    details[violation.violationType] = (details[violation.violationType] || 0) + 1;
  }

  score -= totalDeductions;

  // Face visibility adjustments
  let faceAdjustment = 0;
  if (faceVisibilityPercentage < 80) {
    faceAdjustment = -10;
  } else if (faceVisibilityPercentage < 90) {
    faceAdjustment = -5;
  } else if (faceVisibilityPercentage > 95) {
    faceAdjustment = 5;
  }
  score += faceAdjustment;

  // Bonus for zero violations
  const bonus = violations.length === 0 ? 5 : 0;
  score += bonus;

  // Clamp score
  score = Math.max(0, Math.min(100, score));

  // Determine integrity
  let integrity: SecurityScoreResult["integrity"];
  if (score >= 90) integrity = "VERIFIED - High Integrity";
  else if (score >= 75) integrity = "VERIFIED - Good Integrity";
  else if (score >= 60) integrity = "FLAGGED - Review Recommended";
  else integrity = "FLAGGED - High Risk";

  return {
    score: Math.round(score),
    integrity,
    breakdown: {
      baseScore: 100,
      violationDeductions: totalDeductions,
      faceVisibilityAdjustment: faceAdjustment,
      bonusPoints: bonus,
    },
    details,
  };
}

export function shouldTerminateInterview(violations: ISecurityLog[]): {
  shouldTerminate: boolean;
  reason?: string;
} {
  const counts: Record<string, number> = {};
  const severityCounts: Record<string, number> = {};

  for (const v of violations) {
    counts[v.violationType] = (counts[v.violationType] || 0) + 1;
    severityCounts[v.severity] = (severityCounts[v.severity] || 0) + 1;
  }

  // Critical violation = immediate terminate
  if ((severityCounts["critical"] || 0) >= 1) {
    return { shouldTerminate: true, reason: "Critical security violation detected" };
  }

  // 2+ high violations
  if ((severityCounts["high"] || 0) >= 2) {
    return { shouldTerminate: true, reason: "Multiple high-severity violations" };
  }

  // 3+ medium violations
  if ((severityCounts["medium"] || 0) >= 3) {
    return { shouldTerminate: true, reason: "Too many security violations" };
  }

  // Total violations > 5
  if (violations.length > 5) {
    return { shouldTerminate: true, reason: "Excessive number of violations" };
  }

  return { shouldTerminate: false };
}
