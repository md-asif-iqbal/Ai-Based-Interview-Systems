"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  ShieldAlert,
  X,
  Timer,
  Search,
  Monitor,
  User,
  Users,
  ClipboardList,
  MousePointer,
  Wrench,
  Camera,
  EyeOff,
  Volume2,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { playTabSwitchWarningSound } from "@/lib/audio/warningSound";

interface ViolationWarningModalProps {
  isOpen: boolean;
  type: string;
  warningCount: number;
  maxWarnings: number;
  penaltyMarks?: number;
  isFirstWarning?: boolean;
  nextPenaltyMarks?: number;
  onDismiss: () => void;
}

const violationMessages: Record<string, { title: string; message: string; icon: LucideIcon }> = {
  tab_switch: {
    title: "Tab Switch Detected (Alarm Triggered)",
    message: "You switched to another browser tab or minimized the interview. Tab switching is strictly prohibited and penalty marks have been deducted from your score.",
    icon: AlertTriangle,
  },
  window_blur: {
    title: "Window Focus Lost",
    message: "You navigated outside the interview window. Focus must remain on the interview board at all times. Penalty marks have been deducted.",
    icon: Search,
  },
  fullscreen_exit: {
    title: "Fullscreen Exit Detected",
    message: "You exited fullscreen mode. Please return to fullscreen immediately. Penalty marks have been deducted.",
    icon: Monitor,
  },
  looking_away: {
    title: "Camera Eye-Contact Lost",
    message: "You looked away from the camera/screen. Please maintain direct eye contact with the camera and screen. Focus penalty has been applied.",
    icon: EyeOff,
  },
  no_face: {
    title: "Face Not Detected in Camera",
    message: "Your face is not visible in the camera frame. Please sit upright, stay centered, and look directly at your webcam.",
    icon: User,
  },
  multiple_faces: {
    title: "Multiple Faces Detected",
    message: "Multiple people were detected in your camera frame. Please ensure you are alone in the room.",
    icon: Users,
  },
  copy_paste: {
    title: "Copy/Paste Blocked",
    message: "Copy and paste actions are disabled during the live assessment.",
    icon: ClipboardList,
  },
  right_click: {
    title: "Right-Click Blocked",
    message: "Right-click context menu is disabled during the interview.",
    icon: MousePointer,
  },
  dev_tools: {
    title: "Developer Tools Detected",
    message: "Opening developer tools is a critical violation and will immediately terminate the interview.",
    icon: Wrench,
  },
  screenshot: {
    title: "Screenshot Attempt",
    message: "Capturing screenshots during the interview is strictly prohibited.",
    icon: Camera,
  },
};

