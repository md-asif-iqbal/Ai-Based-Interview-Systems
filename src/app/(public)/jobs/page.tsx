"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search,
  MapPin,
  Briefcase,
  Clock,
  DollarSign,
  Filter,
  Building2,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Job {
  _id: string;
  title: string;
  companyId?: { name: string; logo?: string };
  location: string;
  employmentType: string;
  experienceLevel: string;
  salaryRange?: { min: number; max: number; currency: string };
  requirements?: { skills?: string[]; experienceYears?: number; education?: string };
  status: string;
  createdAt: string;
  description: string;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 12;

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (search) params.set("search", search);
      if (typeFilter !== "all") params.set("type", typeFilter);
      if (levelFilter !== "all") params.set("experienceLevel", levelFilter);

      const res = await fetch(`/api/jobs?${params}`);
      const result = await res.json();
      if (res.ok && result.success) {
        setJobs(result.data || []);
        setTotal(result.pagination?.total || 0);
      }
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
    } finally {
      setLoading(false);
    }
  }, [page, search, typeFilter, levelFilter]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const totalPages = Math.ceil(total / limit);

  const formatSalary = (sal?: { min: number; max: number; currency: string }) => {
    if (!sal) return null;
    const fmt = (n: number) => {
      if (n >= 100000) return `${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 1)}L`;
      if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
      return String(n);
    };
    const sym = sal.currency === "BDT" ? "৳" : sal.currency === "EUR" ? "€" : "$";
    return `${sym}${fmt(sal.min)} - ${fmt(sal.max)}`;
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  return (
    <div className="min-h-screen">
      {/* Hero Search */}
      <section className="relative bg-linear-to-br from-primary/5 via-background to-accent/5 border-b">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">
              Find Your <span className="bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">Dream Job</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              AI-powered matching connects you with the best opportunities
            </p>
          </motion.div>

          {/* Search & Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-4xl mx-auto"
          >
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title, skill, or keyword..."
                  className="pl-10 h-11"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
              <Button
                onClick={() => fetchJobs()}
                className="h-11 bg-linear-to-r from-primary to-accent hover:opacity-90 shadow-lg shadow-primary/20"
              >
                <Search className="h-4 w-4 mr-2" /> Search
              </Button>
            </div>

            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Filter className="h-4 w-4" /> Filters:
              </div>
              <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
                <SelectTrigger className="w-37.5 h-9">
                  <SelectValue placeholder="Job Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                  <SelectItem value="remote">Remote</SelectItem>
                </SelectContent>
              </Select>
              <Select value={levelFilter} onValueChange={(v) => { setLevelFilter(v); setPage(1); }}>
                <SelectTrigger className="w-40 h-9">
                  <SelectValue placeholder="Experience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="entry">Entry Level</SelectItem>
                  <SelectItem value="mid">Mid Level</SelectItem>
                  <SelectItem value="senior">Senior</SelectItem>
                  <SelectItem value="lead">Lead</SelectItem>
                </SelectContent>
              </Select>
              <Badge variant="secondary" className="text-xs">
                {total} jobs found
              </Badge>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Job Grid */}
      <section className="mx-auto max-w-7xl px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20">
            <Briefcase className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold mb-1">No jobs found</h3>
            <p className="text-muted-foreground text-sm">Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job, i) => (
                <motion.div
                  key={job._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Link href={`/jobs/${job._id}`}>
                    <Card className="h-full border-border/40 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all group cursor-pointer">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                              {job.title}
                            </CardTitle>
                            <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
                              <Building2 className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate">{job.companyId?.name || "Company"}</span>
                            </div>
                          </div>
                          <Badge
                            variant="secondary"
                            className="shrink-0 text-[10px] capitalize"
                          >
                            {job.employmentType?.replace("_", " ") || "Full Time"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0 space-y-3">
                        <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>

                        <div className="flex flex-wrap gap-1.5">
                          {(job.requirements?.skills || []).slice(0, 4).map((s) => (
                            <Badge key={s} variant="outline" className="text-[10px] font-normal">
                              {s}
                            </Badge>
                          ))}
                          {(job.requirements?.skills || []).length > 4 && (
                            <Badge variant="outline" className="text-[10px] font-normal text-muted-foreground">
                              +{(job.requirements?.skills || []).length - 4}
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/50">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" /> {job.location}
                            </span>
                            {formatSalary(job.salaryRange) && (
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" /> {formatSalary(job.salaryRange)}
                              </span>
                            )}
                          </div>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {timeAgo(job.createdAt)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const p = page <= 3 ? i + 1 : page + i - 2;
                  if (p < 1 || p > totalPages) return null;
                  return (
                    <Button
                      key={p}
                      variant={p === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPage(p)}
                      className={p === page ? "bg-primary" : ""}
                    >
                      {p}
                    </Button>
                  );
                })}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
