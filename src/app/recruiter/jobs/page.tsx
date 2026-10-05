"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Briefcase,
  Plus,
  ChevronRight,
  Loader2,
  ArrowLeft,
  Search,
  MapPin,
  Calendar,
  Users,
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  Building2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface Job {
  _id: string;
  title: string;
  location?: string;
  employmentType?: string;
  status: string;
  applicationCount?: number;
  createdAt: string;
  salaryRange?: { min?: number; max?: number; currency?: string };
}

const statusMap: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  active: { label: "Active", color: "text-[#010736]", bg: "bg-[#FCF1D0] font-semibold", icon: <CheckCircle2 className="h-3 w-3" /> },
  closed: { label: "Closed", color: "text-white", bg: "bg-[#010736] border border-[#22396F]", icon: <XCircle className="h-3 w-3" /> },
  draft: { label: "Draft", color: "text-[#FCF1D0]", bg: "bg-[#22396F]", icon: <Clock className="h-3 w-3" /> },
  paused: { label: "Paused", color: "text-[#cbd5e1]", bg: "bg-[#0D1C42] border border-[#22396F]", icon: <Clock className="h-3 w-3" /> },
};

export default function RecruiterJobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchJobs = useCallback(async () => {
    try {
      const res = await fetch("/api/recruiter/jobs");
      if (!res.ok) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      setJobs(data.data || data.jobs || []);
    } catch {
      console.error("Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const filtered = jobs.filter(
    (j) => !search || j.title.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: jobs.length,
    active: jobs.filter((j) => j.status === "active").length,
    closed: jobs.filter((j) => j.status === "closed").length,
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
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-4 gap-2 text-[#475569] dark:text-[#cbd5e1] hover:text-[#010736] dark:hover:text-[#FCF1D0] hover:bg-[#f1f5f9] dark:hover:bg-[#0D1C42]">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#010736] dark:text-white">
                My{" "}
                <span className="text-[#22396F] dark:text-[#FCF1D0]">
                  Job Postings
                </span>
              </h1>
              <p className="text-[#475569] dark:text-[#cbd5e1] mt-1">Manage all your job postings</p>
            </div>
            <Link href="/recruiter/dashboard">
              <Button className="bg-[#010736] text-[#FCF1D0] hover:bg-[#22396F] dark:bg-[#FCF1D0] dark:text-[#010736] dark:hover:bg-white font-semibold gap-2 shadow-md">
                <Plus className="h-4 w-4" /> Post New Job
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3 mb-6"
        >
          {[
            { label: "Total Jobs", value: stats.total, icon: Briefcase, color: "text-[#22396F] dark:text-[#FCF1D0]" },
            { label: "Active", value: stats.active, icon: Eye, color: "text-emerald-500" },
            { label: "Closed", value: stats.closed, icon: XCircle, color: "text-red-500" },
          ].map((s) => (
            <Card key={s.label} className="border-[#cbd5e1] dark:border-[#22396F] bg-white dark:bg-[#0D1C42] text-[#010736] dark:text-white shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-[#f1f5f9] dark:bg-[#010736] border border-[#cbd5e1] dark:border-[#22396F] flex items-center justify-center shrink-0">
                  <s.icon className={`h-4 w-4 ${s.color}`} />
                </div>
                <div>
                  <p className="text-xl font-bold text-[#010736] dark:text-white">{s.value}</p>
                  <p className="text-[11px] text-[#475569] dark:text-[#cbd5e1]">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#475569] dark:text-[#cbd5e1]" />
            <Input
              placeholder="Search jobs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white dark:bg-[#010736] border-[#cbd5e1] dark:border-[#22396F] text-[#010736] dark:text-white placeholder:text-[#94a3b8] focus:border-[#22396F] dark:focus:border-[#FCF1D0]"
            />
          </div>
        </motion.div>

        {/* Jobs List */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <Card className="border-border/40">
              <CardContent className="py-16 text-center">
                <Building2 className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                <h3 className="text-lg font-semibold mb-1">
                  {jobs.length === 0 ? "No jobs posted yet" : "No matching jobs"}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {jobs.length === 0
                    ? "Create your first job posting to start hiring"
                    : "Try a different search term"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filtered.map((job, i) => {
              const cfg = statusMap[job.status] || statusMap.active;
              return (
                <motion.div
                  key={job._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i }}
                >
                  <Card className="border-border/40 hover:border-primary/20 hover:shadow-md transition-all group cursor-pointer">
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#010736] border border-[#22396F] text-[#FCF1D0]">
                          <Briefcase className="h-5 w-5 text-[#FCF1D0]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="text-sm sm:text-base font-semibold group-hover:text-primary transition-colors">
                                {job.title}
                              </h3>
                              <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                                {job.location && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {job.location}
                                  </span>
                                )}
                                {job.employmentType && (
                                  <Badge variant="outline" className="text-[10px] capitalize">
                                    {job.employmentType.replace("_", " ")}
                                  </Badge>
                                )}
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(job.createdAt).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </span>
                                {job.applicationCount != null && (
                                  <span className="flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    {job.applicationCount} applicants
                                  </span>
                                )}
                              </div>
                            </div>
                            <Badge className={`shrink-0 ${cfg.bg} ${cfg.color} border-0 gap-1`}>
                              {cfg.icon}
                              {cfg.label}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