export default function ViolationWarningModal({
  isOpen,
  type,
  warningCount,
  maxWarnings,
  penaltyMarks = 5,
  isFirstWarning = false,
  nextPenaltyMarks = 5,
  onDismiss,
}: ViolationWarningModalProps) {
  useEffect(() => {
    if (isOpen) {
      playTabSwitchWarningSound();
    }
  }, [isOpen]);

  const config = violationMessages[type] || {
    title: "Security Violation",
    message: "An unauthorized action was detected during the interview.",
    icon: AlertTriangle,
  };

  const remaining = Math.max(0, maxWarnings - warningCount);
  const isCritical = remaining <= 2;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md"
            onClick={onDismiss}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-md"
          >
            <div
              className={`rounded-3xl border p-6 sm:p-7 shadow-2xl relative ${
                isCritical
                  ? "bg-red-50 dark:bg-[#1a0505] border-red-500/50"
                  : isFirstWarning
                  ? "bg-amber-50/90 dark:bg-[#1c1608] border-amber-500/40"
                  : "bg-white dark:bg-[#0D1C42] border-[#22396F]"
              }`}
            >
              {/* Close */}
              <button
                onClick={onDismiss}
                className="absolute right-4 top-4 text-muted-foreground hover:text-foreground p-1"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Icon & Alarm Indicator */}
              <div className="text-center mb-4">
                <motion.div
                  initial={{ rotate: -10 }}
                  animate={{ rotate: [0, -12, 12, -8, 8, 0] }}
                  transition={{ duration: 0.6 }}
                  className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl ${
                    isCritical
                      ? "bg-red-500/20 text-red-500 ring-4 ring-red-500/30"
                      : isFirstWarning
                      ? "bg-amber-500/20 text-amber-500 ring-4 ring-amber-500/30"
                      : "bg-red-500/15 text-red-500 ring-4 ring-red-500/30"
                  }`}
                >
                  {isCritical ? (
                    <ShieldAlert className="h-8 w-8 text-red-500 animate-pulse" />
                  ) : (
                    <AlertTriangle className="h-8 w-8 text-amber-500" />
                  )}
                </motion.div>
                <div className="flex items-center justify-center gap-1.5 mt-2 text-xs font-bold text-red-500">
                  <Volume2 className="h-3.5 w-3.5 animate-bounce" /> Audible Warning Sound Triggered
                </div>
              </div>

              {/* Penalty Marks Deduction Notice */}
              <div className="text-center mb-3">
                {isFirstWarning ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 font-extrabold text-xs border border-amber-500/30">
                    ⚠️ 1st Warning (Grace Period) • 0 Marks Deducted
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/15 text-red-600 dark:text-red-400 font-extrabold text-xs border border-red-500/30">
                    🚨 Repeat Violation: -{penaltyMarks} Marks Deducted from Assessment Score
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="text-center mb-4">
                <h3 className={`text-lg font-extrabold mb-1.5 ${isCritical || !isFirstWarning ? "text-red-600 dark:text-red-400" : "text-[#010736] dark:text-amber-300"}`}>
                  {isFirstWarning ? "Security Warning: Stay on Interview Board" : config.title}
                </h3>
                <p className="text-xs text-[#475569] dark:text-[#cbd5e1] leading-relaxed">
                  {config.message}
                </p>
              </div>

              {/* Grace Explanation Box if First Warning */}
              {isFirstWarning ? (
                <div className="rounded-xl p-3 mb-4 bg-amber-500/10 border border-amber-500/25 text-left text-xs text-amber-900 dark:text-amber-200">
                  <p className="font-bold flex items-center gap-1.5 mb-1">
                    <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    First Offense Warning (Grace Rule)
                  </p>
                  <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-300/90">
                    No penalty marks were deducted for this first notice. However, <strong>any subsequent tab switch, window minimization, or camera defocus will immediately deduct -{nextPenaltyMarks} marks from your score</strong>.
                  </p>
                </div>
              ) : (
                <div className="rounded-xl p-3 mb-4 bg-red-500/10 border border-red-500/20 text-left text-xs text-red-800 dark:text-red-300">
                  <p className="font-bold flex items-center gap-1.5 mb-0.5">
                    <ShieldAlert className="h-4 w-4 text-red-500 shrink-0" />
                    Repeat Violation Penalized
                  </p>
                  <p className="text-[11px] leading-relaxed text-red-700 dark:text-red-300/90">
                    You have violated anti-cheating guidelines after the initial warning. -{penaltyMarks} marks have been subtracted from your overall evaluation score.
                  </p>
                </div>
              )}

              {/* Warning Counter */}
              <div
                className={`rounded-2xl p-3.5 mb-5 ${
                  isCritical ? "bg-red-500/15 border border-red-500/30" : "bg-[#f1f5f9] dark:bg-[#010736] border border-[#cbd5e1] dark:border-[#22396F]"
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-semibold">
                    <Timer className="h-4 w-4" />
                    <span>Security Warnings Left</span>
                  </div>
                  <span className={`font-black text-sm ${isCritical ? "text-red-500" : "text-[#010736] dark:text-white"}`}>
                    {remaining} / {maxWarnings}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-800 mt-2.5 overflow-hidden">
                  <motion.div
                    initial={{ width: "100%" }}
                    animate={{ width: `${(remaining / maxWarnings) * 100}%` }}
                    className={`h-full rounded-full transition-all ${
                      isCritical ? "bg-red-500" : remaining <= 4 ? "bg-amber-500" : "bg-emerald-500"
                    }`}
                  />
                </div>
              </div>

              {isCritical && (
                <p className="text-[11px] text-red-500 text-center mb-4 font-bold flex items-center justify-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  <span>Interview will terminate automatically if violations continue!</span>
                </p>
              )}

              <Button
                onClick={onDismiss}
                className="w-full bg-[#010736] text-[#FCF1D0] hover:bg-[#22396F] dark:bg-[#FCF1D0] dark:text-[#010736] dark:hover:bg-white font-bold transition-all shadow-md py-5 rounded-xl"
              >
                I Understand, Return to Interview
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
