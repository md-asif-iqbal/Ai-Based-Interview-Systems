import { Types } from "mongoose";

// ==========================================
// User Types
// ==========================================
export type UserRole = "candidate" | "recruiter" | "admin";

export interface IUser {
  _id: Types.ObjectId;
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  emailVerified: boolean;
  profilePicture?: string;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserMethods {
  comparePassword(password: string): Promise<boolean>;
  generateAuthToken(): string;
}

// ==========================================
// Company Types
// ==========================================
export interface ICompany {
  _id: Types.ObjectId;
  name: string;
  logo?: string;
  website?: string;
  industry: string;
  size: "1-10" | "11-50" | "51-200" | "201-500" | "501-1000" | "1000+";
  description?: string;
  location: string;
  ownerId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// ==========================================
// Candidate Types
// ==========================================
export interface IParsedResume {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  summary?: string;
  skills: string[];
  experience: IExperience[];
  education: IEducation[];
  projects: IProject[];
  totalExperienceYears: number;
  certifications: string[];
  languages: string[];
  achievements: string[];
  volunteerWork: string[];
  hobbies: string[];
  references: IReference[];
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  websiteUrl?: string;
  overallScore: number;
}

export interface IProject {
  name: string;
  description: string;
  technologies: string[];
  url?: string;
}

export interface IReference {
  name: string;
  title: string;
  company: string;
  contact?: string;
}

export interface IExperience {
  company: string;
  title: string;
  startDate: string;
  endDate?: string;
  description: string;
  current?: boolean;
}

export interface IEducation {
  degree: string;
  institution: string;
  year: string;
  gpa?: string;
  field?: string;
}

export interface ICandidate {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  resumeUrl?: string;
  parsedResume?: IParsedResume;
  resumeQualityScore: number;
  skills: string[];
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  preferences?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

// ==========================================
// Job Posting Types
// ==========================================
export type EmploymentType = "full_time" | "part_time" | "contract" | "internship";
export type JobStatus = "draft" | "active" | "closed" | "deleted";

export interface IJobPosting {
  _id: Types.ObjectId;
  companyId: Types.ObjectId;
  title: string;
  description: string;
  requirements: {
    skills: string[];
    experienceYears: number;
    education: string;
  };
  department?: string;
  location: string;
  remote: boolean;
  employmentType: EmploymentType;
  salaryRange?: {
    min: number;
    max: number;
    currency: string;
  };
  benefits?: string[];
  status: JobStatus;
  createdBy: Types.ObjectId;
  viewCount: number;
  applicationCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// ==========================================
// Application Types
// ==========================================
export type ApplicationStatus =
  | "applied"
  | "screening"
  | "interview_scheduled"
  | "interviewed"
  | "under_review"
  | "offer"
  | "rejected"
  | "withdrawn";

export interface IApplication {
  _id: Types.ObjectId;
  jobId: Types.ObjectId;
  candidateId: Types.ObjectId;
  status: ApplicationStatus;
  resumeMatchScore: number;
  coverLetter?: string;
  expectedSalary?: number;
  noticePeriod?: string;
  canStartFrom?: Date;
  applicationData?: Record<string, unknown>;
  appliedAt: Date;
  updatedAt: Date;
}

// ==========================================
// Interview Types
// ==========================================
export type InterviewType = "screening" | "technical" | "behavioral" | "final";
export type InterviewMode = "ai_conducted" | "live_human" | "live_assisted";
export type InterviewStatus = "scheduled" | "in_progress" | "completed" | "cancelled" | "terminated";
export type AIRecommendation = "strong_hire" | "hire" | "maybe" | "no_hire";

export interface IDetailedScores {
  technical: number;
  communication: number;
  problemSolving: number;
  confidence: number;
}

export interface IInterview {
  _id: Types.ObjectId;
  applicationId: Types.ObjectId;
  interviewType: InterviewType;
  mode: InterviewMode;
  scheduledAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  durationSeconds?: number;
  status: InterviewStatus;
  questions: IInterviewQuestion[];
  answers: IInterviewAnswer[];
  overallScore?: number;
  detailedScores?: IDetailedScores;
  strengths: string[];
  weaknesses: string[];
  aiRecommendation?: AIRecommendation;
  videoUrl?: string;
  transcript?: string;
  securityScore?: number;
  totalViolations: number;
  violationSummary?: Record<string, number>;
  faceVisibilityPercentage?: number;
  integrityVerified: boolean;
  terminatedReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ==========================================
// Interview Question Types
// ==========================================
export type QuestionCategory = "technical" | "behavioral" | "situational";
export type QuestionDifficulty = "easy" | "medium" | "hard";

export interface IInterviewQuestion {
  _id?: Types.ObjectId;
  questionText: string;
  category: QuestionCategory;
  difficulty: QuestionDifficulty;
  expectedKeywords: string[];
  timeLimitSeconds: number;
  followUpQuestions?: string[];
  order: number;
}

// ==========================================
// Interview Answer Types
// ==========================================
export interface IInterviewAnswer {
  _id?: Types.ObjectId;
  questionIndex: number;
  answerText: string;
  audioUrl?: string;
  duration: number;
  score?: number;
  evaluation?: IAnswerEvaluation;
  submittedAt: Date;
}

export interface IAnswerEvaluation {
  score: number;
  relevanceScore: number;
  depthScore: number;
  clarityScore: number;
  technicalAccuracy: number;
  keywordsFound: string[];
  keywordsMissing: string[];
  feedback: string;
  suggestions: string[];
  sentiment: "positive" | "neutral" | "negative";
}

// ==========================================
// Security Types
// ==========================================
export type ViolationType =
  | "tab_switch"
  | "fullscreen_exit"
  | "multiple_faces"
  | "face_not_visible"
  | "copy_paste"
  | "devtools_open"
  | "suspicious_audio"
  | "looking_away";

export type ViolationSeverity = "low" | "medium" | "high" | "critical";
export type ViolationAction = "warning_shown" | "interview_paused" | "interview_terminated";

export interface ISecurityLog {
  _id: Types.ObjectId;
  interviewId: Types.ObjectId;
  violationType: ViolationType;
  severity: ViolationSeverity;
  timestamp: Date;
  screenshotUrl?: string;
  videoTimestamp?: number;
  details?: Record<string, unknown>;
  actionTaken: ViolationAction;
  warningCount: number;
}

export interface IInterviewSnapshot {
  _id: Types.ObjectId;
  interviewId: Types.ObjectId;
  snapshotUrl: string;
  snapshotType: "periodic" | "violation" | "suspicious_activity";
  timestamp: Date;
  videoTimestamp?: number;
  aiAnalysis?: {
    facesDetected: number;
    emotions?: string[];
    gazeDirection?: string;
  };
}

// ==========================================
// Notification Types
// ==========================================
export type NotificationType =
  | "application_received"
  | "application_status"
  | "interview_scheduled"
  | "interview_reminder"
  | "interview_completed"
  | "offer_received";

export interface INotification {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  link?: string;
  data?: Record<string, unknown>;
  createdAt: Date;
}

// ==========================================
// API Response Types
// ==========================================
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ==========================================
// Auth Types
// ==========================================
export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface AuthUser {
  userId: string;
  email: string;
  role: UserRole;
  fullName: string;
}
