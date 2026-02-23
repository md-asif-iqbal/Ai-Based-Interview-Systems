"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Video,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Loader2,
  ArrowLeft,
  Search,
  Filter,
  Building2,
  CalendarDays,
  Trophy,
  TrendingUp,
  BarChart3,
  Play,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PopulatedJob {
  _id: string;
  title: string;
  location?: string;
  type?: string;
  companyId?: { name: string; logo?: string };
}

interface PopulatedApplication {
  _id: string;
  jobId: PopulatedJob;
}

interface InterviewItem {
  _id: string;
  applicationId?: PopulatedApplication;
  status: string;
  scheduledAt?: string;
  completedAt?: string;
  interviewType?: string;
  overallScore?: number;
  aiRecommendation?: string;
  detailedScores?: {
    technical?: number;
    communication?: number;
    problemSolving?: number;
    confidence?: number;
  };
  questions?: { questionText: string }[];
}

const statusConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
  scheduled: { label: "Scheduled", color: "text-blue-600", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  ready: { label: "Ready", color: "text-green-600", bg: "bg-green-500/10", border: "border-green-500/20" },
  in_progress: { label: "In Progress", color: "text-orange-600", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  completed: { label: "Completed", color: "text-purple-600", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  terminated: { label: "Terminated", color: "text-red-600", bg: "bg-red-500/10", border: "border-red-500/20" },
  cancelled: { label: "Cancelled", color: "text-gray-600", bg: "bg-gray-500/10", border: "border-gray-500/20" },
};

const recConfig: Record<string, { label: string; color: string; bg: string }> = {
  strong_hire: { label: "Strong Hire", color: "text-emerald-700", bg: "bg-emerald-500/10" },
  hire: { label: "Hire", color: "text-green-700", bg: "bg-green-500/10" },
  maybe: { label: "Maybe", color: "text-yellow-700", bg: "bg-yellow-500/10" },
  no_hire: { label: "No Hire", color: "text-red-700", bg: "bg-red-500/10" },
};

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 85 ? "text-emerald-600 bg-emerald-500/10 border-emerald-500/20"
    : score >= 70 ? "text-blue-600 bg-blue-500/10 border-blue-500/20"
    : score >= 50 ? "text-yellow-600 bg-yellow-500/10 border-yellow-500/20"
    : "text-red-600 bg-red-500/10 border-red-500/20";
  return (
    <div className={`flex flex-col items-center justify-center h-14 w-14 rounded-xl border font-black text-xl shrink-0 ${color}`}>
      {score}
      <span className="text-[9px] font-normal opacity-70">/ 100</span>
    </div>
  );
}

export default function MyInterviewsPage() {
  const router = useRouter();
  const [interviews, setInterviews] = useState<InterviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const fetchInterviews = useCallback(async () => {
    try {
      const res = await fetch("/api/interviews/my");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (!res.ok) {
        setInterviews([]);
        return;
      }
      const data = await res.json();
      setInterviews(data.data || []);
    } catch {
      setInterviews([]);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchInterviews();
  }, [fetchInterviews]);

  const filtered = interviews.filter((iv) => {
    const title = iv.applicationId?.jobId?.title?.toLowerCase() || "";
    const company = iv.applicationId?.jobId?.companyId?.name?.toLowerCase() || "";
    const matchSearch = !search || title.includes(search.toLowerCase()) || company.includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || iv.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const completed = interviews.filter((iv) => iv.status === "completed");
  const avgScore = completed.length
    ? Math.round(completed.reduce((s, iv) => s + (iv.overallScore ?? 0), 0) / completed.length)
    : 0;
  const best = completed.reduce((best, iv) => ((iv.overallScore ?? 0) > (best?.overallScore ?? 0) ? iv : best), completed[0]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-primary/5">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-4 gap-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold">
            My{" "}
            <span className="bg-linear-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Interviews
            </span>
          </h1>
          <p className="text-muted-foreground mt-1">View all your AI interviews and scores</p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6"
        >
          {[
            { label: "Total", value: interviews.length, icon: Video, color: "text-primary" },
            { label: "Completed", value: completed.length, icon: CheckCircle2, color: "text-green-500" },
            { label: "Avg Score", value: completed.length ? `${avgScore}%` : "—", icon: BarChart3, color: "text-blue-500" },
            {
              label: "Best Score",
              value: best ? `${best.overallScore ?? 0}%` : "—",
              icon: Trophy,
              color: "text-yellow-500",
            },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-muted/50 flex items-center justify-center shrink-0">
                  <s.icon className={`h-4 w-4 ${s.color}`} />
                </div>
                <div>
                  <p className="text-xl font-bold">{s.value}</p>
                  <p className="text-[11px] text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Search & Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex flex-col sm:flex-row gap-3 mb-6"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by job title or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="terminated">Terminated</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* List */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card>
                <CardContent className="py-16 text-center">
                  <Video className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                  <h3 className="text-lg font-semibold mb-1">
                    {interviews.length === 0 ? "No interviews yet" : "No matching interviews"}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {interviews.length === 0
                      ? "Apply to jobs to get interview invitations"
                      : "Try adjusting your search or filter"}
                  </p>
                  {interviews.length === 0 && (
                    <Link href="/jobs">
                      <Button className="bg-linear-to-r from-primary to-blue-600 hover:opacity-90">
                        Browse Jobs
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            filtered.map((iv, i) => {
              const job = iv.applicationId?.jobId;
              const cfg = statusConfig[iv.status] || statusConfig.scheduled;
              const rec = iv.aiRecommendation ? recConfig[iv.aiRecommendation] : null;
              const isActionable = iv.status === "scheduled" || iv.status === "ready" || iv.status === "in_progress";
              const isCompleted = iv.status === "completed";

              return (
                <motion.div
                  key={iv._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i }}
                >
                  <Card className="hover:border-primary/20 hover:shadow-md transition-all">
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex gap-4">
                        {/* Score or icon */}
                        {isCompleted && iv.overallScore != null ? (
                          <ScoreBadge score={iv.overallScore} />
                        ) : (
                          <div className={`shrink-0 h-14 w-14 rounded-xl flex items-center justify-center ${cfg.bg} border ${cfg.border}`}>
                            <Video className={`h-6 w-6 ${cfg.color}`} />
                          </div>
                        )}

                        {/* Main content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h3 className="text-sm sm:text-base font-semibold truncate">
                                {job?.title || "Interview"}
                              </h3>
                              <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                                {job?.companyId?.name && (
                                  <span className="flex items-center gap-1">
                                    <Building2 className="h-3 w-3" />
                                    {job.companyId.name}
                                  </span>
                                )}
                                {iv.interviewType && (
                                  <span className="capitalize text-muted-foreground">{iv.interviewType.replace("_", " ")}</span>
                                )}
                                <span className="flex items-center gap-1">
                                  <CalendarDays className="h-3 w-3" />
                                  {new Date(iv.completedAt || iv.scheduledAt || "").toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </span>
                              </div>
                            </div>
                            <Badge className={`shrink-0 text-[10px] border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                              {cfg.label}
                            </Badge>
                          </div>

                          {/* Recommendation */}
                          {rec && (
                            <div className="mt-2">
                              <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full ${rec.bg} ${rec.color}`}>
                                {rec.label}
                              </span>
                            </div>
                          )}

                          {/* Score bar for completed */}
                          {isCompleted && iv.overallScore != null && (
                            <div className="mt-3 pt-3 border-t border-border/40">
                              <div className="flex items-center justify-between text-xs mb-1.5">
                                <span className="text-muted-foreground flex items-center gap-1">
                                  <TrendingUp className="h-3 w-3" /> Overall Score
                                </span>
                                <span className="font-semibold">{iv.overallScore}%</span>
                              </div>
                              <Progress
                                value={iv.overallScore}
                                className={`h-1.5 ${
                                  iv.overallScore >= 70 ? "[&>div]:bg-green-500"
                                  : iv.overallScore >= 50 ? "[&>div]:bg-yellow-500"
                                  : "[&>div]:bg-red-500"
                                }`}
                              />

                              {/* Detailed scores */}
                              {iv.detailedScores && Object.values(iv.detailedScores).some((v) => v != null && v > 0) && (
                                <div className="grid grid-cols-4 gap-2 mt-3">
                                  {(
                                    [
                                      { key: "technical", label: "Technical" },
                                      { key: "communication", label: "Comm." },
                                      { key: "problemSolving", label: "Problem" },
                                      { key: "confidence", label: "Confidence" },
                                    ] as const
                                  ).map(({ key, label }) => {
                                    const v = iv.detailedScores?.[key];
                                    if (v == null) return null;
                                    return (
                                      <div key={key} className="text-center">
                                        <p className="text-xs font-bold">{v}%</p>
                                        <p className="text-[9px] text-muted-foreground">{label}</p>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Questions count */}
                          {iv.questions && iv.questions.length > 0 && (
                            <p className="text-[11px] text-muted-foreground mt-2">
                              {iv.questions.length} question{iv.questions.length !== 1 ? "s" : ""}
                            </p>
                          )}
                        </div>

                        {/* Action button */}
                        <div className="shrink-0 flex flex-col items-end justify-between gap-2">
                          {isActionable ? (
                            <Link href={`/interview/${iv._id}`}>
                              <Button
                                size="sm"
                                className="bg-linear-to-r from-primary to-blue-600 hover:opacity-90 gap-1"
                              >
                                <Play className="h-3 w-3" />
                                {iv.status === "in_progress" ? "Resume" : "Start"}
                              </Button>
                            </Link>
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground mt-1" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          )}
        </div>

        {filtered.length > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center text-xs text-muted-foreground mt-6"
          >
            Showing {filtered.length} of {interviews.length} interviews
          </motion.p>
        )}
      </div>
    </div>
  );
}
