"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Briefcase,
  FileText,
  Video,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Loader2,
  Upload,
  TrendingUp,
  Calendar,
  Sparkles,
  Bot,
  Award,
  Target,
  Globe2,
  ShieldCheck,
  Play,
  ArrowUpRight,
  Check,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ResumeUpload from "@/components/forms/ResumeUpload";
import ResumeAnalysisResults from "@/components/resume/ResumeAnalysisResults";

interface PopulatedJob {
  _id: string;
  title: string;
  companyId?: { name: string; logo?: string };
  location?: string;
  salary?: { min?: number; max?: number; currency?: string };
}

interface Application {
  _id: string;
  jobId: PopulatedJob;
  status: string;
  resumeMatchScore?: number;
  createdAt: string;
  applicationData?: {
    selectedForFinalRound?: boolean;
    finalInterview?: {
      scheduledAt?: string;
      meetingLink?: string;
      notes?: string;
      selectedAt?: string;
    };
  };
}

interface Interview {
  _id: string;
  applicationId?: {
    jobId?: {
      title: string;
      company?: string;
      location?: string;
      type?: string;
    };
  };
  job?: { title: string };
  status: string;
  scheduledAt?: string;
  overallScore?: number;
  detailedScores?: {
    technical?: number;
    communication?: number;
    problemSolving?: number;
    confidence?: number;
  };
  aiRecommendation?: string;
  strengths?: string[];
  weaknesses?: string[];
  questions?: Array<{ questionText?: string; timeLimit?: number }>;
}

interface UserProfile {
  _id: string;
  fullName: string;
  email: string;
  role: string;
}

interface CandidateProfile {
  parsedResume?: Record<string, unknown>;
  skills?: string[];
}

const PIPELINE_STAGES = [
  { id: "applied", label: "Applied" },
  { id: "screening", label: "AI Screening" },
  { id: "interview", label: "AI Interview" },
  { id: "review", label: "Team Review" },
  { id: "final_interview", label: "Final Round 🎯" },
  { id: "decision", label: "Offer / Decision" },
];

function getStageIndex(status: string): number {
  switch (status) {
    case "applied":
      return 0;
    case "screening":
      return 1;
    case "interview_scheduled":
    case "ready":
    case "in_progress":
      return 2;
    case "interviewed":
    case "under_review":
      return 3;
    case "final_interview":
      return 4;
    case "offer":
    case "rejected":
    case "withdrawn":
      return 5;
    default:
      return 0;
  }
}

