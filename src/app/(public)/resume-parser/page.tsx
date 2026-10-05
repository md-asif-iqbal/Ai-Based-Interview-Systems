"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Briefcase,
  GraduationCap,
  FolderGit2,
  Award,
  ArrowRight,
  RefreshCw,
  User,
  Mail,
  Phone,
  MapPin,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface ParsedData {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  summary?: string;
  skills?: string[];
  totalExperienceYears?: number;
  overallScore?: number;
  experience?: Array<{
    title: string;
    company: string;
    startDate?: string;
    endDate?: string;
    description?: string;
    highlights?: string[];
  }>;
  education?: Array<{
    degree: string;
    institution: string;
    year?: string;
    fieldOfStudy?: string;
  }>;
  projects?: Array<{
    name: string;
    description?: string;
    technologies?: string[];
  }>;
  certifications?: Array<{
    name: string;
    issuer?: string;
    year?: string;
  }>;
}

const sampleData: ParsedData = {
  name: "Alex Morgan",
  email: "alex.morgan@example.com",
  phone: "+1 (555) 234-5678",
  location: "San Francisco, CA",
  summary:
    "Senior Full Stack Software Engineer with 6+ years of experience building resilient microservices, high-traffic web applications, and AI-driven automation workflows with React, Next.js, TypeScript, Node.js, and cloud architectures.",
  skills: [
    "TypeScript",
    "React.js",
    "Next.js",
    "Node.js",
    "Python",
    "MongoDB",
    "PostgreSQL",
    "Docker",
    "AWS",
    "Tailwind CSS",
    "GraphQL",
    "System Design",
    "CI/CD",
  ],
  totalExperienceYears: 6,
  overallScore: 92,
  experience: [
    {
      title: "Senior Full Stack Engineer",
      company: "CloudScale Technologies",
      startDate: "2022",
      endDate: "Present",
      description:
        "Led core platform architecture serving 1.5M daily active users. Streamlined API latency by 42% through query optimization and distributed caching.",
      highlights: [
        "Architected real-time event streaming pipeline processing 10k events/sec",
        "Mentored junior engineers and instituted automated integration test pipelines",
      ],
    },
    {
      title: "Software Engineer",
      company: "Apex Digital Solutions",
      startDate: "2019",
      endDate: "2022",
      description:
        "Developed customer-facing dashboard features, payment gateways, and automated report generation systems using Next.js and Node.js.",
    },
  ],
  education: [
    {
      degree: "B.S. in Computer Science",
      institution: "University of California, Berkeley",
      year: "2019",
      fieldOfStudy: "Computer Science & Engineering",
    },
  ],
  projects: [
    {
      name: "AI Recruitment Intelligence",
      description:
        "End-to-end recruitment platform with automated technical screening and interview evaluation engine.",
      technologies: ["Next.js", "TypeScript", "Gemini AI", "MongoDB"],
    },
    {
      name: "Realtime Analytics Dashboard",
      description:
        "High-performance telemetry dashboard utilizing WebSockets and Redis caching.",
      technologies: ["React", "Node.js", "Redis", "Docker"],
    },
  ],
  certifications: [
    {
      name: "AWS Certified Solutions Architect",
      issuer: "Amazon Web Services",
      year: "2023",
    },
    {
      name: "Professional Cloud Developer",
      issuer: "Google Cloud",
      year: "2022",
    },
  ],
};

