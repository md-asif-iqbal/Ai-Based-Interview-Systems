import mongoose, { Schema } from "mongoose";
import { ICandidate } from "@/types";

const experienceSchema = new Schema(
  {
    company: { type: String, required: true },
    title: { type: String, required: true },
    startDate: String,
    endDate: String,
    description: String,
    current: { type: Boolean, default: false },
  },
  { _id: false }
);

const educationSchema = new Schema(
  {
    degree: { type: String, required: true },
    institution: { type: String, required: true },
    year: String,
    gpa: String,
    field: String,
  },
  { _id: false }
);

const projectSchema = new Schema(
  {
    name: { type: String, required: true },
    description: String,
    technologies: [String],
    url: String,
  },
  { _id: false }
);

const referenceSchema = new Schema(
  {
    name: { type: String, required: true },
    title: String,
    company: String,
    contact: String,
  },
  { _id: false }
);

const parsedResumeSchema = new Schema(
  {
    name: String,
    email: String,
    phone: String,
    location: String,
    summary: String,
    skills: [String],
    experience: [experienceSchema],
    education: [educationSchema],
    projects: [projectSchema],
    totalExperienceYears: { type: Number, default: 0 },
    certifications: [String],
    languages: [String],
    achievements: [String],
    volunteerWork: [String],
    hobbies: [String],
    references: [referenceSchema],
    linkedinUrl: String,
    githubUrl: String,
    portfolioUrl: String,
    websiteUrl: String,
    overallScore: { type: Number, default: 0 },
  },
  { _id: false }
);

const candidateSchema = new Schema<ICandidate>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    resumeUrl: String,
    parsedResume: parsedResumeSchema,
    resumeQualityScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    skills: [{ type: String, trim: true }],
    linkedinUrl: String,
    githubUrl: String,
    portfolioUrl: String,
    preferences: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

candidateSchema.index({ userId: 1, createdAt: -1 });
candidateSchema.index({ skills: 1 });
candidateSchema.index({ resumeQualityScore: -1 });

const Candidate = mongoose.models.Candidate || mongoose.model<ICandidate>("Candidate", candidateSchema);
export default Candidate;
