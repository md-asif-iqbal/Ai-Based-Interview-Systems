"use client";

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
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ViolationWarningModalProps {
  isOpen: boolean;
  type: string;
  warningCount: number;
  maxWarnings: number;
  onDismiss: () => void;
}

const violationMessages: Record<string, { title: string; message: string; icon: LucideIcon }> = {
  tab_switch: {
    title: "Tab Switch Detected",
    message: "You switched to another tab. This has been recorded as a violation. Please stay on the interview tab.",
    icon: AlertTriangle,
  },
  window_blur: {
    title: "Window Focus Lost",
    message: "You clicked outside the interview window. Please keep focus on the interview.",
    icon: Search,
  },
  fullscreen_exit: {
    title: "Fullscreen Exit Detected",
    message: "You exited fullscreen mode. Fullscreen will be re-enabled automatically.",
    icon: Monitor,
  },
  no_face: {
    title: "Face Not Detected",
    message: "Your face is not visible in the camera. Please ensure you are properly positioned.",
    icon: User,
  },
  multiple_faces: {
    title: "Multiple Faces Detected",
    message: "Multiple people were detected in the frame. Please ensure you are alone.",
    icon: Users,
  },
  copy_paste: {
    title: "Copy/Paste Blocked",
    message: "Copy and paste actions are not allowed during the interview.",
    icon: ClipboardList,
  },
  right_click: {
    title: "Right-Click Blocked",
    message: "Right-click is disabled during the interview.",
    icon: MousePointer,
  },
  dev_tools: {
    title: "Developer Tools Detected",
    message: "Opening developer tools is a serious violation. This may lead to interview termination.",
    icon: Wrench,
  },
  screenshot: {
    title: "Screenshot Attempt",
    message: "Taking screenshots during the interview is not allowed.",
    icon: Camera,
  },
};

export default function ViolationWarningModal({
  isOpen,
  type,
  warningCount,
  maxWarnings,
  onDismiss,
}: ViolationWarningModalProps) {
  const config = violationMessages[type] || {
    title: "Security Violation",
    message: "An unauthorized action was detected.",
    icon: AlertTriangle,
  };

  const remaining = maxWarnings - warningCount;
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
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onDismiss}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-md"
          >
            <div className={`rounded-2xl border p-6 shadow-2xl ${
              isCritical
                ? "bg-red-50 dark:bg-red-950/50 border-red-500/30"
                : "bg-background border-border"
            }`}>
              {/* Close */}
              <button
                onClick={onDismiss}
                className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Icon */}
              <div className="text-center mb-4">
                <motion.div
                  initial={{ rotate: -10 }}
                  animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
                  transition={{ duration: 0.5 }}
                  className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl ${
                    isCritical
                      ? "bg-red-500/10"
                      : "bg-yellow-500/10"
                  }`}
                >
                  {isCritical ? (
                    <ShieldAlert className="h-8 w-8 text-red-500" />
                  ) : (
                    <AlertTriangle className="h-8 w-8 text-yellow-500" />
                  )}
                </motion.div>
              </div>

              {/* Content */}
              <div className="text-center mb-6">
                <h3 className={`text-lg font-bold mb-2 ${isCritical ? "text-red-600 dark:text-red-400" : ""}`}>
                  {config.title}
                </h3>
                <p className="text-sm text-muted-foreground">{config.message}</p>
              </div>

              {/* Warning Counter */}
              <div className={`rounded-xl p-3 mb-4 ${
                isCritical ? "bg-red-500/10" : "bg-muted/50"
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <Timer className="h-4 w-4" />
                    <span>Warnings remaining</span>
                  </div>
                  <span className={`font-bold ${isCritical ? "text-red-500" : "text-foreground"}`}>
                    {remaining} / {maxWarnings}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted mt-2 overflow-hidden">
                  <motion.div
                    initial={{ width: "100%" }}
                    animate={{ width: `${(remaining / maxWarnings) * 100}%` }}
                    className={`h-full rounded-full ${
                      isCritical ? "bg-red-500" : remaining <= 4 ? "bg-yellow-500" : "bg-green-500"
                    }`}
                  />
                </div>
              </div>

              {isCritical && (
                <p className="text-xs text-red-500 text-center mb-4 font-medium flex items-center justify-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  <span>Your interview may be terminated if violations continue</span>
                </p>
              )}

              <Button
                onClick={onDismiss}
                className="w-full bg-[#FCF1D0] text-[#010736] hover:bg-[#f5e6b8] font-semibold transition-colors"
              >
                I Understand, Continue
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
