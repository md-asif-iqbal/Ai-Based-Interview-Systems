"use client";

import { motion } from "framer-motion";
import {
  User,
  GraduationCap,
  Briefcase,
  Code2,
  Award,
  Globe,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Star,
  FolderGit2,
  Trophy,
  Heart,
  Gamepad2,
  Users,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

interface ParsedResume {
  personalInfo?: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
    website?: string;
  };
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  summary?: string;
  skills?: string[];
  experience?: Array<{
    company: string;
    title: string;
    duration?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
    current?: boolean;
  }>;
  education?: Array<{
    institution: string;
    degree: string;
    year?: string;
    gpa?: string;
    field?: string;
  }>;
  projects?: Array<{
    name: string;
    description?: string;
    technologies?: string[];
    url?: string;
  }>;
  certifications?: string[];
  languages?: string[];
  achievements?: string[];
  volunteerWork?: string[];
  hobbies?: string[];
  references?: Array<{
    name: string;
    title?: string;
    company?: string;
    contact?: string;
  }>;
  totalExperienceYears?: number;
  overallScore?: number;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  websiteUrl?: string;
}

interface ResumeAnalysisResultsProps {
  data: ParsedResume;
}

export default function ResumeAnalysisResults({ data }: ResumeAnalysisResultsProps) {
  const fadeUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  };

  const score = data.overallScore || 0;
  const scoreColor =
    score >= 80
      ? "text-green-500"
      : score >= 60
      ? "text-yellow-500"
      : score >= 40
      ? "text-orange-500"
      : "text-red-500";

  // Normalize personal info — handle both flat and nested formats
  const personal = {
    name: data.personalInfo?.name || data.name,
    email: data.personalInfo?.email || data.email,
    phone: data.personalInfo?.phone || data.phone,
    location: data.personalInfo?.location || data.location,
    linkedin: data.personalInfo?.linkedin || data.linkedinUrl,
    github: data.personalInfo?.github || data.githubUrl,
    portfolio: data.personalInfo?.portfolio || data.portfolioUrl,
    website: data.personalInfo?.website || data.websiteUrl,
  };

  return (
    <div className="space-y-6">
      {/* Score Card */}
      <motion.div {...fadeUp}>
        <Card className="border-border/40 overflow-hidden">
          <div className="bg-[#0D1C42] border-b border-[#22396F] p-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-primary/20">
                  <span className={`text-2xl font-bold ${scoreColor}`}>{score}</span>
                </div>
                <Star className="absolute -top-1 -right-1 h-5 w-5 text-yellow-500 fill-yellow-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold">Resume Score</h3>
                <p className="text-sm text-muted-foreground">
                  {score >= 80
                    ? "Excellent resume! Ready for top positions."
                    : score >= 60
                    ? "Good resume. A few improvements suggested."
                    : score >= 40
                    ? "Average resume. Consider adding more details."
                    : "Needs improvement. Add more experience and skills."}
                </p>
                <Progress value={score} className="h-2 mt-3 w-48" />
                {data.totalExperienceYears ? (
                  <p className="text-xs text-muted-foreground mt-2">
                    {data.totalExperienceYears}+ years of experience
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Personal Info */}
      {(personal.name || personal.email || personal.phone) && (
        <motion.div {...fadeUp} transition={{ delay: 0.05 }}>
          <Card className="border-border/40">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4 text-primary" /> Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-3">
                {personal.name && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="font-medium">{personal.name}</span>
                  </div>
                )}
                {personal.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="truncate">{personal.email}</span>
                  </div>
                )}
                {personal.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>{personal.phone}</span>
                  </div>
                )}
                {personal.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>{personal.location}</span>
                  </div>
                )}
                {personal.linkedin && (
                  <a href={personal.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                    <ExternalLink className="h-4 w-4 shrink-0" /> LinkedIn
                  </a>
                )}
                {personal.github && (
                  <a href={personal.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                    <ExternalLink className="h-4 w-4 shrink-0" /> GitHub
                  </a>
                )}
                {personal.portfolio && (
                  <a href={personal.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                    <ExternalLink className="h-4 w-4 shrink-0" /> Portfolio
                  </a>
                )}
                {personal.website && (
                  <a href={personal.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                    <ExternalLink className="h-4 w-4 shrink-0" /> Website
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Summary */}
      {data.summary && (
        <motion.div {...fadeUp} transition={{ delay: 0.1 }}>
          <Card className="border-border/40">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4 text-primary" /> Professional Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">{data.summary}</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Skills */}
      {data.skills && data.skills.length > 0 && (
        <motion.div {...fadeUp} transition={{ delay: 0.15 }}>
          <Card className="border-border/40">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Code2 className="h-4 w-4 text-primary" /> Skills ({data.skills.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {data.skills.map((skill, i) => (
                  <motion.div
                    key={skill}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.15 + i * 0.015 }}
                  >
                    <Badge variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <motion.div {...fadeUp} transition={{ delay: 0.2 }}>
          <Card className="border-border/40">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Briefcase className="h-4 w-4 text-primary" /> Experience ({data.experience.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.experience.map((exp, i) => (
                <div key={i}>
                  {i > 0 && <Separator className="mb-4" />}
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 mt-0.5">
                      <Briefcase className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">{exp.title}</p>
                        {exp.current && (
                          <Badge variant="default" className="text-[10px] h-5">Current</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{exp.company}</p>
                      <p className="text-xs text-muted-foreground/70 mt-0.5">
                        {exp.duration || `${exp.startDate || ""} — ${exp.endDate || "Present"}`}
                      </p>
                      {exp.description && (
                        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{exp.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Education */}
      {data.education && data.education.length > 0 && (
        <motion.div {...fadeUp} transition={{ delay: 0.25 }}>
          <Card className="border-border/40">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <GraduationCap className="h-4 w-4 text-primary" /> Education
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.education.map((edu, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 mt-0.5">
                    <GraduationCap className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{edu.degree}</p>
                    <p className="text-sm text-muted-foreground">{edu.institution}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      {edu.field && <span className="text-xs text-muted-foreground/70">{edu.field}</span>}
                      {edu.year && <span className="text-xs text-muted-foreground/70">{edu.year}</span>}
                      {edu.gpa && (
                        <Badge variant="outline" className="text-[10px]">
                          GPA: {edu.gpa}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Projects */}
      {data.projects && data.projects.length > 0 && (
        <motion.div {...fadeUp} transition={{ delay: 0.3 }}>
          <Card className="border-border/40">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <FolderGit2 className="h-4 w-4 text-primary" /> Projects ({data.projects.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.projects.map((project, i) => (
                <div key={i}>
                  {i > 0 && <Separator className="mb-4" />}
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 mt-0.5">
                      <FolderGit2 className="h-4 w-4 text-violet-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">{project.name}</p>
                        {project.url && (
                          <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                      {project.description && (
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{project.description}</p>
                      )}
                      {project.technologies && project.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {project.technologies.map((tech) => (
                            <Badge key={tech} variant="outline" className="text-[10px]">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Achievements */}
      {data.achievements && data.achievements.length > 0 && (
        <motion.div {...fadeUp} transition={{ delay: 0.33 }}>
          <Card className="border-border/40">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Trophy className="h-4 w-4 text-yellow-500" /> Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {data.achievements.map((a, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-yellow-500 shrink-0 mt-1.5" />
                    {a}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Certifications & Languages */}
      <div className="grid sm:grid-cols-2 gap-4">
        {data.certifications && data.certifications.length > 0 && (
          <motion.div {...fadeUp} transition={{ delay: 0.35 }}>
            <Card className="border-border/40 h-full">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Award className="h-4 w-4 text-primary" /> Certifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {data.certifications.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                      {c}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {data.languages && data.languages.length > 0 && (
          <motion.div {...fadeUp} transition={{ delay: 0.38 }}>
            <Card className="border-border/40 h-full">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Globe className="h-4 w-4 text-primary" /> Languages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {data.languages.map((l) => (
                    <Badge key={l} variant="outline" className="text-xs">
                      {l}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Volunteer Work & Hobbies */}
      <div className="grid sm:grid-cols-2 gap-4">
        {data.volunteerWork && data.volunteerWork.length > 0 && (
          <motion.div {...fadeUp} transition={{ delay: 0.4 }}>
            <Card className="border-border/40 h-full">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Heart className="h-4 w-4 text-rose-500" /> Volunteer Work
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {data.volunteerWork.map((v, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                      {v}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {data.hobbies && data.hobbies.length > 0 && (
          <motion.div {...fadeUp} transition={{ delay: 0.42 }}>
            <Card className="border-border/40 h-full">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Gamepad2 className="h-4 w-4 text-emerald-500" /> Interests & Hobbies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {data.hobbies.map((h) => (
                    <Badge key={h} variant="outline" className="text-xs">
                      {h}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* References */}
      {data.references && data.references.length > 0 && (
        <motion.div {...fadeUp} transition={{ delay: 0.45 }}>
          <Card className="border-border/40">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4 text-primary" /> References
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.references.map((ref, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted mt-0.5">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{ref.name}</p>
                    {(ref.title || ref.company) && (
                      <p className="text-xs text-muted-foreground">
                        {ref.title}{ref.title && ref.company ? " at " : ""}{ref.company}
                      </p>
                    )}
                    {ref.contact && (
                      <p className="text-xs text-muted-foreground/70 mt-0.5">{ref.contact}</p>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