export default function ResumeParserPage() {
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [parsedResult, setParsedResult] = useState<ParsedData | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const f = acceptedFiles[0];
    if (!f) return;

    if (f.type !== "application/pdf") {
      toast.error("Please upload a PDF file (.pdf)");
      return;
    }

    if (f.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB limit");
      return;
    }

    setFile(f);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    multiple: false,
  });

  const handleParse = async () => {
    if (!file) return;

    setParsing(true);
    setProgress(15);

    try {
      const formData = new FormData();
      formData.append("file", file);

      setProgress(40);

      const res = await fetch("/api/parse-resume", {
        method: "POST",
        body: formData,
      });

      setProgress(75);

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to parse resume");
      }

      setProgress(100);
      setParsedResult(result.data);
      toast.success("Resume parsed successfully with Gemini AI!");
    } catch (err: unknown) {
      const e = err as Error;
      toast.error(e.message || "Failed to parse resume. You can test with the sample resume button.");
    } finally {
      setParsing(false);
    }
  };

  const loadSample = () => {
    setParsedResult(sampleData);
    setFile(null);
    toast.success("Sample resume loaded!");
  };

  const handleReset = () => {
    setFile(null);
    setParsedResult(null);
    setProgress(0);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#010736] text-[#010736] dark:text-white transition-colors duration-200">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <Badge
            variant="outline"
            className="mb-4 px-3.5 py-1 text-xs font-semibold bg-[#f8fafc] dark:bg-[#0D1C42] border-[#cbd5e1] dark:border-[#22396F] text-[#010736] dark:text-[#FCF1D0]"
          >
            Google Gemini Powered
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#010736] dark:text-white mb-4">
            AI Resume{" "}
            <span className="text-[#22396F] dark:text-[#FCF1D0]">
              Parser & Analyzer
            </span>
          </h1>
          <p className="text-base sm:text-lg text-[#475569] dark:text-[#cbd5e1] leading-relaxed">
            Extract candidate skills, work history, education credentials, and overall readiness score automatically with Gemini AI.
          </p>
        </div>

        {/* Upload & Controls Section */}
        {!parsedResult && (
          <div className="max-w-2xl mx-auto space-y-6">
            <Card className="border-[#cbd5e1] dark:border-[#22396F] bg-white dark:bg-[#0D1C42] shadow-sm">
              <CardContent className="p-6 sm:p-8">
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
                    isDragActive
                      ? "border-[#010736] bg-[#f8fafc] dark:border-[#FCF1D0] dark:bg-[#22396F]/30"
                      : "border-[#cbd5e1] hover:border-[#010736] dark:border-[#22396F] dark:hover:border-[#FCF1D0] bg-[#f8fafc]/50 dark:bg-[#010736]/40"
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className="h-16 w-16 mx-auto rounded-2xl bg-[#010736] dark:bg-[#22396F] text-[#FCF1D0] flex items-center justify-center mb-4 shadow-sm">
                    <Upload className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-bold text-[#010736] dark:text-white mb-1">
                    {file ? file.name : "Drop your resume PDF here"}
                  </h3>
                  <p className="text-sm text-[#64748b] dark:text-[#cbd5e1] mb-3">
                    {file
                      ? `${(file.size / 1024 / 1024).toFixed(2)} MB • Ready to analyze`
                      : "Supports PDF documents up to 5MB"}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-[#cbd5e1] dark:border-[#22396F] bg-white dark:bg-[#010736] text-[#010736] dark:text-white hover:bg-[#f1f5f9] dark:hover:bg-[#22396F]"
                  >
                    {file ? "Change File" : "Browse Computer"}
                  </Button>
                </div>

                {/* Progress Bar when uploading */}
                {parsing && (
                  <div className="mt-6 space-y-2">
                    <div className="flex justify-between text-xs text-[#64748b] dark:text-[#cbd5e1] font-medium">
                      <span>Analyzing resume with Gemini AI...</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2 [&>div]:bg-[#010736] dark:[&>div]:bg-[#FCF1D0]" />
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <Button
                    onClick={handleParse}
                    disabled={!file || parsing}
                    className="flex-1 h-12 bg-[#010736] text-[#FCF1D0] hover:bg-[#22396F] dark:bg-[#FCF1D0] dark:text-[#010736] dark:hover:bg-white font-semibold transition-all shadow-md"
                  >
                    {parsing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing with AI...
                      </>
                    ) : (
                      <>
                        <FileText className="mr-2 h-4 w-4" />
                        Parse Resume Now
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={loadSample}
                    disabled={parsing}
                    className="h-12 border-[#cbd5e1] dark:border-[#22396F] bg-white dark:bg-[#010736] text-[#010736] dark:text-white hover:bg-[#f1f5f9] dark:hover:bg-[#22396F] dark:hover:text-[#FCF1D0]"
                  >
                    Try Sample Resume
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div className="p-4 rounded-xl border border-[#cbd5e1] dark:border-[#22396F] bg-white dark:bg-[#0D1C42]">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mb-2" />
                <h4 className="text-sm font-bold text-[#010736] dark:text-white">Full Extraction</h4>
                <p className="text-xs text-[#64748b] dark:text-[#cbd5e1] mt-1">Extracts skills, employment timeline, contacts, and education.</p>
              </div>
              <div className="p-4 rounded-xl border border-[#cbd5e1] dark:border-[#22396F] bg-white dark:bg-[#0D1C42]">
                <TrendingUp className="h-5 w-5 text-[#22396F] dark:text-[#FCF1D0] mb-2" />
                <h4 className="text-sm font-bold text-[#010736] dark:text-white">Readiness Score</h4>
                <p className="text-xs text-[#64748b] dark:text-[#cbd5e1] mt-1">Evaluates depth of experience, skill relevance, and presentation.</p>
              </div>
              <div className="p-4 rounded-xl border border-[#cbd5e1] dark:border-[#22396F] bg-white dark:bg-[#0D1C42]">
                <Briefcase className="h-5 w-5 text-[#010736] dark:text-[#FCF1D0] mb-2" />
                <h4 className="text-sm font-bold text-[#010736] dark:text-white">Instant Matching</h4>
                <p className="text-xs text-[#64748b] dark:text-[#cbd5e1] mt-1">Directly matches parsed capabilities to open platform job listings.</p>
              </div>
            </div>
          </div>
        )}

        {/* Results Display */}
        {parsedResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl border border-[#cbd5e1] dark:border-[#22396F] bg-white dark:bg-[#0D1C42] shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-[#010736] dark:bg-[#22396F] text-[#FCF1D0] flex items-center justify-center font-bold">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#010736] dark:text-white">Parsing Analysis Complete</h3>
                  <p className="text-xs text-[#64748b] dark:text-[#cbd5e1]">Extracted via Google Gemini AI Engine</p>
                </div>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="gap-2 border-[#cbd5e1] dark:border-[#22396F] bg-white dark:bg-[#010736] text-[#010736] dark:text-white hover:bg-[#f1f5f9] dark:hover:bg-[#22396F]"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Parse Another
                </Button>
                <Button
                  asChild
                  size="sm"
                  className="gap-2 bg-[#010736] text-[#FCF1D0] hover:bg-[#22396F] dark:bg-[#FCF1D0] dark:text-[#010736] dark:hover:bg-white font-semibold"
                >
                  <Link href="/jobs">
                    Find Matching Jobs
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Profile Overview & Score Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Profile Card */}
              <Card className="md:col-span-2 border-[#cbd5e1] dark:border-[#22396F] bg-white dark:bg-[#0D1C42] shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold flex items-center gap-2 text-[#010736] dark:text-white">
                    <User className="h-5 w-5 text-[#22396F] dark:text-[#FCF1D0]" />
                    Candidate Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-extrabold text-[#010736] dark:text-white">
                      {parsedResult.name || "Candidate Name"}
                    </h2>
                    <div className="flex flex-wrap gap-y-1 gap-x-4 mt-2 text-xs text-[#64748b] dark:text-[#cbd5e1]">
                      {parsedResult.email && (
                        <span className="flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5" />
                          {parsedResult.email}
                        </span>
                      )}
                      {parsedResult.phone && (
                        <span className="flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5" />
                          {parsedResult.phone}
                        </span>
                      )}
                      {parsedResult.location && (
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5" />
                          {parsedResult.location}
                        </span>
                      )}
                    </div>
                  </div>

                  {parsedResult.summary && (
                    <div className="p-3.5 rounded-xl bg-[#f8fafc] dark:bg-[#010736] border border-[#cbd5e1] dark:border-[#22396F]">
                      <p className="text-xs sm:text-sm text-[#334155] dark:text-[#cbd5e1] leading-relaxed">
                        {parsedResult.summary}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Score Metric Card */}
              <Card className="border-[#cbd5e1] dark:border-[#22396F] bg-white dark:bg-[#0D1C42] shadow-sm flex flex-col justify-between">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-[#64748b] dark:text-[#cbd5e1]">
                    Overall Readiness
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-6 text-center space-y-3">
                  <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-[#f8fafc] dark:bg-[#010736] border-4 border-[#010736] dark:border-[#FCF1D0]">
                    <span className="text-3xl font-black text-[#010736] dark:text-[#FCF1D0]">
                      {parsedResult.overallScore || 85}%
                    </span>
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-[#010736] dark:text-white">
                      {(parsedResult.overallScore || 85) >= 80 ? "Interview Ready" : "Good Foundation"}
                    </h4>
                    <p className="text-xs text-[#64748b] dark:text-[#cbd5e1] mt-1">
                      {parsedResult.totalExperienceYears
                        ? `${parsedResult.totalExperienceYears}+ years relevant industry experience`
                        : "Comprehensive technical profile"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Extracted Skills Cloud */}
            {parsedResult.skills && parsedResult.skills.length > 0 && (
              <Card className="border-[#cbd5e1] dark:border-[#22396F] bg-white dark:bg-[#0D1C42] shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold flex items-center justify-between text-[#010736] dark:text-white">
                    <span className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-[#22396F] dark:text-[#FCF1D0]" />
                      Identified Skills & Competencies
                    </span>
                    <Badge variant="outline" className="text-xs border-[#cbd5e1] dark:border-[#22396F]">
                      {parsedResult.skills.length} skills found
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {parsedResult.skills.map((skill, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#f1f5f9] text-[#010736] border border-[#cbd5e1] dark:bg-[#22396F] dark:text-[#FCF1D0] dark:border-[#22396F]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Work Experience */}
            {parsedResult.experience && parsedResult.experience.length > 0 && (
              <Card className="border-[#cbd5e1] dark:border-[#22396F] bg-white dark:bg-[#0D1C42] shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold flex items-center gap-2 text-[#010736] dark:text-white">
                    <Briefcase className="h-4 w-4 text-[#22396F] dark:text-[#FCF1D0]" />
                    Work Experience
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {parsedResult.experience.map((exp, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-xl border border-[#cbd5e1] dark:border-[#22396F] bg-[#f8fafc]/50 dark:bg-[#010736]/40 space-y-2"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <h4 className="font-bold text-sm sm:text-base text-[#010736] dark:text-white">{exp.title}</h4>
                        <span className="text-xs font-medium text-[#64748b] dark:text-[#cbd5e1]">
                          {exp.startDate} – {exp.endDate || "Present"}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-[#22396F] dark:text-[#FCF1D0]">{exp.company}</p>
                      {exp.description && (
                        <p className="text-xs text-[#475569] dark:text-[#cbd5e1] leading-relaxed">{exp.description}</p>
                      )}
                      {exp.highlights && exp.highlights.length > 0 && (
                        <ul className="list-disc list-inside text-xs text-[#475569] dark:text-[#cbd5e1] space-y-1 mt-2">
                          {exp.highlights.map((h, hi) => (
                            <li key={hi}>{h}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Education & Projects Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Education */}
              {parsedResult.education && parsedResult.education.length > 0 && (
                <Card className="border-[#cbd5e1] dark:border-[#22396F] bg-white dark:bg-[#0D1C42] shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-bold flex items-center gap-2 text-[#010736] dark:text-white">
                      <GraduationCap className="h-4 w-4 text-[#22396F] dark:text-[#FCF1D0]" />
                      Education
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {parsedResult.education.map((edu, i) => (
                      <div key={i} className="p-3.5 rounded-xl border border-[#cbd5e1] dark:border-[#22396F] bg-[#f8fafc]/50 dark:bg-[#010736]/40">
                        <h4 className="font-bold text-sm text-[#010736] dark:text-white">{edu.degree}</h4>
                        <p className="text-xs text-[#22396F] dark:text-[#FCF1D0] mt-0.5">{edu.institution}</p>
                        {edu.year && <p className="text-xs text-[#64748b] dark:text-[#cbd5e1] mt-1">Class of {edu.year}</p>}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Projects */}
              {parsedResult.projects && parsedResult.projects.length > 0 && (
                <Card className="border-[#cbd5e1] dark:border-[#22396F] bg-white dark:bg-[#0D1C42] shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-bold flex items-center gap-2 text-[#010736] dark:text-white">
                      <FolderGit2 className="h-4 w-4 text-[#22396F] dark:text-[#FCF1D0]" />
                      Featured Projects
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {parsedResult.projects.map((proj, i) => (
                      <div key={i} className="p-3.5 rounded-xl border border-[#cbd5e1] dark:border-[#22396F] bg-[#f8fafc]/50 dark:bg-[#010736]/40">
                        <h4 className="font-bold text-sm text-[#010736] dark:text-white">{proj.name}</h4>
                        {proj.description && (
                          <p className="text-xs text-[#475569] dark:text-[#cbd5e1] mt-1 leading-relaxed">{proj.description}</p>
                        )}
                        {proj.technologies && proj.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {proj.technologies.map((t, ti) => (
                              <span
                                key={ti}
                                className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#f1f5f9] text-[#010736] dark:bg-[#22396F] dark:text-[#FCF1D0]"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