export default function CandidateDashboard() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [candidate, setCandidate] = useState<CandidateProfile | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [showResumeUpload, setShowResumeUpload] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [userRes, appsRes, interviewsRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/applications/my"),
        fetch("/api/interviews"),
      ]);

      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData.user);
        setCandidate(userData.candidate || null);
      }
      if (appsRes.ok) {
        const appsData = await appsRes.json();
        setApplications(appsData.data || appsData.applications || []);
      }
      if (interviewsRes.ok) {
        const interviewsData = await interviewsRes.json();
        setInterviews(interviewsData.data || []);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Profile Strength & Readiness Calculation
  const hasResume = Boolean(candidate?.parsedResume);
  const skillsCount = candidate?.skills?.length || 0;
  const completedInterviews = interviews.filter((i) => i.status === "completed");
  const hasCompletedInterview = completedInterviews.length > 0;

  let readinessScore = 20; // base profile
  if (hasResume) readinessScore += 35;
  if (skillsCount >= 3) readinessScore += 20;
  if (hasCompletedInterview) readinessScore += 25;

  const stats = {
    total: applications.length,
    pending: applications.filter((a) => a.status === "applied" || a.status === "screening").length,
    activeInterviews: interviews.filter((i) => i.status === "scheduled" || i.status === "ready" || i.status === "in_progress").length,
    completedInterviews: completedInterviews.length,
    avgScore: completedInterviews.length > 0
      ? Math.round(completedInterviews.reduce((acc, i) => acc + (i.overallScore || 0), 0) / completedInterviews.length)
      : 0,
  };

  const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    applied: { label: "Applied", color: "bg-[#22396F] text-[#FCF1D0]", icon: <Clock className="h-3 w-3" /> },
    screening: { label: "AI Screening", color: "bg-[#0D1C42] border border-[#22396F] text-white", icon: <Bot className="h-3 w-3 text-cyan-400" /> },
    interview_scheduled: { label: "Interview Ready", color: "bg-[#FCF1D0] text-[#010736] font-bold", icon: <Video className="h-3 w-3" /> },
    ready: { label: "Interview Ready", color: "bg-[#FCF1D0] text-[#010736] font-bold", icon: <Video className="h-3 w-3" /> },
    in_progress: { label: "In Progress", color: "bg-amber-500 text-white font-bold", icon: <Clock className="h-3 w-3 animate-spin" /> },
    interviewed: { label: "Interviewed", color: "bg-[#22396F] text-[#FCF1D0]", icon: <CheckCircle2 className="h-3 w-3" /> },
    under_review: { label: "Under Review", color: "bg-[#0D1C42] border border-[#22396F] text-white", icon: <FileText className="h-3 w-3" /> },
    final_interview: { label: "Final Round 🎯", color: "bg-emerald-500 text-white font-extrabold shadow-sm", icon: <Sparkles className="h-3 w-3 text-white" /> },
    offer: { label: "Offer Extended", color: "bg-emerald-500 text-white font-bold", icon: <Award className="h-3 w-3" /> },
    rejected: { label: "Not Selected", color: "bg-[#010736] border border-[#22396F] text-slate-400", icon: <XCircle className="h-3 w-3" /> },
    withdrawn: { label: "Withdrawn", color: "bg-[#010736] text-[#cbd5e1]", icon: <XCircle className="h-3 w-3" /> },
  };

  const finalRoundApps = applications.filter(
    (a) => a.status === "final_interview" || Boolean(a.applicationData?.selectedForFinalRound)
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#010736]">
        <Loader2 className="h-8 w-8 animate-spin text-[#22396F] dark:text-[#FCF1D0]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#010736] text-[#010736] dark:text-white transition-colors duration-200 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-8 space-y-8">
        
        {/* HERO COMMAND CENTER BANNER */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#010736] via-[#0D1C42] to-[#22396F] p-6 sm:p-8 text-white shadow-xl border border-white/10"
        >
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left greeting & status */}
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-[#FCF1D0] backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5 text-[#FCF1D0]" /> Next-Gen AI Career Hub
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                Welcome back, <span className="text-[#FCF1D0]">{user?.fullName?.split(" ")[0] || "Candidate"}</span> 👋
              </h1>
              <p className="text-sm sm:text-base text-[#cbd5e1] max-w-2xl leading-relaxed">
                Your AI-powered career co-pilot is active. Track application pipelines, simulate real-time AI interviews in English or বাংলা, and level up your hiring readiness score.
              </p>

              {/* Multilingual & Proctoring Pills */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 text-xs font-medium text-white border border-white/10">
                  <Globe2 className="h-3.5 w-3.5 text-[#FCF1D0]" />
                  Dual-Language: English & বাংলা (Bengali)
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 text-xs font-medium text-white border border-white/10">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  Anti-Cheating Proctoring Verified
                </span>
              </div>
            </div>

            {/* Right: AI Career Readiness Score Widget */}
            <div className="lg:col-span-4 bg-white/5 border border-white/15 rounded-2xl p-5 backdrop-blur-md space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#cbd5e1] flex items-center gap-1.5">
                  <Target className="h-4 w-4 text-[#FCF1D0]" /> Profile Strength
                </span>
                <Badge className="bg-[#FCF1D0] text-[#010736] font-bold text-xs border-0">
                  {readinessScore >= 80 ? "Job Ready 🚀" : readinessScore >= 50 ? "Rising Talent ⭐" : "Getting Started 🎯"}
                </Badge>
              </div>

              <div>
                <div className="flex items-baseline justify-between mb-1.5">
                  <span className="text-3xl font-black text-white">{readinessScore}%</span>
                  <span className="text-xs text-[#cbd5e1]">Goal: 100%</span>
                </div>
                <Progress value={readinessScore} className="h-2.5 bg-white/20" />
              </div>

              {/* Readiness Checklist */}
              <div className="space-y-1.5 text-xs text-[#cbd5e1] pt-1">
                <div className="flex items-center gap-2">
                  <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] ${hasResume ? "bg-emerald-500 text-white" : "bg-white/20 text-white"}`}>
                    <Check className="h-2.5 w-2.5" />
                  </span>
                  <span>ATS Resume Analyzed ({hasResume ? "+35%" : "0%"})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] ${skillsCount >= 3 ? "bg-emerald-500 text-white" : "bg-white/20 text-white"}`}>
                    <Check className="h-2.5 w-2.5" />
                  </span>
                  <span>Key Tech Skills Verified ({skillsCount >= 3 ? "+20%" : "0%"})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] ${hasCompletedInterview ? "bg-emerald-500 text-white" : "bg-white/20 text-white"}`}>
                    <Check className="h-2.5 w-2.5" />
                  </span>
                  <span>AI Interview Completed ({hasCompletedInterview ? "+25%" : "0%"})</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CELEBRATORY FINAL INTERVIEW ROUND INVITATION BANNER */}
        {finalRoundApps.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-6 sm:p-7 text-white shadow-xl relative overflow-hidden border border-emerald-400/40"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                  <Sparkles className="h-3.5 w-3.5 text-yellow-300" /> Final Interview Round Invitation
                </div>
                <h2 className="text-xl sm:text-2xl font-black">
                  🎉 Congratulations! You have been selected for the Final Interview!
                </h2>
                {finalRoundApps.map((fa) => {
                  const finalInfo = fa.applicationData?.finalInterview;
                  return (
                    <div key={fa._id} className="pt-1 space-y-1 text-xs sm:text-sm text-emerald-100">
                      <p>
                        Position: <strong>{fa.jobId?.title || "Role"}</strong> {fa.jobId?.companyId?.name ? `• ${fa.jobId.companyId.name}` : ""}
                      </p>
                      {finalInfo?.notes && (
                        <p className="italic text-emerald-100/90 bg-black/15 p-2 rounded-xl">
                          &ldquo;{finalInfo.notes}&rdquo;
                        </p>
                      )}
                      {finalInfo?.scheduledAt && (
                        <p className="font-semibold text-yellow-200">
                          📅 Scheduled: {new Date(finalInfo.scheduledAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                {finalRoundApps[0]?.applicationData?.finalInterview?.meetingLink ? (
                  <a
                    href={finalRoundApps[0].applicationData.finalInterview.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white text-emerald-800 font-extrabold text-sm shadow-lg hover:bg-emerald-50 transition-all"
                  >
                    <Video className="h-4 w-4 text-emerald-600" /> Join Final Round Meeting
                  </a>
                ) : null}
                <Link href="/applications">
                  <Button
                    variant="outline"
                    className="border-white/30 bg-white/10 text-white hover:bg-white/20 font-bold text-xs h-11 px-5 rounded-2xl"
                  >
                    View Applications <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        {/* QUICK ACTION HUB */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/interviews" className="group">
            <Card className="border-[#cbd5e1] dark:border-[#22396F] bg-white dark:bg-[#0D1C42] hover:border-[#22396F] dark:hover:border-[#FCF1D0] transition-all shadow-sm hover:shadow-md h-full">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#010736] dark:bg-[#FCF1D0] text-[#FCF1D0] dark:text-[#010736]">
                  <Video className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-[#010736] dark:text-white group-hover:text-[#22396F] dark:group-hover:text-[#FCF1D0] transition-colors">
                      AI Interview Board
                    </p>
                    <ArrowUpRight className="h-4 w-4 text-[#94a3b8] group-hover:text-[#22396F] dark:group-hover:text-[#FCF1D0]" />
                  </div>
                  <p className="text-xs text-[#475569] dark:text-[#cbd5e1] mt-0.5">
                    {stats.activeInterviews > 0 ? `${stats.activeInterviews} interview ready to join` : "View history & scores"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/resume-parser" className="group">
            <Card className="border-[#cbd5e1] dark:border-[#22396F] bg-white dark:bg-[#0D1C42] hover:border-[#22396F] dark:hover:border-[#FCF1D0] transition-all shadow-sm hover:shadow-md h-full">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#22396F] text-[#FCF1D0]">
                  <FileText className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-[#010736] dark:text-white group-hover:text-[#22396F] dark:group-hover:text-[#FCF1D0] transition-colors">
                      ATS Resume Scanner
                    </p>
                    <ArrowUpRight className="h-4 w-4 text-[#94a3b8] group-hover:text-[#22396F] dark:group-hover:text-[#FCF1D0]" />
                  </div>
                  <p className="text-xs text-[#475569] dark:text-[#cbd5e1] mt-0.5">
                    Live 0%-100% smooth parsing & insights
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/jobs" className="group">
            <Card className="border-[#cbd5e1] dark:border-[#22396F] bg-white dark:bg-[#0D1C42] hover:border-[#22396F] dark:hover:border-[#FCF1D0] transition-all shadow-sm hover:shadow-md h-full">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#0D1C42] dark:bg-[#22396F] text-[#FCF1D0] border border-[#22396F]">
                  <Briefcase className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-[#010736] dark:text-white group-hover:text-[#22396F] dark:group-hover:text-[#FCF1D0] transition-colors">
                      Explore Matching Jobs
                    </p>
                    <ArrowUpRight className="h-4 w-4 text-[#94a3b8] group-hover:text-[#22396F] dark:group-hover:text-[#FCF1D0]" />
                  </div>
                  <p className="text-xs text-[#475569] dark:text-[#cbd5e1] mt-0.5">
                    Apply with 1-click using parsed CV
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Submitted Applications", value: stats.total, icon: Briefcase, color: "text-[#22396F] dark:text-[#FCF1D0]" },
            { label: "Under AI Screening", value: stats.pending, icon: Clock, color: "text-amber-500" },
            { label: "Scheduled Interviews", value: stats.activeInterviews, icon: Video, color: "text-blue-500" },
            { label: "Avg AI Score", value: stats.avgScore > 0 ? `${stats.avgScore}%` : "N/A", icon: Award, color: "text-emerald-500" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Card className="border-[#cbd5e1] dark:border-[#22396F] bg-white dark:bg-[#0D1C42] shadow-sm">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f1f5f9] dark:bg-[#010736] border border-[#cbd5e1] dark:border-[#22396F]">
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-xl font-extrabold text-[#010736] dark:text-white">{stat.value}</p>
                    <p className="text-[11px] text-[#475569] dark:text-[#cbd5e1]">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* MAIN TABS: APPLICATIONS (PIPELINE) | INTERVIEWS | RESUME & SKILLS */}
        <Tabs defaultValue="applications" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#cbd5e1] dark:border-[#22396F] pb-3">
            <TabsList className="bg-[#f1f5f9] dark:bg-[#0D1C42] border border-[#cbd5e1] dark:border-[#22396F] p-1">
              <TabsTrigger value="applications" className="text-xs sm:text-sm font-semibold">
                Applications Pipeline ({applications.length})
              </TabsTrigger>
              <TabsTrigger value="interviews" className="text-xs sm:text-sm font-semibold">
                AI Interviews ({interviews.length})
              </TabsTrigger>
              <TabsTrigger value="resume" className="text-xs sm:text-sm font-semibold">
                ATS Resume & Skills
              </TabsTrigger>
            </TabsList>

            <Link href="/jobs">
              <Button size="sm" className="bg-[#010736] text-[#FCF1D0] hover:bg-[#22396F] dark:bg-[#FCF1D0] dark:text-[#010736] dark:hover:bg-white font-bold gap-1.5 shadow-sm">
                <Briefcase className="h-3.5 w-3.5" /> Browse Open Roles
              </Button>
            </Link>
          </div>

          {/* TAB 1: APPLICATIONS WITH VISUAL PIPELINE STEPPER */}
          <TabsContent value="applications" className="space-y-4">
            {applications.length === 0 ? (
              <Card className="border-[#cbd5e1] dark:border-[#22396F] bg-white dark:bg-[#0D1C42]">
                <CardContent className="py-16 text-center space-y-3">
                  <Briefcase className="h-12 w-12 mx-auto text-[#94a3b8] opacity-50" />
                  <h3 className="text-lg font-bold text-[#010736] dark:text-white">No active job applications yet</h3>
                  <p className="text-sm text-[#475569] dark:text-[#cbd5e1] max-w-md mx-auto">
                    Browse open roles from top tech teams, submit your resume with 1-click, and start your automated AI interview process.
                  </p>
                  <Link href="/jobs">
                    <Button className="bg-[#010736] text-[#FCF1D0] dark:bg-[#FCF1D0] dark:text-[#010736] font-bold mt-2">
                      Find Open Jobs
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              applications.map((app, i) => {
                const currentStageIdx = getStageIndex(app.status);
                const cfg = statusConfig[app.status] || statusConfig.applied;
                const canJoinInterview = app.status === "interview_scheduled" || app.status === "ready" || app.status === "in_progress";

                return (
                  <motion.div
                    key={app._id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Card className="border-[#cbd5e1] dark:border-[#22396F] bg-white dark:bg-[#0D1C42] hover:border-[#22396F] dark:hover:border-[#FCF1D0] transition-all shadow-sm overflow-hidden">
                      <CardContent className="p-5 sm:p-6 space-y-5">
                        
                        {/* Top: Job Header & Actions */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-start gap-3.5">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#010736] border border-[#22396F] text-[#FCF1D0]">
                              <Briefcase className="h-5 w-5" />
                            </div>
                            <div>
                              <h3 className="text-base font-extrabold text-[#010736] dark:text-white">
                                {app.jobId?.title || "Software Engineering Role"}
                              </h3>
                              <p className="text-xs text-[#475569] dark:text-[#cbd5e1] mt-0.5">
                                {app.jobId?.companyId?.name || "Tech Enterprise"} • {app.jobId?.location || "Remote"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-start sm:self-center">
                            <Badge className={`text-xs ${cfg.color} border-0 gap-1.5 px-3 py-1`}>
                              {cfg.icon}
                              <span>{cfg.label}</span>
                            </Badge>

                            {app.resumeMatchScore != null && app.resumeMatchScore > 0 && (
                              <Badge variant="outline" className="text-xs font-semibold border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10">
                                <TrendingUp className="h-3 w-3 mr-1" /> {app.resumeMatchScore}% Skill Fit
                              </Badge>
                            )}

                            {canJoinInterview && (
                              <Link href={`/interview/${app._id}`}>
                                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5 shadow-sm animate-pulse">
                                  <Play className="h-3.5 w-3.5 fill-current" /> Join Interview Board
                                </Button>
                              </Link>
                            )}

                            <Link href={`/jobs/${app.jobId?._id}`}>
                              <Button variant="ghost" size="sm" className="h-8 text-xs text-[#475569] dark:text-[#cbd5e1]">
                                Details <ChevronRight className="h-3 w-3 ml-0.5" />
                              </Button>
                            </Link>
                          </div>
                        </div>

                        {/* Middle: Visual 5-Stage Stepper */}
                        <div className="pt-2">
                          <div className="hidden sm:grid grid-cols-5 gap-2 relative">
                            {PIPELINE_STAGES.map((stg, sIdx) => {
                              const isCompleted = sIdx < currentStageIdx;
                              const isCurrent = sIdx === currentStageIdx;

                              return (
                                <div key={stg.id} className="flex flex-col items-center text-center relative z-10">
                                  <div
                                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                                      isCompleted
                                        ? "bg-emerald-500 text-white shadow-sm"
                                        : isCurrent
                                        ? "bg-[#010736] text-[#FCF1D0] dark:bg-[#FCF1D0] dark:text-[#010736] ring-4 ring-[#FCF1D0]/30 shadow-md"
                                        : "bg-[#f1f5f9] dark:bg-[#010736] text-[#94a3b8] border border-[#cbd5e1] dark:border-[#22396F]"
                                    }`}
                                  >
                                    {isCompleted ? <Check className="h-3.5 w-3.5" /> : sIdx + 1}
                                  </div>
                                  <span
                                    className={`text-[11px] mt-1.5 font-semibold ${
                                      isCurrent
                                        ? "text-[#010736] dark:text-white"
                                        : isCompleted
                                        ? "text-emerald-600 dark:text-emerald-400"
                                        : "text-[#94a3b8]"
                                    }`}
                                  >
                                    {stg.label}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Bottom: Timestamp & Feedback summary */}
                        <div className="flex items-center justify-between text-[11px] text-[#475569] dark:text-[#cbd5e1] pt-2 border-t border-[#f1f5f9] dark:border-[#22396F]/40">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Applied on {new Date(app.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                          <span className="font-medium text-[#22396F] dark:text-[#FCF1D0]">
                            AI Proctoring Active • Automatic Evaluation Enabled
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </TabsContent>

          {/* TAB 2: INTERVIEWS WITH SCORE BREAKDOWN */}
          <TabsContent value="interviews" className="space-y-4">
            {interviews.length === 0 ? (
              <Card className="border-[#cbd5e1] dark:border-[#22396F] bg-white dark:bg-[#0D1C42]">
                <CardContent className="py-16 text-center space-y-3">
                  <Video className="h-12 w-12 mx-auto text-[#94a3b8] opacity-50" />
                  <h3 className="text-lg font-bold text-[#010736] dark:text-white">No interviews scheduled yet</h3>
                  <p className="text-sm text-[#475569] dark:text-[#cbd5e1] max-w-md mx-auto">
                    When you apply for a job with an automated AI board, your interview session will appear here instantly.
                  </p>
                </CardContent>
              </Card>
            ) : (
              interviews.map((interview, i) => {
                const isCompleted = interview.status === "completed";
                const isReady = interview.status === "scheduled" || interview.status === "ready" || interview.status === "in_progress";

                return (
                  <motion.div
                    key={interview._id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Card className="border-[#cbd5e1] dark:border-[#22396F] bg-white dark:bg-[#0D1C42] hover:border-[#22396F] dark:hover:border-[#FCF1D0] transition-all shadow-sm">
                      <CardContent className="p-5 sm:p-6 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-3.5">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#010736] border border-[#22396F] text-[#FCF1D0]">
                              <Video className="h-5 w-5" />
                            </div>
                            <div>
                              <h3 className="text-base font-extrabold text-[#010736] dark:text-white">
                                {interview.applicationId?.jobId?.title || interview.job?.title || "Technical Interview Session"}
                              </h3>
                              <p className="text-xs text-[#475569] dark:text-[#cbd5e1] mt-0.5">
                                {interview.applicationId?.jobId?.company || "Hiring Partner"} • {interview.questions?.length || 5} Questions
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {isCompleted && interview.overallScore != null && (
                              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#f1f5f9] dark:bg-[#010736] border border-[#cbd5e1] dark:border-[#22396F]">
                                <span className="text-xs font-semibold text-[#475569] dark:text-[#cbd5e1]">Overall:</span>
                                <span className="text-lg font-black text-[#22396F] dark:text-[#FCF1D0]">
                                  {interview.overallScore}%
                                </span>
                              </div>
                            )}

                            {isReady && (
                              <Link href={`/interview/${interview._id}`}>
                                <Button className="bg-[#010736] text-[#FCF1D0] hover:bg-[#22396F] dark:bg-[#FCF1D0] dark:text-[#010736] dark:hover:bg-white font-bold gap-2">
                                  <Play className="h-4 w-4 fill-current" /> Join Interview Room
                                </Button>
                              </Link>
                            )}
                          </div>
                        </div>

                        {/* Detailed Score Breakdown (If completed) */}
                        {isCompleted && interview.detailedScores && (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#f1f5f9] dark:border-[#22396F]/50">
                            {[
                              { label: "Technical Depth", val: interview.detailedScores.technical ?? 85 },
                              { label: "Communication", val: interview.detailedScores.communication ?? 90 },
                              { label: "Problem Solving", val: interview.detailedScores.problemSolving ?? 80 },
                              { label: "Confidence", val: interview.detailedScores.confidence ?? 88 },
                            ].map((sc) => (
                              <div key={sc.label} className="p-3 rounded-xl bg-[#f8fafc] dark:bg-[#010736] border border-[#cbd5e1] dark:border-[#22396F]">
                                <p className="text-[11px] text-[#475569] dark:text-[#cbd5e1]">{sc.label}</p>
                                <p className="text-base font-extrabold text-[#010736] dark:text-white mt-0.5">{sc.val}%</p>
                                <Progress value={sc.val} className="h-1.5 mt-2" />
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </TabsContent>

          {/* TAB 3: ATS RESUME & SKILLS ANALYSIS */}
          <TabsContent value="resume" className="space-y-6">
            {!candidate?.parsedResume ? (
              <Card className="border-[#cbd5e1] dark:border-[#22396F] bg-white dark:bg-[#0D1C42]">
                <CardContent className="py-12 px-6">
                  <div className="text-center max-w-md mx-auto mb-6">
                    <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-2xl bg-[#010736] border border-[#22396F] mb-3 text-[#FCF1D0]">
                      <Upload className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold text-[#010736] dark:text-white">Upload Your Resume for AI Screening</h3>
                    <p className="text-xs text-[#475569] dark:text-[#cbd5e1] mt-1.5">
                      Our Gemini AI parses technical skills, experience history, and builds a personalized ATS job readiness profile in seconds.
                    </p>
                  </div>
                  <div className="max-w-lg mx-auto">
                    <ResumeUpload onUploadComplete={() => fetchData()} />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-[#010736] dark:text-white flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-[#22396F] dark:text-[#FCF1D0]" />
                    ATS Diagnostic Results & Skill Graph
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowResumeUpload(!showResumeUpload)}
                    className="border-[#cbd5e1] dark:border-[#22396F] text-xs font-semibold"
                  >
                    <Upload className="h-3.5 w-3.5 mr-1" /> {showResumeUpload ? "Cancel" : "Re-Upload Resume"}
                  </Button>
                </div>

                {showResumeUpload && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                    <Card className="border-[#22396F] bg-[#0D1C42] text-white">
                      <CardContent className="p-6">
                        <ResumeUpload onUploadComplete={() => { fetchData(); setShowResumeUpload(false); }} />
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                <ResumeAnalysisResults data={candidate.parsedResume as Record<string, unknown>} />
              </div>
            )}
          </TabsContent>
        </Tabs>

      </div>
    </div>
  );
}
