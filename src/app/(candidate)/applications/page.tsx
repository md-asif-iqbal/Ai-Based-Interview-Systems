"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Briefcase,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  TrendingUp,
  ChevronRight,
  Loader2,
  ArrowLeft,
  Search,
  Filter,
  Video,
  Star,
  Building2,
  MapPin,
  CalendarDays,
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
  companyId?: { name: string; logo?: string };
  location?: string;
  type?: string;
  salary?: { min?: number; max?: number; currency?: string };
}

interface Application {
  _id: string;
  jobId: PopulatedJob;
  status: string;
  resumeMatchScore?: number;
  coverLetter?: string;
  createdAt: string;
}

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  applied: { label: "Applied", color: "text-[#FCF1D0]", bg: "bg-[#22396F]", icon: <Clock className="h-3.5 w-3.5" /> },
  screening: { label: "Screening", color: "text-white", bg: "bg-[#0D1C42] border border-[#22396F]", icon: <FileText className="h-3.5 w-3.5" /> },
  interview_scheduled: { label: "Interview Scheduled", color: "text-[#010736]", bg: "bg-[#FCF1D0] font-semibold", icon: <Video className="h-3.5 w-3.5" /> },
  interviewed: { label: "Interviewed", color: "text-[#FCF1D0]", bg: "bg-[#22396F]", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  under_review: { label: "Under Review", color: "text-white", bg: "bg-[#0D1C42] border border-[#22396F]", icon: <FileText className="h-3.5 w-3.5" /> },
  offer: { label: "Offer Received", color: "text-[#010736]", bg: "bg-[#FCF1D0] font-bold", icon: <Star className="h-3.5 w-3.5" /> },
  rejected: { label: "Rejected", color: "text-white", bg: "bg-[#010736] border border-[#22396F]", icon: <XCircle className="h-3.5 w-3.5" /> },
  withdrawn: { label: "Withdrawn", color: "text-[#cbd5e1]", bg: "bg-[#010736]", icon: <XCircle className="h-3.5 w-3.5" /> },
};

