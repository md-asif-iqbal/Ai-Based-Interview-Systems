"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Clock,
  DollarSign,
  Briefcase,
  GraduationCap,
  CheckCircle2,
  Loader2,
  Send,
  BookOpen,
  Users,
  Star,
  Video,
  FileText,
  AlertCircle,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface JobCompany {
  name: string;
  logo?: string;
  industry?: string;
  size?: string;
  location?: string;
  website?: string;
  description?: string;
}

interface JobDetail {
  _id: string;
  title: string;
  companyId?: JobCompany;
  location: string;
  employmentType: string;
  remote: boolean;
  salaryRange?: { min: number; max: number; currency: string };
  requirements?: {
    skills?: string[];
    experienceYears?: number;
    education?: string;
  };
  department?: string;
  description: string;
  benefits?: string[];
  status: string;
  createdAt: string;
  applicationCount?: number;
  viewCount?: number;
}

export default function JobDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [interviewId, setInterviewId] = useState<string | null>(null);
  const [matchScore, setMatchScore] = useState<number | null>(null);
  const [hasResume, setHasResume] = useState(false);
  const [resumeData, setResumeData] = useState<{
    name?: string;
    skills?: string[];
    experience?: { position?: string; company?: string }[];
    education?: { degree?: string; institution?: string }[];
  } | null>(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await fetch(`/api/jobs/${id}`);
        const data = await res.json();
        if (res.ok && data.success) {
          setJob(data.data);
        } else {
          toast.error("Failed to load job");
        }
      } catch {
        toast.error("Failed to load job");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchJob();

    // Check if already applied
    const checkApplication = async () => {
      try {
        const res = await fetch("/api/applications/my");
        const data = await res.json();
        if (res.ok && data.success && Array.isArray(data.data)) {
          const existing = data.data.find(
            (app: { jobId?: { _id?: string } }) => app.jobId?._id === id
          );
          if (existing) {
            setApplied(true);
            setMatchScore(existing.resumeMatchScore || 0);
            // Check for existing interview
            const intRes = await fetch("/api/interviews/my");
            const intData = await intRes.json();
            if (intRes.ok && intData.success && Array.isArray(intData.data)) {
              const interview = intData.data.find(
                (iv: { applicationId?: string | { _id?: string } }) => {
                  const appId = typeof iv.applicationId === "string" ? iv.applicationId : iv.applicationId?._id;
                  return appId === existing._id;
                }
              );
              if (interview) {
                setInterviewId(interview._id);
              }
            }
          }
        }
      } catch {
        // Non-blocking
      }
    };
    checkApplication();

    // Check resume data
    const checkResume = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (res.ok && data.success && data.candidate?.parsedResume) {
          setHasResume(true);
          setResumeData(data.candidate.parsedResume);
        }
      } catch {
        // Non-blocking
      }
    };
    checkResume();
  }, [id]);

  const handleApply = async () => {
    if (!hasResume) {
      toast.error("Please upload your resume first from your Dashboard → Resume tab");
      return;
    }
    setApplying(true);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: id }),
      });
      const data = await res.json();
      if (res.ok) {
        setApplied(true);
        setMatchScore(data.data?.resumeMatchScore || 0);
        if (data.interviewScheduled) {
          toast.success("Application submitted! AI Interview has been scheduled.");
          // Fetch interview ID
          try {
            const intRes = await fetch("/api/interviews/my");
            const intData = await intRes.json();
            if (intRes.ok && intData.success && Array.isArray(intData.data)) {
              const interview = intData.data.find(
                (iv: { applicationId?: string | { _id?: string } }) => {
                  const appId = typeof iv.applicationId === "string" ? iv.applicationId : iv.applicationId?._id;
                  return appId === data.data?._id;
                }
              );
              if (interview) setInterviewId(interview._id);
            }
          } catch { /* non-blocking */ }
        } else {
          toast.success("Application submitted successfully!");
        }
      } else if (res.status === 401) {
        toast.error("Please log in to apply");
        router.push("/login");
      } else if (res.status === 409) {
        setApplied(true);
        toast.info("You have already applied to this job");
      } else {
        toast.error(data.error || "Failed to apply");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setApplying(false);
    }
  };

  const formatSalary = (sal?: { min: number; max: number; currency: string }) => {
    if (!sal) return null;
    const sym = sal.currency === "BDT" ? "BDT " : sal.currency === "EUR" ? "€" : sal.currency === "GBP" ? "£" : "$";
    return `${sym}${sal.min.toLocaleString()} - ${sym}${sal.max.toLocaleString()} / year`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#010736] text-[#010736] dark:text-white">
        <Loader2 className="h-8 w-8 animate-spin text-[#010736] dark:text-[#FCF1D0]" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white dark:bg-[#010736] text-[#010736] dark:text-white">
        <Briefcase className="h-16 w-16 text-[#94a3b8]" />
        <h2 className="text-xl font-semibold">Job not found</h2>
        <Link href="/jobs">
          <Button variant="outline" className="border-[#cbd5e1] dark:border-[#22396F] text-[#010736] dark:text-white hover:bg-[#f1f5f9] dark:hover:bg-[#0D1C42]">Browse Jobs</Button>
        </Link>
      </div>
    );
  }

  const skills = job.requirements?.skills || [];

  return (
    <div className="min-h-screen bg-white dark:bg-[#010736] text-[#010736] dark:text-white transition-colors duration-200">
      {/* Header */}
      <section className="bg-[#f8fafc] dark:bg-[#0D1C42] border-b border-[#cbd5e1] dark:border-[#22396F]">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
          <Link href="/jobs" className="inline-flex items-center gap-1 text-sm text-[#475569] dark:text-[#cbd5e1] hover:text-[#010736] dark:hover:text-[#FCF1D0] mb-6">
            <ArrowLeft className="h-4 w-4" /> Back to Jobs
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white dark:bg-[#010736] border border-[#cbd5e1] dark:border-[#22396F]">
                <Building2 className="h-7 w-7 text-[#22396F] dark:text-[#FCF1D0]" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-[#010736] dark:text-white">{job.title}</h1>
                <div className="flex flex-wrap items-center gap-3 text-sm text-[#475569] dark:text-[#cbd5e1]">
                  <span className="flex items-center gap-1">
                    <Building2 className="h-4 w-4" /> {job.companyId?.name || "Company"}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" /> {job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" /> {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge className="bg-[#f1f5f9] dark:bg-[#22396F] text-[#010736] dark:text-[#FCF1D0] border border-[#cbd5e1] dark:border-[#22396F] capitalize">
                    {job.employmentType?.replace("_", " ") || "Full Time"}
                  </Badge>
                  {job.remote && <Badge variant="outline" className="border-[#cbd5e1] dark:border-[#22396F] text-[#010736] dark:text-white">Remote</Badge>}
                  {formatSalary(job.salaryRange) && (
                    <Badge variant="secondary" className="bg-[#f1f5f9] dark:bg-[#22396F] text-[#010736] dark:text-[#FCF1D0]">
                      <DollarSign className="h-3 w-3 mr-1" />{formatSalary(job.salaryRange)}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="sm:text-right shrink-0 space-y-2">
                {!applied ? (
                  <Button
                    size="lg"
                    disabled={applying}
                    onClick={handleApply}
                    className="bg-[#010736] text-[#FCF1D0] hover:bg-[#22396F] dark:bg-[#FCF1D0] dark:text-[#010736] dark:hover:bg-white font-semibold shadow-md w-full sm:w-auto"
                  >
                    {applying ? (
                      <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Applying...</>
                    ) : (
                      <><Send className="h-4 w-4 mr-2" /> Apply Now</>
                    )}
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium justify-end">
                      <CheckCircle2 className="h-4 w-4" /> Applied
                      {matchScore != null && (
                        <Badge variant="secondary" className="text-xs bg-[#22396F] text-[#FCF1D0]">
                          {matchScore}% Match
                        </Badge>
                      )}
                    </div>
                    {interviewId ? (
                      <Button
                        size="lg"
                        onClick={() => router.push(`/interview/${interviewId}`)}
                        className="bg-[#FCF1D0] hover:bg-[#f5e6b8] text-[#010736] font-bold shadow-md w-full sm:w-auto transition-colors"
                      >
                        <Video className="h-4 w-4 mr-2" /> Go to Interview
                      </Button>
                    ) : (
                      <p className="text-xs text-[#cbd5e1]">Interview not yet scheduled</p>
                    )}
                  </div>
                )}
                {!hasResume && !applied && (
                  <p className="text-xs text-[#FCF1D0] flex items-center gap-1 justify-end">
                    <AlertCircle className="h-3 w-3" /> Upload resume first
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-5xl px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            {/* Your Resume Summary */}
            {resumeData && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <FileText className="h-5 w-5 text-primary" /> Your Resume
                      {matchScore != null && (
                        <Badge className="ml-auto text-xs bg-[#FCF1D0] text-[#010736] font-bold border-0">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> {matchScore}% Match
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {resumeData.name && (
                      <p className="text-sm font-medium flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        {resumeData.name}
                      </p>
                    )}
                    {resumeData.skills && resumeData.skills.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1.5">Skills</p>
                        <div className="flex flex-wrap gap-1.5">
                          {resumeData.skills.slice(0, 15).map((s, i) => {
                            const isMatch = skills.some(
                              (rs) => rs.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(rs.toLowerCase())
                            );
                            return (
                              <Badge key={i} variant="outline" className={`text-[10px] ${isMatch ? "bg-[#22396F] text-[#FCF1D0] border-0" : ""}`}>
                                {isMatch && <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />}{s}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    {resumeData.experience && resumeData.experience.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Experience</p>
                        {resumeData.experience.slice(0, 3).map((exp, i) => (
                          <p key={i} className="text-xs text-foreground flex items-center gap-1.5">
                            <Briefcase className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span>{exp.position} at {exp.company}</span>
                          </p>
                        ))}
                      </div>
                    )}
                    {resumeData.education && resumeData.education.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Education</p>
                        {resumeData.education.slice(0, 2).map((edu, i) => (
                          <p key={i} className="text-xs text-foreground flex items-center gap-1.5">
                            <GraduationCap className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span>{edu.degree} — {edu.institution}</span>
                          </p>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="border-border/40">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BookOpen className="h-5 w-5 text-primary" /> Description
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-line leading-relaxed">{job.description}</p>
                </CardContent>
              </Card>
            </motion.div>

            {(job.requirements?.education || (job.requirements?.experienceYears && job.requirements.experienceYears > 0)) && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card className="border-border/40">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <GraduationCap className="h-5 w-5 text-primary" /> Requirements
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {job.requirements?.experienceYears !== undefined && job.requirements.experienceYears > 0 && (
                      <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500 mt-0.5" />
                        {job.requirements.experienceYears}+ years of experience required
                      </div>
                    )}
                    {job.requirements?.education && (
                      <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500 mt-0.5" />
                        Education: {job.requirements.education}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <Card className="border-border/40">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold">Job Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                      <Briefcase className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Type</p>
                      <p className="text-sm font-medium capitalize">{job.employmentType?.replace("_", " ") || "Full Time"}</p>
                    </div>
                  </div>
                  <Separator />
                  {job.requirements?.experienceYears !== undefined && (
                    <>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                          <Star className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Experience</p>
                          <p className="text-sm font-medium">{job.requirements.experienceYears}+ years</p>
                        </div>
                      </div>
                      <Separator />
                    </>
                  )}
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Location</p>
                      <p className="text-sm font-medium">{job.location}</p>
                    </div>
                  </div>
                  {formatSalary(job.salaryRange) && (
                    <>
                      <Separator />
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                          <DollarSign className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Salary</p>
                          <p className="text-sm font-medium">{formatSalary(job.salaryRange)}</p>
                        </div>
                      </div>
                    </>
                  )}
                  {job.applicationCount !== undefined && (
                    <>
                      <Separator />
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                          <Users className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Applicants</p>
                          <p className="text-sm font-medium">{job.applicationCount} applied</p>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {skills.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Card className="border-border/40">
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold">Required Skills</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((s) => (
                        <Badge key={s} variant="secondary" className="text-xs">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {job.benefits && job.benefits.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                <Card className="border-border/40">
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold">Benefits</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {job.benefits.map((b, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
