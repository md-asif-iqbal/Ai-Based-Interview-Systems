import mongoose, { Schema } from "mongoose";
import { ISecurityLog } from "@/types";

const securityLogSchema = new Schema<ISecurityLog>(
  {
    interviewId: {
      type: Schema.Types.ObjectId,
      ref: "Interview",
      required: true,
    },
    violationType: {
      type: String,
      enum: [
        "tab_switch",
        "fullscreen_exit",
        "multiple_faces",
        "face_not_visible",
        "copy_paste",
        "devtools_open",
        "suspicious_audio",
        "looking_away",
      ],
      required: true,
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    screenshotUrl: String,
    videoTimestamp: Number,
    details: {
      type: Schema.Types.Mixed,
      default: {},
    },
    actionTaken: {
      type: String,
      enum: ["warning_shown", "interview_paused", "interview_terminated"],
      default: "warning_shown",
    },
    warningCount: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

securityLogSchema.index({ interviewId: 1, timestamp: 1 });
securityLogSchema.index({ violationType: 1 });

const SecurityLog =
  mongoose.models.SecurityLog || mongoose.model<ISecurityLog>("SecurityLog", securityLogSchema);
export default SecurityLog;
