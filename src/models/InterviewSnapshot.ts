import mongoose, { Schema } from "mongoose";
import { IInterviewSnapshot } from "@/types";

const snapshotSchema = new Schema<IInterviewSnapshot>(
  {
    interviewId: {
      type: Schema.Types.ObjectId,
      ref: "Interview",
      required: true,
    },
    snapshotUrl: {
      type: String,
      required: true,
    },
    snapshotType: {
      type: String,
      enum: ["periodic", "violation", "suspicious_activity"],
      default: "periodic",
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    videoTimestamp: Number,
    aiAnalysis: {
      facesDetected: Number,
      emotions: [String],
      gazeDirection: String,
    },
  },
  { timestamps: true }
);

snapshotSchema.index({ interviewId: 1, timestamp: 1 });

const InterviewSnapshot =
  mongoose.models.InterviewSnapshot ||
  mongoose.model<IInterviewSnapshot>("InterviewSnapshot", snapshotSchema);
export default InterviewSnapshot;
