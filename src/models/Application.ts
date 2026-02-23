import mongoose, { Schema } from "mongoose";
import { IApplication } from "@/types";

const applicationSchema = new Schema<IApplication>(
  {
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "JobPosting",
      required: true,
    },
    candidateId: {
      type: Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
    },
    status: {
      type: String,
      enum: [
        "applied",
        "screening",
        "interview_scheduled",
        "interviewed",
        "under_review",
        "offer",
        "rejected",
        "withdrawn",
      ],
      default: "applied",
    },
    resumeMatchScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    coverLetter: String,
    expectedSalary: Number,
    noticePeriod: String,
    canStartFrom: Date,
    applicationData: {
      type: Schema.Types.Mixed,
      default: {},
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

applicationSchema.index({ jobId: 1, candidateId: 1 }, { unique: true });
applicationSchema.index({ jobId: 1 });
applicationSchema.index({ candidateId: 1 });
applicationSchema.index({ status: 1 });

const Application =
  mongoose.models.Application || mongoose.model<IApplication>("Application", applicationSchema);
export default Application;