export default function MyApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const fetchApplications = useCallback(async () => {
    try {
      const res = await fetch("/api/applications/my");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (!res.ok) {
        // Non-auth error — show empty state, don't redirect
        setApplications([]);
        return;
      }
      const data = await res.json();
      setApplications(data.data || data.applications || []);
    } catch {
      // Network error — show empty state
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const filtered = applications.filter((app) => {
    const matchSearch =
      !search ||
      app.jobId?.title?.toLowerCase().includes(search.toLowerCase()) ||
      app.jobId?.companyId?.name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || app.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: applications.length,
    active: applications.filter((a) => !["rejected", "withdrawn"].includes(a.status)).length,
    interviews: applications.filter((a) => a.status === "interview_scheduled" || a.status === "interviewed").length,
    offers: applications.filter((a) => a.status === "offer").length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#010736] text-[#010736] dark:text-white transition-colors duration-200">
      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-4 gap-2 text-[#64748b] hover:text-[#010736] dark:text-[#cbd5e1] dark:hover:text-[#FCF1D0] hover:bg-[#f1f5f9] dark:hover:bg-[#0D1C42]">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#010736] dark:text-white">
            My{" "}
            <span className="text-[#010736] dark:text-[#FCF1D0]">
              Applications
            </span>
          </h1>
          <p className="text-[#64748b] dark:text-[#cbd5e1] mt-1">Track all your job applications in one place</p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6"
        >
          {[
            { label: "Total", value: stats.total, icon: Briefcase, color: "text-[#010736] dark:text-[#FCF1D0]" },
            { label: "Active", value: stats.active, icon: TrendingUp, color: "text-emerald-500 dark:text-emerald-400" },
            { label: "Interviews", value: stats.interviews, icon: Video, color: "text-blue-500 dark:text-blue-400" },
            { label: "Offers", value: stats.offers, icon: Star, color: "text-amber-500 dark:text-yellow-400" },
          ].map((s) => (
            <Card key={s.label} className="border-[#cbd5e1] dark:border-[#22396F] bg-white dark:bg-[#0D1C42] text-[#010736] dark:text-white shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-[#f8fafc] dark:bg-[#010736] border border-[#cbd5e1] dark:border-[#22396F] flex items-center justify-center shrink-0">
                  <s.icon className={`h-4 w-4 ${s.color}`} />
                </div>
                <div>
                  <p className="text-xl font-bold text-[#010736] dark:text-white">{s.value}</p>
                  <p className="text-[11px] text-[#64748b] dark:text-[#cbd5e1]">{s.label}</p>
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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748b] dark:text-[#cbd5e1]" />
            <Input
              placeholder="Search by job title or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white dark:bg-[#010736] border-[#cbd5e1] dark:border-[#22396F] text-[#010736] dark:text-white placeholder:text-[#94a3b8] focus:border-[#22396F] dark:focus:border-[#FCF1D0]"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-[180px] bg-white dark:bg-[#010736] border-[#cbd5e1] dark:border-[#22396F] text-[#010736] dark:text-white">
              <Filter className="h-4 w-4 mr-2 text-[#010736] dark:text-[#FCF1D0]" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-[#0D1C42] border-[#cbd5e1] dark:border-[#22396F] text-[#010736] dark:text-white">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="applied">Applied</SelectItem>
              <SelectItem value="screening">Screening</SelectItem>
              <SelectItem value="interview_scheduled">Interview Scheduled</SelectItem>
              <SelectItem value="interviewed">Interviewed</SelectItem>
              <SelectItem value="under_review">Under Review</SelectItem>
              <SelectItem value="offer">Offer</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* Applications List */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="border-[#cbd5e1] dark:border-[#22396F] bg-white dark:bg-[#0D1C42] text-[#010736] dark:text-white">
                <CardContent className="py-16 text-center">
                  <Briefcase className="h-12 w-12 mx-auto text-[#94a3b8] dark:text-[#cbd5e1]/30 mb-3" />
                  <h3 className="text-lg font-semibold mb-1 text-[#010736] dark:text-white">
                    {applications.length === 0 ? "No applications yet" : "No matching applications"}
                  </h3>
                  <p className="text-sm text-[#64748b] dark:text-[#cbd5e1] mb-4">
                    {applications.length === 0
                      ? "Start applying to jobs to see them here"
                      : "Try adjusting your search or filter"}
                  </p>
                  {applications.length === 0 && (
                    <Link href="/jobs">
                      <Button className="bg-[#010736] text-[#FCF1D0] hover:bg-[#22396F] dark:bg-[#FCF1D0] dark:text-[#010736] dark:hover:bg-white font-semibold">
                        Browse Jobs
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            filtered.map((app, i) => {
              const cfg = statusConfig[app.status] || statusConfig.applied;
              return (
                <motion.div
                  key={app._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i }}
                >
                  <Card className="border-[#cbd5e1] dark:border-[#22396F] bg-white dark:bg-[#0D1C42] text-[#010736] dark:text-white hover:border-[#22396F] dark:hover:border-[#FCF1D0] transition-all group shadow-sm">
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex flex-col sm:flex-row gap-4">
                        {/* Icon */}
                        <div className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#f8fafc] dark:bg-[#010736] border border-[#cbd5e1] dark:border-[#22396F] text-[#010736] dark:text-[#FCF1D0]">
                          <Building2 className="h-5 w-5" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h3 className="text-sm sm:text-base font-semibold truncate group-hover:text-[#22396F] dark:group-hover:text-[#FCF1D0] transition-colors">
                                {app.jobId?.title || "Untitled Position"}
                              </h3>
                              <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-[#64748b] dark:text-[#cbd5e1]">
                                {app.jobId?.companyId?.name && (
                                  <span className="flex items-center gap-1">
                                    <Building2 className="h-3 w-3" />
                                    {app.jobId.companyId.name}
                                  </span>
                                )}
                                {app.jobId?.location && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {app.jobId.location}
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  <CalendarDays className="h-3 w-3" />
                                  {new Date(app.createdAt).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </span>
                              </div>
                            </div>
                            <Badge className={`shrink-0 ${cfg.bg} ${cfg.color} border-0 gap-1`}>
                              {cfg.icon}
                              <span className="hidden sm:inline">{cfg.label}</span>
                            </Badge>
                          </div>

                          {/* Match score bar */}
                          {app.resumeMatchScore != null && app.resumeMatchScore > 0 && (
                            <div className="mt-3 pt-3 border-t border-[#cbd5e1] dark:border-[#22396F]/40">
                              <div className="flex items-center justify-between text-xs mb-1.5">
                                <span className="text-[#64748b] dark:text-[#cbd5e1] flex items-center gap-1">
                                  <TrendingUp className="h-3 w-3" /> Resume Match
                                </span>
                                <span className="font-semibold text-[#010736] dark:text-[#FCF1D0]">{app.resumeMatchScore}%</span>
                              </div>
                              <Progress value={app.resumeMatchScore} className="h-1.5" />
                            </div>
                          )}
                        </div>

                        {/* Action */}
                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
                          <Link href={`/jobs/${app.jobId?._id}`}>
                            <Button variant="outline" size="sm" className="gap-1 text-xs border-[#cbd5e1] dark:border-[#22396F] bg-white dark:bg-[#010736] text-[#010736] dark:text-white hover:bg-[#f1f5f9] dark:hover:bg-[#22396F]">
                              View Job <ChevronRight className="h-3 w-3" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Pagination info */}
        {filtered.length > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center text-xs text-muted-foreground mt-6"
          >
            Showing {filtered.length} of {applications.length} applications
          </motion.p>
        )}
      </div>
    </div>
  );
}
