import mongoose, { Schema } from "mongoose";
import { IJobPosting } from "@/types";

const jobPostingSchema = new Schema<IJobPosting>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: [true, "Job description is required"],
    },
    requirements: {
      skills: [{ type: String, trim: true }],
      experienceYears: { type: Number, default: 0 },
      education: String,
    },
    department: String,
    location: {
      type: String,
      required: [true, "Location is required"],
    },
    remote: {
      type: Boolean,
      default: false,
    },
    employmentType: {
      type: String,
      enum: ["full_time", "part_time", "contract", "internship"],
      default: "full_time",
    },
    salaryRange: {
      min: Number,
      max: Number,
      currency: { type: String, default: "BDT" },
    },
    benefits: [String],
    status: {
      type: String,
      enum: ["draft", "active", "closed", "deleted"],
      default: "draft",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    viewCount: { type: Number, default: 0 },
    applicationCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

jobPostingSchema.index({ status: 1, createdAt: -1 });
jobPostingSchema.index({ companyId: 1 });
jobPostingSchema.index({ createdBy: 1 });
jobPostingSchema.index({ title: "text", description: "text" });
jobPostingSchema.index({ "requirements.skills": 1 });

const JobPosting = mongoose.models.JobPosting || mongoose.model<IJobPosting>("JobPosting", jobPostingSchema);
export default JobPosting;
