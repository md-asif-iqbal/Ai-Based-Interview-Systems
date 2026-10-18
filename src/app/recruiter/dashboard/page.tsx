"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Briefcase,
  Users,
  Video,
  TrendingUp,
  ChevronRight,
  Loader2,
  Eye,
  CheckCircle2,
  FileText,
  BarChart3,
  Calendar,
  Search,
  Building2,
  Award,
  HelpCircle,
  XCircle,
  Sparkles,
  ShieldAlert,
  ExternalLink,
  Send,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface Job {
  _id: string;
  title: string;
  location: string;
  type: string;
  status: string;
  applicationCount?: number;
  createdAt: string;
}

interface Application {
  _id: string;
  candidate?: { userId?: { fullName: string; email: string }; skills?: string[] };
  job?: { _id: string; title: string };
  status: string;
  matchScore?: number;
  createdAt: string;
}

interface InterviewResult {
  _id: string;
  applicationId?: {
    _id?: string;
    status?: string;
    jobId?: { _id?: string; title: string };
    candidateId?: {
      _id?: string;
      fullName?: string;
      email?: string;
      userId?: { fullName: string; email: string };
      skills?: string[];
    };
    applicationData?: {
      selectedForFinalRound?: boolean;
      finalInterview?: {
        scheduledAt?: string;
        meetingLink?: string;
        notes?: string;
        selectedAt?: string;
      };
    };
  };
  status: string;
  overallScore?: number;
  penaltyPoints?: number;
  proctoringViolations?: Array<{ type: string; timestamp?: string }>;
  detailedScores?: {
    technical?: number;
    communication?: number;
    problemSolving?: number;
    confidence?: number;
  };
  aiRecommendation?: string;
  strengths?: string[];
  weaknesses?: string[];
  completedAt?: string;
  scheduledAt?: string;
  answers?: Array<{ score?: number }>;
  questions?: Array<{ questionText: string }>;
}

