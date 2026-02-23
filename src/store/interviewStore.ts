import { create } from "zustand";

export interface InterviewQuestion {
  _id: string;
  question?: string;
  questionText?: string;
  type?: "technical" | "behavioral" | "situational";
  difficulty?: "easy" | "medium" | "hard";
  category?: string;
  timeLimit?: number;
  timeLimitSeconds?: number;
  expectedAnswer?: string;
  expectedKeywords?: string[];
  order?: number;
}

export interface InterviewAnswer {
  questionId: string;
  answer: string;
  audioBlob?: Blob;
  timeSpent: number;
  evaluation?: {
    score: number;
    feedback: string;
    strengths: string[];
    improvements: string[];
  };
}

export interface InterviewViolation {
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  timestamp: string;
}

interface InterviewState {
  // Interview data
  interviewId: string | null;
  jobTitle: string;
  status: "idle" | "loading" | "ready" | "in_progress" | "paused" | "completed" | "terminated";
  questions: InterviewQuestion[];
  answers: InterviewAnswer[];
  violations: InterviewViolation[];

  // Current state
  currentQuestionIndex: number;
  timeRemaining: number;
  totalTimeRemaining: number;
  isRecording: boolean;
  isSpeaking: boolean;

  // Security
  securityScore: number;
  warningCount: number;
  isFullScreen: boolean;
  cameraActive: boolean;

  // Scores
  overallScore: number | null;
  aiRecommendation: string | null;

  // Candidate info
  candidateName: string;
  companyName: string;

  // Actions
  setInterviewId: (id: string) => void;
  setJobTitle: (title: string) => void;
  setStatus: (status: InterviewState["status"]) => void;
  setQuestions: (questions: InterviewQuestion[]) => void;
  addAnswer: (answer: InterviewAnswer) => void;
  updateAnswer: (questionId: string, update: Partial<InterviewAnswer>) => void;
  addViolation: (violation: InterviewViolation) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  goToQuestion: (index: number) => void;
  setTimeRemaining: (time: number) => void;
  setTotalTimeRemaining: (time: number) => void;
  setIsRecording: (recording: boolean) => void;
  setIsSpeaking: (speaking: boolean) => void;
  setSecurityScore: (score: number) => void;
  incrementWarning: () => void;
  setIsFullScreen: (fullscreen: boolean) => void;
  setCameraActive: (active: boolean) => void;
  setOverallScore: (score: number) => void;
  setAiRecommendation: (rec: string) => void;
  setCandidateName: (name: string) => void;
  setCompanyName: (name: string) => void;
  reset: () => void;
}

const initialState = {
  interviewId: null as string | null,
  jobTitle: "",
  status: "idle" as const,
  questions: [] as InterviewQuestion[],
  answers: [] as InterviewAnswer[],
  violations: [] as InterviewViolation[],
  currentQuestionIndex: 0,
  timeRemaining: 0,
  totalTimeRemaining: 0,
  isRecording: false,
  isSpeaking: false,
  securityScore: 100,
  warningCount: 0,
  isFullScreen: false,
  cameraActive: false,
  overallScore: null as number | null,
  aiRecommendation: null as string | null,
  candidateName: "",
  companyName: "",
};

export const useInterviewStore = create<InterviewState>((set) => ({
  ...initialState,

  setInterviewId: (id) => set({ interviewId: id }),
  setJobTitle: (title) => set({ jobTitle: title }),
  setStatus: (status) => set({ status }),
  setQuestions: (questions) => set({ questions }),

  addAnswer: (answer) =>
    set((state) => ({
      answers: [...state.answers.filter((a) => a.questionId !== answer.questionId), answer],
    })),

  updateAnswer: (questionId, update) =>
    set((state) => ({
      answers: state.answers.map((a) => (a.questionId === questionId ? { ...a, ...update } : a)),
    })),

  addViolation: (violation) =>
    set((state) => ({
      violations: [...state.violations, violation],
    })),

  nextQuestion: () =>
    set((state) => ({
      currentQuestionIndex: Math.min(state.currentQuestionIndex + 1, state.questions.length - 1),
    })),

  previousQuestion: () =>
    set((state) => ({
      currentQuestionIndex: Math.max(state.currentQuestionIndex - 1, 0),
    })),

  goToQuestion: (index) =>
    set((state) => ({
      currentQuestionIndex: Math.max(0, Math.min(index, state.questions.length - 1)),
    })),

  setTimeRemaining: (time) => set({ timeRemaining: time }),
  setTotalTimeRemaining: (time) => set({ totalTimeRemaining: time }),
  setIsRecording: (recording) => set({ isRecording: recording }),
  setIsSpeaking: (speaking) => set({ isSpeaking: speaking }),
  setSecurityScore: (score) => set({ securityScore: score }),
  incrementWarning: () => set((state) => ({ warningCount: state.warningCount + 1 })),
  setIsFullScreen: (fullscreen) => set({ isFullScreen: fullscreen }),
  setCameraActive: (active) => set({ cameraActive: active }),
  setOverallScore: (score) => set({ overallScore: score }),
  setAiRecommendation: (rec) => set({ aiRecommendation: rec }),
  setCandidateName: (name) => set({ candidateName: name }),
  setCompanyName: (name) => set({ companyName: name }),

  reset: () => set(initialState),
}));
