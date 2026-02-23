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
  Star,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ResumeUpload from "@/components/forms/ResumeUpload";
import ResumeAnalysisResults from "@/components/resume/ResumeAnalysisResults";

interface PopulatedJob {
  _id: string;
  title: string;
  companyId?: { name: string };
  location?: string;
}

interface Application {
  _id: string;
  jobId: PopulatedJob;
  status: string;
  resumeMatchScore?: number;
  createdAt: string;
}

interface Interview {
  _id: string;
  applicationId?: {
    jobId?: {
      title: string;
      company: string;
      location?: string;
      type?: string;
    };
  };
  job?: { title: string };
  status: string;
  scheduledAt?: string;
  overallScore?: number;
  questions?: Array<{ question: string; timeLimit: number }>;
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

  const stats = {
    total: applications.length,
    pending: applications.filter((a) => a.status === "applied" || a.status === "screening").length,
    shortlisted: applications.filter((a) => a.status === "interview_scheduled" || a.status === "under_review").length,
    interviews: interviews.filter((i) => i.status === "scheduled" || i.status === "ready" || i.status === "in_progress").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  };

  const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    applied: { label: "Applied", color: "bg-yellow-500/10 text-yellow-600", icon: <Clock className="h-3 w-3" /> },
    screening: { label: "Screening", color: "bg-blue-500/10 text-blue-600", icon: <FileText className="h-3 w-3" /> },
    interview_scheduled: { label: "Interview Scheduled", color: "bg-green-500/10 text-green-600", icon: <Star className="h-3 w-3" /> },
    interviewed: { label: "Interviewed", color: "bg-purple-500/10 text-purple-600", icon: <Video className="h-3 w-3" /> },
    under_review: { label: "Under Review", color: "bg-blue-500/10 text-blue-600", icon: <FileText className="h-3 w-3" /> },
    offer: { label: "Offer", color: "bg-emerald-500/10 text-emerald-600", icon: <CheckCircle2 className="h-3 w-3" /> },
    rejected: { label: "Rejected", color: "bg-red-500/10 text-red-600", icon: <XCircle className="h-3 w-3" /> },
    withdrawn: { label: "Withdrawn", color: "bg-gray-500/10 text-gray-600", icon: <XCircle className="h-3 w-3" /> },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-accent/2">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                Welcome back, <span className="bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">{user?.fullName?.split(" ")[0] || "Candidate"}</span>
              </h1>
              <p className="text-muted-foreground mt-1">Here&apos;s an overview of your job applications</p>
            </div>
            {/* Test AI Button */}
            <Link href="/dashboard/test-ai">
              <Button variant="outline" className="gap-2">
                🧪 Test AI Parser
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Applications", value: stats.total, icon: Briefcase, color: "from-primary/10 to-primary/5" },
            { label: "Under Review", value: stats.pending, icon: Clock, color: "from-yellow-500/10 to-yellow-500/5" },
            { label: "Shortlisted", value: stats.shortlisted, icon: Star, color: "from-green-500/10 to-green-500/5" },
            { label: "Interviews", value: stats.interviews, icon: Video, color: "from-purple-500/10 to-purple-500/5" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="border-border/40">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br ${stat.color}`}>
                      <stat.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Tabs defaultValue="applications" className="space-y-6">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="interviews">Interviews</TabsTrigger>
            <TabsTrigger value="resume">Resume</TabsTrigger>
          </TabsList>

          {/* Applications Tab */}
          <TabsContent value="applications" className="space-y-4">
            {applications.length === 0 ? (
              <Card className="border-border/40">
                <CardContent className="py-12 text-center">
                  <Briefcase className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                  <h3 className="text-lg font-semibold mb-1">No applications yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">Start applying to jobs to see them here</p>
                  <Link href="/jobs">
                    <Button className="bg-linear-to-r from-primary to-accent hover:opacity-90">
                      Browse Jobs
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              applications.map((app, i) => {
                const cfg = statusConfig[app.status] || statusConfig.pending;
                return (
                  <motion.div
                    key={app._id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Card className="border-border/40 hover:border-primary/20 transition-all">
                      <CardContent className="p-4 sm:p-5">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                                <Briefcase className="h-4 w-4 text-primary" />
                              </div>
                              <div className="min-w-0">
                                <h3 className="text-sm font-semibold truncate">{app.jobId?.title}</h3>
                                <p className="text-xs text-muted-foreground">{app.jobId?.companyId?.name} • {app.jobId?.location}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge className={`text-[10px] ${cfg.color} border-0`}>
                                    {cfg.icon}
                                    <span className="ml-1">{cfg.label}</span>
                                  </Badge>
                                  {app.resumeMatchScore !== undefined && app.resumeMatchScore > 0 && (
                                    <Badge variant="outline" className="text-[10px]">
                                      <TrendingUp className="h-3 w-3 mr-1" /> {app.resumeMatchScore}% match
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                            <span className="text-xs text-muted-foreground">
                              {new Date(app.createdAt).toLocaleDateString()}
                            </span>
                            <Link href={`/jobs/${app.jobId?._id}`}>
                              <Button variant="ghost" size="sm" className="text-xs">
                                View <ChevronRight className="h-3 w-3 ml-1" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                        {app.resumeMatchScore !== undefined && app.resumeMatchScore > 0 && (
                          <div className="mt-3 pt-3 border-t border-border/50">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-muted-foreground">Match Score</span>
                              <span className="font-medium">{app.resumeMatchScore}%</span>
                            </div>
                            <Progress value={app.resumeMatchScore} className="h-1.5" />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </TabsContent>

          {/* Interviews Tab */}
          <TabsContent value="interviews" className="space-y-4">
            {interviews.length === 0 ? (
              <Card className="border-border/40">
                <CardContent className="py-12 text-center">
                  <Video className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                  <h3 className="text-lg font-semibold mb-1">No interviews scheduled</h3>
                  <p className="text-sm text-muted-foreground">Interviews will appear here when scheduled</p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{interviews.length} interview{interviews.length !== 1 ? "s" : ""} found</p>
                  <Link href="/interviews">
                    <Button variant="outline" size="sm" className="gap-1 text-xs">
                      View All <ChevronRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
                {interviews.slice(0, 5).map((interview, i) => (
                <motion.div
                  key={interview._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Link href={`/interview/${interview._id}`}>
                    <Card className="border-border/40 hover:border-primary/20 hover:shadow-md transition-all cursor-pointer group">
                      <CardContent className="p-4 sm:p-5">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10">
                                <Video className="h-4 w-4 text-purple-500" />
                              </div>
                              <div>
                                <h3 className="text-sm font-semibold group-hover:text-primary transition-colors">
                                  {interview.applicationId?.jobId?.title || interview.job?.title || "Interview"}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge
                                    variant="outline"
                                    className={`text-[10px] capitalize ${
                                      interview.status === "scheduled"
                                        ? "text-blue-500 border-blue-500/30"
                                        : interview.status === "completed"
                                        ? "text-green-500 border-green-500/30"
                                        : interview.status === "in_progress"
                                        ? "text-orange-500 border-orange-500/30"
                                        : ""
                                    }`}
                                  >
                                    {interview.status.replace("_", " ")}
                                  </Badge>
                                  {interview.applicationId?.jobId?.company && (
                                    <span className="text-xs text-muted-foreground">
                                      {interview.applicationId.jobId.company}
                                    </span>
                                  )}
                                  {interview.scheduledAt && (
                                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                      <Calendar className="h-3 w-3" />
                                      {new Date(interview.scheduledAt).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {interview.status === "completed" && interview.overallScore !== undefined ? (
                              <div className="text-right">
                                <p className="text-lg font-bold text-primary">{interview.overallScore}%</p>
                                <p className="text-xs text-muted-foreground">Score</p>
                              </div>
                            ) : (interview.status === "scheduled" || interview.status === "ready") ? (
                              <Button size="sm" className="bg-linear-to-r from-primary to-accent hover:opacity-90" onClick={(e) => e.stopPropagation()}>
                                <Video className="h-3 w-3 mr-1" /> Join
                              </Button>
                            ) : interview.status === "in_progress" ? (
                              <Button size="sm" variant="outline" className="border-orange-500/30 text-orange-500" onClick={(e) => e.stopPropagation()}>
                                <Video className="h-3 w-3 mr-1" /> Resume
                              </Button>
                            ) : null}
                            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
                ))}
              </>
            )}
          </TabsContent>

          {/* Resume Tab */}
          <TabsContent value="resume" className="space-y-6">
            {!candidate?.parsedResume ? (
              <Card className="border-border/40">
                <CardContent className="py-8">
                  <div className="text-center mb-6">
                    <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-2xl bg-primary/10 mb-3">
                      <Upload className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold">Upload Your Resume</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Our AI will analyze your resume and match you with perfect opportunities
                    </p>
                  </div>
                  <div className="max-w-lg mx-auto">
                    <ResumeUpload onUploadComplete={() => fetchData()} />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Resume Analysis</h2>
                  <Button variant="outline" size="sm" onClick={() => setShowResumeUpload(!showResumeUpload)}>
                    <Upload className="h-3 w-3 mr-1" /> Re-upload
                  </Button>
                </div>
                {showResumeUpload && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                    <Card className="border-border/40">
                      <CardContent className="p-6">
                        <ResumeUpload onUploadComplete={() => { fetchData(); setShowResumeUpload(false); }} />
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
                <ResumeAnalysisResults data={candidate.parsedResume as Record<string, unknown>} />
              </>
            )}

            {/* AI Recommendations */}
            <Card className="border-border/40 bg-linear-to-br from-primary/5 to-accent/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <AlertCircle className="h-4 w-4 text-primary" /> AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {[
                    "Add more specific project details to strengthen your experience section",
                    "Include quantifiable achievements (e.g., 'Increased performance by 40%')",
                    "Consider adding relevant certifications for your target roles",
                    "Keep your skills section updated with trending technologies",
                  ].map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Star className="h-4 w-4 shrink-0 text-yellow-500 mt-0.5" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