export default function RecruiterDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [interviews, setInterviews] = useState<InterviewResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchApps, setSearchApps] = useState("");

  // Final round selection modal state
  const [finalModalOpen, setFinalModalOpen] = useState(false);
  const [selectedInterviewForFinal, setSelectedInterviewForFinal] = useState<InterviewResult | null>(null);
  const [finalScheduleDate, setFinalScheduleDate] = useState("");
  const [finalMeetingLink, setFinalMeetingLink] = useState("");
  const [finalNotes, setFinalNotes] = useState("");
  const [submittingFinal, setSubmittingFinal] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [jobsRes, interviewsRes] = await Promise.all([
        fetch("/api/jobs?mine=true"),
        fetch("/api/interviews"),
      ]);
      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        setJobs(jobsData.jobs || []);
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

  const handleStatusChange = async (appId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/applications/${appId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setApplications((prev) =>
          prev.map((a) => (a._id === appId ? { ...a, status: newStatus } : a))
        );
        toast.success("Application status updated");
      }
    } catch {
      toast.error("Failed to update status");
    }
  };

  const openFinalModal = (interview: InterviewResult) => {
    setSelectedInterviewForFinal(interview);
    const existingFinal = interview.applicationId?.applicationData?.finalInterview;
    setFinalScheduleDate(
      existingFinal?.scheduledAt
        ? new Date(existingFinal.scheduledAt).toISOString().slice(0, 16)
        : ""
    );
    setFinalMeetingLink(existingFinal?.meetingLink || "");
    setFinalNotes(
      existingFinal?.notes ||
        "Congratulations! You have been selected for the final interview round."
    );
    setFinalModalOpen(true);
  };

  const handleSelectFinalInterview = async () => {
    if (!selectedInterviewForFinal) return;
    const appId =
      selectedInterviewForFinal.applicationId?._id ||
      (typeof selectedInterviewForFinal.applicationId === "string"
        ? (selectedInterviewForFinal.applicationId as string)
        : "");
    if (!appId) {
      toast.error("Application record not found for this candidate");
      return;
    }

    setSubmittingFinal(true);
    try {
      const res = await fetch(`/api/applications/${appId}/select-final`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheduledAt: finalScheduleDate ? new Date(finalScheduleDate).toISOString() : null,
          meetingLink: finalMeetingLink,
          notes: finalNotes || "Congratulations! You have been selected for the final interview round.",
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Candidate selected for final interview and notified!");
        setFinalModalOpen(false);

        // Update local interview state
        setInterviews((prev) =>
          prev.map((item) =>
            item._id === selectedInterviewForFinal._id
              ? {
                  ...item,
                  applicationId: {
                    ...item.applicationId,
                    status: "final_interview",
                    applicationData: {
                      ...(item.applicationId?.applicationData || {}),
                      selectedForFinalRound: true,
                      finalInterview: {
                        scheduledAt: finalScheduleDate ? new Date(finalScheduleDate).toISOString() : undefined,
                        meetingLink: finalMeetingLink,
                        notes: finalNotes,
                        selectedAt: new Date().toISOString(),
                      },
                    },
                  },
                }
              : item
          )
        );
      } else {
        toast.error(data.error || "Failed to select candidate for final round");
      }
    } catch {
      toast.error("Network error while selecting candidate");
    } finally {
      setSubmittingFinal(false);
    }
  };

  const totalApps = jobs.reduce((acc, j) => acc + (j.applicationCount || 0), 0);
  const activeJobs = jobs.filter((j) => j.status === "active").length;
  const completedInterviews = interviews.filter((i) => i.status === "completed").length;
  const strongHires = interviews.filter((i) => i.aiRecommendation === "strong_hire" || i.aiRecommendation === "hire").length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#010736] text-[#010736] dark:text-white transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#010736] dark:text-white">
              Recruiter <span className="text-[#22396F] dark:text-[#FCF1D0]">Dashboard</span>
            </h1>
            <p className="text-[#475569] dark:text-[#cbd5e1] mt-1">Manage your job postings and candidates</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/recruiter/company">
              <Button variant="outline" className="gap-2 border-[#cbd5e1] dark:border-[#22396F] bg-white dark:bg-[#0D1C42] text-[#010736] dark:text-white hover:bg-[#f1f5f9] dark:hover:bg-[#22396F] hover:text-[#22396F] dark:hover:text-[#FCF1D0]">
                <Building2 className="h-4 w-4" /> Company Profile
              </Button>
            </Link>
            <Link href="/recruiter/jobs/new">
              <Button className="bg-[#010736] text-[#FCF1D0] hover:bg-[#22396F] dark:bg-[#FCF1D0] dark:text-[#010736] dark:hover:bg-white font-semibold shadow-md">
                <Sparkles className="h-4 w-4 mr-2" /> Post New Job
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Active Jobs", value: activeJobs, icon: Briefcase, color: "text-[#FCF1D0]" },
            { label: "Total Applications", value: totalApps, icon: Users, color: "text-blue-400" },
            { label: "Interviews", value: completedInterviews, icon: Video, color: "text-purple-400" },
            { label: "Recommended", value: strongHires, icon: CheckCircle2, color: "text-emerald-400" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="border-[#cbd5e1] dark:border-[#22396F] bg-white dark:bg-[#0D1C42] text-[#010736] dark:text-white shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f1f5f9] dark:bg-[#010736] border border-[#cbd5e1] dark:border-[#22396F]">
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-[#010736] dark:text-white">{stat.value}</p>
                      <p className="text-xs text-[#475569] dark:text-[#cbd5e1]">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Tabs defaultValue="jobs" className="space-y-6">
          <TabsList className="bg-[#f1f5f9] dark:bg-[#0D1C42] border border-[#cbd5e1] dark:border-[#22396F] text-[#010736] dark:text-white">
            <TabsTrigger value="jobs">Job Postings</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="interviews">
              Interview Results
              {completedInterviews > 0 && (
                <Badge className="ml-1.5 bg-[#010736] dark:bg-[#22396F] text-[#FCF1D0] text-[10px] px-1.5">{completedInterviews}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Jobs Tab */}
          <TabsContent value="jobs" className="space-y-4">
            {jobs.length === 0 ? (
              <Card className="border-[#cbd5e1] dark:border-[#22396F] bg-white dark:bg-[#0D1C42] text-[#010736] dark:text-white">
                <CardContent className="py-12 text-center">
                  <Briefcase className="h-12 w-12 mx-auto text-[#94a3b8] mb-3" />
                  <h3 className="text-lg font-semibold mb-1 text-[#010736] dark:text-white">No job postings yet</h3>
                  <p className="text-sm text-[#475569] dark:text-[#cbd5e1] mb-4">Create your first job posting to start receiving applications</p>
                  <Link href="/recruiter/jobs/new">
                    <Button className="bg-[#010736] text-[#FCF1D0] hover:bg-[#22396F] dark:bg-[#FCF1D0] dark:text-[#010736] dark:hover:bg-white font-semibold">
                      <Sparkles className="h-4 w-4 mr-2" /> Launch AI Job Studio
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-border/40">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job Title</TableHead>
                      <TableHead className="hidden sm:table-cell">Type</TableHead>
                      <TableHead className="hidden md:table-cell">Location</TableHead>
                      <TableHead>Applicants</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobs.map((job) => (
                      <TableRow key={job._id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{job.title}</p>
                            <p className="text-xs text-muted-foreground sm:hidden capitalize">{job.type}</p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant="outline" className="text-xs capitalize">{job.type}</Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{job.location}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{job.applicationCount || 0}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`text-[10px] ${
                            job.status === "active" ? "bg-[#FCF1D0] text-[#010736] border-0 font-semibold" :
                            job.status === "closed" ? "bg-[#010736] text-[#cbd5e1] border border-[#22396F]" :
                            "bg-[#22396F] text-[#FCF1D0] border-0"
                          }`}>
                            {job.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link href={`/jobs/${job._id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-3 w-3" />
                              </Button>
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            )}
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications" className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search applications..."
                  className="pl-10"
                  value={searchApps}
                  onChange={(e) => setSearchApps(e.target.value)}
                />
              </div>
            </div>

            {applications.length === 0 ? (
              <Card className="border-border/40">
                <CardContent className="py-12 text-center">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                  <h3 className="text-lg font-semibold mb-1">No applications yet</h3>
                  <p className="text-sm text-muted-foreground">Applications will appear here as candidates apply</p>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-border/40">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Candidate</TableHead>
                      <TableHead className="hidden sm:table-cell">Job</TableHead>
                      <TableHead>Match</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((app) => (
                      <TableRow key={app._id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{app.candidate?.userId?.fullName || "Unknown"}</p>
                            <p className="text-xs text-muted-foreground">{app.candidate?.userId?.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-sm">{app.job?.title}</TableCell>
                        <TableCell>
                          {app.matchScore ? (
                            <div className="flex items-center gap-1">
                              <TrendingUp className="h-3 w-3 text-primary" />
                              <span className="text-sm font-medium">{app.matchScore}%</span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={app.status}
                            onValueChange={(v) => handleStatusChange(app._id, v)}
                          >
                            <SelectTrigger className="h-7 w-[120px] text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="reviewing">Reviewing</SelectItem>
                              <SelectItem value="shortlisted">Shortlisted</SelectItem>
                              <SelectItem value="interview">Interview</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                              <SelectItem value="hired">Hired</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/applications/${app._id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-3 w-3" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            )}
          </TabsContent>

          {/* Interview Results Tab */}
          <TabsContent value="interviews" className="space-y-4">
            {interviews.length === 0 ? (
              <Card className="border-border/40">
                <CardContent className="py-12 text-center">
                  <Video className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                  <h3 className="text-lg font-semibold mb-1">No interview results yet</h3>
                  <p className="text-sm text-muted-foreground">When candidates complete AI interviews, their scores and recommendations will appear here</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {/* Summary Cards for top candidates */}
                {interviews.filter(i => i.status === "completed" && i.overallScore != null).length > 0 && (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {interviews
                      .filter(i => i.status === "completed" && i.overallScore != null)
                      .sort((a, b) => (b.overallScore || 0) - (a.overallScore || 0))
                      .slice(0, 6)
                      .map((interview, idx) => {
                        const candidate = interview.applicationId?.candidateId;
                        const candidateName = candidate?.userId?.fullName || "Candidate";
                        const jobTitle = interview.applicationId?.jobId?.title || "Position";
                        const score = interview.overallScore || 0;
                        const rec = interview.aiRecommendation;
                        const recConfig: Record<string, { label: string; color: string; bg: string; icon: React.ComponentType<{ className?: string }> }> = {
                          strong_hire: { label: "Strong Hire", color: "text-[#010736]", bg: "bg-[#FCF1D0] font-bold", icon: Award },
                          hire: { label: "Hire", color: "text-[#FCF1D0]", bg: "bg-[#22396F]", icon: CheckCircle2 },
                          maybe: { label: "Maybe", color: "text-white", bg: "bg-[#0D1C42] border border-[#22396F]", icon: HelpCircle },
                          no_hire: { label: "No Hire", color: "text-white", bg: "bg-[#010736] border border-[#22396F]", icon: XCircle },
                        };
                        const recInfo = recConfig[rec || ""] || { label: "Pending", color: "text-muted-foreground", bg: "bg-muted/50", icon: HelpCircle };

                        return (
                          <motion.div
                            key={interview._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                          >
                            <Card className={`border-border/40 hover:shadow-md transition-all ${rec === "strong_hire" ? "ring-1 ring-green-500/20" : ""}`}>
                              <CardContent className="p-5">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="min-w-0 flex-1">
                                    <p className="font-semibold text-sm truncate">{candidateName}</p>
                                    <p className="text-xs text-muted-foreground truncate">{jobTitle}</p>
                                  </div>
                                  <Badge className={`text-[10px] shrink-0 ml-2 border flex items-center gap-1 ${recInfo.bg} ${recInfo.color}`}>
                                    <recInfo.icon className="h-3 w-3" />
                                    {recInfo.label}
                                  </Badge>
                                </div>

                                {/* Score Circle */}
                                <div className="flex items-center gap-4 mb-3">
                                  <div className="relative h-16 w-16 shrink-0">
                                    <svg className="h-16 w-16" viewBox="0 0 60 60">
                                      <circle cx="30" cy="30" r="24" fill="none" stroke="currentColor" strokeWidth="4" className="text-muted/30" />
                                      <circle
                                        cx="30" cy="30" r="24" fill="none"
                                        stroke={score >= 70 ? "#22c55e" : score >= 40 ? "#eab308" : "#ef4444"}
                                        strokeWidth="4" strokeLinecap="round"
                                        strokeDasharray={151}
                                        strokeDashoffset={151 - (151 * score) / 100}
                                        transform="rotate(-90 30 30)"
                                      />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <span className="text-lg font-bold">{score}%</span>
                                    </div>
                                  </div>
                                  <div className="flex-1 space-y-1.5 text-xs">
                                    {interview.detailedScores && Object.entries(interview.detailedScores).map(([key, val]) => (
                                      val != null && (
                                        <div key={key} className="flex items-center justify-between">
                                          <span className="text-muted-foreground capitalize">{key}</span>
                                          <span className="font-medium">{val}%</span>
                                        </div>
                                      )
                                    ))}
                                  </div>
                                </div>

                                {/* Strengths */}
                                {interview.strengths && interview.strengths.length > 0 && (
                                  <div className="mb-2">
                                    <p className="text-[10px] font-semibold text-green-600 mb-1">Strengths:</p>
                                    <div className="flex flex-wrap gap-1">
                                      {interview.strengths.slice(0, 3).map((s, i) => (
                                        <Badge key={i} variant="outline" className="text-[9px] bg-green-500/5 text-green-600 border-green-500/20">
                                          {s}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Weaknesses */}
                                {interview.weaknesses && interview.weaknesses.length > 0 && (
                                  <div>
                                    <p className="text-[10px] font-semibold text-red-500 mb-1">Areas to improve:</p>
                                    <div className="flex flex-wrap gap-1">
                                      {interview.weaknesses.slice(0, 3).map((w, i) => (
                                        <Badge key={i} variant="outline" className="text-[9px] bg-red-500/5 text-red-500 border-red-500/20">
                                          {w}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Proctoring Security Violations */}
                                {interview.penaltyPoints != null && interview.penaltyPoints > 0 ? (
                                  <div className="mt-2.5 p-2 rounded-xl bg-red-500/10 border border-red-500/25 flex items-center justify-between text-[11px] text-red-600 dark:text-red-400">
                                    <span className="flex items-center gap-1.5 font-bold">
                                      <ShieldAlert className="h-3.5 w-3.5" /> Security Violations
                                    </span>
                                    <span className="font-extrabold">-{interview.penaltyPoints} penalty marks</span>
                                  </div>
                                ) : null}

                                <div className="flex items-center justify-between mt-3 pt-3 border-t text-[10px] text-muted-foreground">
                                  <span>
                                    {interview.answers?.length || 0}/{interview.questions?.length || 0} answered
                                  </span>
                                  <span>
                                    {interview.completedAt
                                      ? new Date(interview.completedAt).toLocaleDateString()
                                      : interview.scheduledAt
                                      ? new Date(interview.scheduledAt).toLocaleDateString()
                                      : ""}
                                  </span>
                                </div>

                                {/* Final Round Selection State & Action */}
                                {(() => {
                                  const app = interview.applicationId;
                                  const isFinalSelected =
                                    app?.status === "final_interview" ||
                                    Boolean(app?.applicationData?.selectedForFinalRound);
                                  const finalData = app?.applicationData?.finalInterview;

                                  return (
                                    <div className="mt-3 pt-2 flex flex-col gap-2">
                                      {isFinalSelected ? (
                                        <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200">
                                          <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300">
                                              <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                                              Selected for Final Round
                                            </span>
                                            <Badge className="bg-emerald-600 text-white text-[9px] px-1.5 py-0 font-bold border-0">
                                              Invited
                                            </Badge>
                                          </div>
                                          {finalData?.meetingLink && (
                                            <a
                                              href={finalData.meetingLink}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-[11px] text-emerald-600 dark:text-emerald-400 underline flex items-center gap-1 mt-1.5 truncate font-medium"
                                            >
                                              <ExternalLink className="h-3 w-3 shrink-0" />
                                              {finalData.meetingLink}
                                            </a>
                                          )}
                                          {finalData?.scheduledAt && (
                                            <p className="text-[10px] text-muted-foreground mt-1">
                                              📅 {new Date(finalData.scheduledAt).toLocaleString()}
                                            </p>
                                          )}
                                        </div>
                                      ) : interview.status === "completed" ? (
                                        <Button
                                          size="sm"
                                          onClick={() => openFinalModal(interview)}
                                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 h-9 gap-1.5 shadow-sm rounded-xl transition-all"
                                        >
                                          <Sparkles className="h-3.5 w-3.5" /> Select for Final Interview
                                        </Button>
                                      ) : null}
                                    </div>
                                  );
                                })()}
                              </CardContent>
                            </Card>
                          </motion.div>
                        );
                      })}
                  </div>
                )}

                {/* Table for all interviews */}
                <Card className="border-border/40">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Video className="h-4 w-4 text-primary" /> All Interviews
                    </CardTitle>
                  </CardHeader>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Candidate</TableHead>
                        <TableHead className="hidden sm:table-cell">Position</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Recommendation</TableHead>
                        <TableHead className="hidden md:table-cell">Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {interviews.map((interview) => {
                        const candidate = interview.applicationId?.candidateId;
                        const candidateName = candidate?.userId?.fullName || "Candidate";
                        const candidateEmail = candidate?.userId?.email || "";
                        const jobTitle = interview.applicationId?.jobId?.title || "-";
                        const score = interview.overallScore;
                        const rec = interview.aiRecommendation;
                        const recLabels: Record<string, string> = {
                          strong_hire: "Strong Hire",
                          hire: "Hire",
                          maybe: "Maybe",
                          no_hire: "No Hire",
                        };
                        const recColors: Record<string, string> = {
                          strong_hire: "bg-[#FCF1D0] text-[#010736] font-bold",
                          hire: "bg-[#22396F] text-[#FCF1D0]",
                          maybe: "bg-[#0D1C42] border border-[#22396F] text-white",
                          no_hire: "bg-[#010736] border border-[#22396F] text-white",
                        };

                        const app = interview.applicationId;
                        const isFinal =
                          app?.status === "final_interview" ||
                          Boolean(app?.applicationData?.selectedForFinalRound);

                        return (
                          <TableRow key={interview._id}>
                            <TableCell>
                              <div>
                                <p className="font-medium text-sm">{candidateName}</p>
                                <p className="text-xs text-muted-foreground">{candidateEmail}</p>
                              </div>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell text-sm">{jobTitle}</TableCell>
                            <TableCell>
                              {score != null ? (
                                <div className="flex items-center gap-1.5">
                                  <div className="h-2 w-2 rounded-full bg-[#FCF1D0]" />
                                  <span className="text-sm font-semibold">{score}%</span>
                                  {interview.penaltyPoints != null && interview.penaltyPoints > 0 && (
                                    <span className="text-[10px] text-red-500 font-bold">
                                      (-{interview.penaltyPoints})
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {rec ? (
                                <Badge className={`text-[10px] border-0 inline-flex items-center gap-1 ${recColors[rec] || "bg-muted"}`}>
                                  {rec === "strong_hire" && <Award className="h-3 w-3" />}
                                  {rec === "hire" && <CheckCircle2 className="h-3 w-3" />}
                                  {rec === "maybe" && <HelpCircle className="h-3 w-3" />}
                                  {rec === "no_hire" && <XCircle className="h-3 w-3" />}
                                  {recLabels[rec] || rec}
                                </Badge>
                              ) : (
                                <span className="text-xs text-muted-foreground">Pending</span>
                              )}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <Badge className={`text-[10px] ${
                                interview.status === "completed" ? "bg-[#FCF1D0] text-[#010736] border-0 font-semibold" :
                                interview.status === "in_progress" ? "bg-[#22396F] text-[#FCF1D0] border-0" :
                                interview.status === "terminated" ? "bg-[#010736] border border-[#22396F] text-white" :
                                "bg-[#0D1C42] border border-[#22396F] text-white"
                              }`}>
                                {interview.status === "in_progress" ? "In Progress" : interview.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {isFinal ? (
                                <Badge className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 font-bold text-[10px]">
                                  🎉 Final Round
                                </Badge>
                              ) : interview.status === "completed" ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openFinalModal(interview)}
                                  className="text-xs h-7 border-emerald-500/50 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 font-bold"
                                >
                                  Select Final
                                </Button>
                              ) : (
                                <span className="text-xs text-muted-foreground">-</span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid sm:grid-cols-2 gap-4">
              <Card className="border-border/40">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <BarChart3 className="h-4 w-4 text-primary" /> Application Funnel
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: "Applied", count: totalApps, pct: 100, color: "bg-[#22396F]" },
                    { label: "Reviewed", count: Math.round(totalApps * 0.7), pct: 70, color: "bg-[#22396F]" },
                    { label: "Shortlisted", count: Math.round(totalApps * 0.3), pct: 30, color: "bg-[#FCF1D0]" },
                    { label: "Interviewed", count: Math.round(totalApps * 0.15), pct: 15, color: "bg-[#FCF1D0]" },
                    { label: "Hired", count: Math.round(totalApps * 0.05), pct: 5, color: "bg-white" },
                  ].map((stage) => (
                    <div key={stage.label} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span>{stage.label}</span>
                        <span className="font-medium">{stage.count}</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div className={`h-full rounded-full ${stage.color}`} style={{ width: `${stage.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-border/40">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Calendar className="h-4 w-4 text-primary" /> Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {jobs.slice(0, 5).map((job) => (
                      <div key={job._id} className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                          <Briefcase className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{job.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(job.createdAt).toLocaleDateString()} • {job.applicationCount || 0} applicants
                          </p>
                        </div>
                        <Link href={`/jobs/${job._id}`}>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </Link>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Final Round Selection Modal */}
        <Dialog open={finalModalOpen} onOpenChange={setFinalModalOpen}>
          <DialogContent className="sm:max-w-md bg-white dark:bg-[#0D1C42] border-[#cbd5e1] dark:border-[#22396F] text-[#010736] dark:text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg font-bold">
                <Sparkles className="h-5 w-5 text-emerald-500" />
                Select for Final Interview
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Candidate:{" "}
                <strong className="text-foreground">
                  {selectedInterviewForFinal?.applicationId?.candidateId?.userId?.fullName ||
                    selectedInterviewForFinal?.applicationId?.candidateId?.fullName ||
                    "Candidate"}
                </strong>{" "}
                • Position:{" "}
                <strong className="text-foreground">
                  {selectedInterviewForFinal?.applicationId?.jobId?.title || "Role"}
                </strong>
                . A real-time notification will be sent to the candidate&apos;s dashboard and profile.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="scheduleDate" className="text-xs font-semibold">
                  Scheduled Date & Time (Optional)
                </Label>
                <Input
                  id="scheduleDate"
                  type="datetime-local"
                  value={finalScheduleDate}
                  onChange={(e) => setFinalScheduleDate(e.target.value)}
                  className="text-xs bg-white dark:bg-[#010736] border-[#cbd5e1] dark:border-[#22396F]"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="meetingLink" className="text-xs font-semibold">
                  Meeting Link (Google Meet, Zoom, Teams)
                </Label>
                <Input
                  id="meetingLink"
                  placeholder="https://meet.google.com/abc-defg-hij"
                  value={finalMeetingLink}
                  onChange={(e) => setFinalMeetingLink(e.target.value)}
                  className="text-xs bg-white dark:bg-[#010736] border-[#cbd5e1] dark:border-[#22396F]"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="finalNotes" className="text-xs font-semibold">
                  Notes & Instructions for Candidate
                </Label>
                <Textarea
                  id="finalNotes"
                  rows={3}
                  placeholder="Congratulations! You have been selected for the final executive interview round..."
                  value={finalNotes}
                  onChange={(e) => setFinalNotes(e.target.value)}
                  className="text-xs bg-white dark:bg-[#010736] border-[#cbd5e1] dark:border-[#22396F]"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setFinalModalOpen(false)}
                className="text-xs border-[#cbd5e1] dark:border-[#22396F]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSelectFinalInterview}
                disabled={submittingFinal}
                className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5 shadow-md"
              >
                {submittingFinal ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Confirm & Send Invitation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
