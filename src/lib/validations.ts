import { z } from "zod";

// Auth Schemas
export const signupSchema = z
  .object({
    fullName: z.string().min(2, "Name must be at least 2 characters").max(100),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    phone: z.string().optional(),
    role: z.enum(["candidate", "recruiter"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Job Schemas
export const createJobSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  description: z.string().min(50, "Description must be at least 50 characters"),
  requirements: z.object({
    skills: z.array(z.string()).min(1, "At least one skill required"),
    experienceYears: z.number().min(0).default(0),
    education: z.string().optional(),
  }),
  department: z.string().optional(),
  location: z.string().min(1, "Location is required"),
  remote: z.boolean().default(false),
  employmentType: z.enum(["full_time", "part_time", "contract", "internship"]),
  salaryRange: z
    .object({
      min: z.number().min(0),
      max: z.number().min(0),
      currency: z.string().default("BDT"),
    })
    .optional(),
  benefits: z.array(z.string()).optional(),
  companyId: z.string(),
});

// Application Schemas
export const createApplicationSchema = z.object({
  jobId: z.string().min(1, "Job ID is required"),
  coverLetter: z.string().optional(),
  expectedSalary: z.number().optional(),
  noticePeriod: z.string().optional(),
  canStartFrom: z.string().optional(),
});

// Interview Schemas
export const createInterviewSchema = z.object({
  applicationId: z.string().min(1),
  scheduledAt: z.string().min(1, "Schedule date is required"),
  interviewType: z.enum(["screening", "technical", "behavioral", "final"]),
});

export const submitAnswerSchema = z.object({
  questionIndex: z.number().min(0),
  answerText: z.string().min(1, "Answer cannot be empty"),
  audioUrl: z.string().optional(),
  duration: z.number().min(0).default(0),
});

export const logViolationSchema = z.object({
  violationType: z.enum([
    "tab_switch",
    "fullscreen_exit",
    "multiple_faces",
    "face_not_visible",
    "copy_paste",
    "devtools_open",
    "suspicious_audio",
    "looking_away",
  ]),
  severity: z.enum(["low", "medium", "high", "critical"]),
  details: z.record(z.string(), z.unknown()).optional(),
  videoTimestamp: z.number().optional(),
});

// AI Service Schemas
export const generateQuestionsSchema = z.object({
  jobDescription: z.string().min(50, "Job description too short"),
  count: z.number().min(1).max(20).default(10),
  interviewType: z.enum(["screening", "technical", "behavioral", "final"]).optional(),
});

export const evaluateAnswerSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
  expectedKeywords: z.array(z.string()),
  jobContext: z.string().optional(),
});

export const generateCoverLetterSchema = z.object({
  candidateData: z.object({
    name: z.string(),
    experience: z.string().optional(),
    skills: z.array(z.string()).optional(),
    summary: z.string().optional(),
  }),
  jobData: z.object({
    company: z.string(),
    title: z.string(),
    requirements: z.string().optional(),
    description: z.string().optional(),
  }),
  tone: z.enum(["professional", "enthusiastic", "formal"]).optional(),
});

// Type exports
export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateJobInput = z.infer<typeof createJobSchema>;
export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type CreateInterviewInput = z.infer<typeof createInterviewSchema>;
export type SubmitAnswerInput = z.infer<typeof submitAnswerSchema>;
export type LogViolationInput = z.infer<typeof logViolationSchema>;
