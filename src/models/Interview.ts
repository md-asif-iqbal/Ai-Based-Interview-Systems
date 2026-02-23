import mongoose, { Schema } from "mongoose";
import { IInterview } from "@/types";

const questionSchema = new Schema(
  {
    questionText: { type: String, required: true },
    question: { type: String }, // alias for compatibility
    category: {
      type: String,
      enum: ["technical", "behavioral", "situational"],
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    expectedKeywords: [String],
    timeLimit: { type: Number, default: 50 },
    timeLimitSeconds: { type: Number, default: 50 },
    followUpQuestions: [String],
    order: { type: Number, required: true },
  },
  { _id: true }
);

const evaluationSchema = new Schema(
  {
    score: Number,
    relevanceScore: Number,
    depthScore: Number,
    clarityScore: Number,
    technicalAccuracy: Number,
    keywordsFound: [String],
    keywordsMissing: [String],
    feedback: String,
    suggestions: [String],
    sentiment: {
      type: String,
      enum: ["positive", "neutral", "negative"],
    },
  },
  { _id: false }
);

const answerSchema = new Schema(
  {
    questionIndex: { type: Number, required: true },
    answerText: { type: String, required: true },
    audioUrl: String,
    duration: { type: Number, default: 0 },
    score: { type: Number, min: 0, max: 100 },
    evaluation: evaluationSchema,
    submittedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const interviewSchema = new Schema<IInterview>(
  {
    applicationId: {
      type: Schema.Types.ObjectId,
      ref: "Application",
      required: true,
    },
    interviewType: {
      type: String,
      enum: ["screening", "technical", "behavioral", "final"],
      required: true,
    },
    mode: {
      type: String,
      enum: ["ai_conducted", "live_human", "live_assisted"],
      default: "ai_conducted",
    },
    scheduledAt: {
      type: Date,
      required: true,
    },
    startedAt: Date,
    completedAt: Date,
    durationSeconds: Number,
    status: {
      type: String,
      enum: ["scheduled", "ready", "in_progress", "completed", "cancelled", "terminated"],
      default: "scheduled",
    },
    questions: [questionSchema],
    answers: [answerSchema],
    overallScore: { type: Number, min: 0, max: 100 },
    detailedScores: {
      technical: { type: Number, min: 0, max: 100 },
      communication: { type: Number, min: 0, max: 100 },
      problemSolving: { type: Number, min: 0, max: 100 },
      confidence: { type: Number, min: 0, max: 100 },
    },
    strengths: [String],
    weaknesses: [String],
    aiRecommendation: {
      type: String,
      enum: ["strong_hire", "hire", "maybe", "no_hire"],
    },
    videoUrl: String,
    transcript: String,
    securityScore: { type: Number, min: 0, max: 100, default: 100 },
    totalViolations: { type: Number, default: 0 },
    violationSummary: {
      type: Schema.Types.Mixed,
      default: {},
    },
    faceVisibilityPercentage: { type: Number, default: 100 },
    integrityVerified: { type: Boolean, default: true },
    terminatedReason: String,
  },
  { timestamps: true }
);

interviewSchema.index({ applicationId: 1 });
interviewSchema.index({ status: 1 });
interviewSchema.index({ scheduledAt: 1 });

const Interview = mongoose.models.Interview || mongoose.model<IInterview>("Interview", interviewSchema);
export default Interview;
