"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Building2,
  MapPin,
  DollarSign,
  Plus,
  X,
  Bot,
  Video,
  Layers,
  Loader2,
  Eye,
  Send,
  Save,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const POPULAR_SKILLS = [
  "React",
  "Next.js",
  "TypeScript",
  "Node.js",
  "Python",
  "FastAPI",
  "Go",
  "PostgreSQL",
  "MongoDB",
  "Docker",
  "Kubernetes",
  "AWS",
  "GraphQL",
  "Tailwind CSS",
  "Redis",
  "System Design",
  "CI/CD",
  "Agile",
];

const POPULAR_BENEFITS = [
  "Competitive Salary & Bonuses",
  "100% Remote / Flexible Hours",
  "Comprehensive Health & Dental Insurance",
  "Top-Tier Hardware (MacBook Pro / Ultra Workstation)",
  "Annual Learning & Education Stipend",
  "Generous Paid Time Off & Parental Leave",
  "Stock Options / Equity Sharing",
  "Annual Company Retreats & Wellness Days",
];

export default function NewJobPostStudioPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"basics" | "description" | "skills" | "compensation" | "interview">("basics");
  const [showPreview, setShowPreview] = useState(false);
  const [generatingAi, setGeneratingAi] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    department: "Engineering",
    location: "Remote",
    remote: true,
    employmentType: "full_time",
    experienceLevel: "mid",
    experienceYears: 3,
    education: "Bachelor's degree in CS or equivalent experience",
    description: "",
    responsibilities: [
      "Design, build, and optimize high-throughput production services and modern web interfaces.",
      "Collaborate with product designers and engineering teams to ship delighting user experiences.",
      "Write clean, maintainable, and thoroughly tested code with continuous integration.",
      "Participate in technical architecture reviews, mentorship, and system design discussions.",
    ],
    requirements: [
      "Solid experience with modern web and cloud technologies.",
      "Demonstrated ability to solve ambiguous engineering and architectural challenges.",
      "Strong communication skills and enthusiasm for high-standard agile development.",
    ],
    skills: ["React", "TypeScript", "Node.js", "REST APIs"],
    salaryMin: "80000",
    salaryMax: "150000",
    currency: "BDT",
    benefits: [
      "Competitive Salary & Bonuses",
      "100% Remote / Flexible Hours",
      "Top-Tier Hardware (MacBook Pro / Ultra Workstation)",
      "Annual Learning & Education Stipend",
    ],
    // AI Interview Settings
    aiInterviewEnabled: true,
    aiQuestionCount: 5,
    aiInterviewDifficulty: "intermediate",
    aiPrimaryFocus: "System Architecture, Problem Solving, and Clean Code",
    aiAutoInvite: true,
  });

  const [skillInput, setSkillInput] = useState("");
  const [respInput, setRespInput] = useState("");
  const [reqInput, setReqInput] = useState("");

  // AI Description Generator
  const handleGenerateWithAi = async () => {
    if (!formData.title.trim()) {
      toast.error("Please enter a Job Title first so AI can generate the description!");
      return;
    }
    setGeneratingAi(true);
    try {
      const res = await fetch("/api/jobs/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          department: formData.department,
          experienceLevel: formData.experienceLevel,
          location: formData.location,
          employmentType: formData.employmentType,
          skills: formData.skills,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.data) {
        const gen = data.data;
        setFormData((prev) => ({
          ...prev,
          description: gen.description || prev.description,
          responsibilities: gen.responsibilities?.length ? gen.responsibilities : prev.responsibilities,
          requirements: gen.requirements?.length ? gen.requirements : prev.requirements,
          skills: gen.skills?.length ? Array.from(new Set([...prev.skills, ...gen.skills])) : prev.skills,
          benefits: gen.benefits?.length ? gen.benefits : prev.benefits,
          salaryMin: gen.suggestedSalaryRange?.min ? String(gen.suggestedSalaryRange.min) : prev.salaryMin,
          salaryMax: gen.suggestedSalaryRange?.max ? String(gen.suggestedSalaryRange.max) : prev.salaryMax,
          currency: gen.suggestedSalaryRange?.currency || prev.currency,
        }));
        toast.success("✨ AI successfully generated a complete job posting!");
        setActiveTab("description");
      } else {
        toast.error(data.error || "Failed to generate with AI");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error while generating with AI");
    } finally {
      setGeneratingAi(false);
    }
  };

  const handleAddSkill = (skill: string) => {
    const s = skill.trim();
    if (!s || formData.skills.includes(s)) return;
    setFormData((prev) => ({ ...prev, skills: [...prev.skills, s] }));
    setSkillInput("");
  };

  const handleRemoveSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((item) => item !== skill),
    }));
  };

  const handleToggleBenefit = (benefit: string) => {
    setFormData((prev) => ({
      ...prev,
      benefits: prev.benefits.includes(benefit)
        ? prev.benefits.filter((b) => b !== benefit)
        : [...prev.benefits, benefit],
    }));
  };

  const handleAddResponsibility = () => {
    if (!respInput.trim()) return;
    setFormData((prev) => ({
      ...prev,
      responsibilities: [...prev.responsibilities, respInput.trim()],
    }));
    setRespInput("");
  };

  const handleRemoveResponsibility = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      responsibilities: prev.responsibilities.filter((_, i) => i !== index),
    }));
  };

  const handleAddRequirement = () => {
    if (!reqInput.trim()) return;
    setFormData((prev) => ({
      ...prev,
      requirements: [...prev.requirements, reqInput.trim()],
    }));
    setReqInput("");
  };

  const handleRemoveRequirement = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index),
    }));
  };

  // Submit Job
  const handleSubmitJob = async (status: "active" | "draft") => {
    if (!formData.title.trim()) {
      toast.error("Job title is required");
      setActiveTab("basics");
      return;
    }

    const fullDescription = formData.description.trim()
      ? formData.description.trim()
      : `We are hiring a ${formData.title} to join our high-performing team. In this role, you will lead impactful initiatives, build scalable systems, and collaborate with passionate engineers.\n\nKey Responsibilities:\n${formData.responsibilities.map((r) => `• ${r}`).join("\n")}\n\nQualifications:\n${formData.requirements.map((r) => `• ${r}`).join("\n")}`;

    if (fullDescription.length < 50) {
      toast.error("Please provide a descriptive job overview (at least 50 characters)");
      setActiveTab("description");
      return;
    }

    setPublishing(true);
    try {
      const payload = {
        title: formData.title.trim(),
        description: fullDescription,
        department: formData.department,
        location: formData.location || "Remote",
        remote: formData.remote,
        employmentType: formData.employmentType,
        requirements: {
          skills: formData.skills.length > 0 ? formData.skills : ["Software Engineering"],
          experienceYears: Number(formData.experienceYears || 2),
          education: formData.education,
        },
        salaryRange: {
          min: Number(formData.salaryMin || 0),
          max: Number(formData.salaryMax || 0),
          currency: formData.currency || "BDT",
        },
        benefits: formData.benefits,
        status,
      };

      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (res.ok && result.success) {
        toast.success(status === "active" ? "🎉 Job published successfully!" : "Draft saved successfully!");
        router.push("/recruiter/jobs");
      } else {
        toast.error(result.error || "Failed to post job");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong while posting job");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#010736] text-[#010736] dark:text-white transition-colors duration-200 pb-16">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-30 border-b border-[#e2e8f0] dark:border-[#22396F] bg-white/90 dark:bg-[#010736]/90 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/recruiter/jobs">
              <Button variant="ghost" size="sm" className="gap-2 text-[#475569] dark:text-[#cbd5e1] hover:text-[#010736] dark:hover:text-[#FCF1D0]">
                <ArrowLeft className="h-4 w-4" /> Back to Jobs
              </Button>
            </Link>
            <div className="hidden sm:block h-4 w-px bg-[#cbd5e1] dark:bg-[#22396F]" />
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#010736] dark:bg-[#FCF1D0] text-[#FCF1D0] dark:text-[#010736]">
                <Briefcase className="h-4 w-4" />
              </span>
              <span className="text-sm font-bold tracking-tight">AI Job Posting Studio</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="gap-2 border-[#cbd5e1] dark:border-[#22396F] bg-white dark:bg-[#0D1C42] text-[#010736] dark:text-white hover:bg-[#f1f5f9] dark:hover:bg-[#22396F]"
            >
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">{showPreview ? "Hide Preview" : "Live Preview"}</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled={publishing}
              onClick={() => handleSubmitJob("draft")}
              className="gap-2 border-[#cbd5e1] dark:border-[#22396F] bg-white dark:bg-[#0D1C42] text-[#010736] dark:text-white"
            >
              <Save className="h-4 w-4" />
              <span className="hidden sm:inline">Save Draft</span>
            </Button>

            <Button
              size="sm"
              disabled={publishing}
              onClick={() => handleSubmitJob("active")}
              className="gap-2 bg-[#010736] text-[#FCF1D0] hover:bg-[#22396F] dark:bg-[#FCF1D0] dark:text-[#010736] dark:hover:bg-white font-semibold shadow-md"
            >
              {publishing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span>Publish Job Post</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-6">
        {/* Studio Banner */}
        <div className="mb-6 rounded-2xl p-6 bg-gradient-to-r from-[#010736] via-[#0D1C42] to-[#22396F] text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-[#FCF1D0] backdrop-blur-sm mb-2">
                <Sparkles className="h-3.5 w-3.5" /> Next-Gen AI Talent Acquisition
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Create & Publish a <span className="text-[#FCF1D0]">High-Impact Job Post</span>
              </h1>
              <p className="text-sm text-[#cbd5e1] mt-1 max-w-2xl">
                Configure your job criteria, generate full job specs in seconds with Gemini AI, and connect an automated AI Interviewer to screen candidates 24/7.
              </p>
            </div>

            <Button
              onClick={handleGenerateWithAi}
              disabled={generatingAi}
              className="shrink-0 bg-[#FCF1D0] text-[#010736] hover:bg-white font-bold gap-2 shadow-md transition-all scale-100 hover:scale-105"
            >
              {generatingAi ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating Specs...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-[#010736]" />
                  Generate with Gemini AI
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Wizard Step Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none border-b border-[#cbd5e1] dark:border-[#22396F]">
          {[
            { id: "basics", label: "1. Role Basics", icon: Briefcase },
            { id: "description", label: "2. AI Description & Duties", icon: Sparkles },
            { id: "skills", label: "3. Skills & Qualifications", icon: Layers },
            { id: "compensation", label: "4. Pay & Benefits", icon: DollarSign },
            { id: "interview", label: "5. AI Interview Setup", icon: Bot },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-[#010736] text-[#FCF1D0] dark:bg-[#FCF1D0] dark:text-[#010736] shadow-sm"
                  : "bg-white dark:bg-[#0D1C42] text-[#475569] dark:text-[#cbd5e1] hover:bg-[#f1f5f9] dark:hover:bg-[#22396F] border border-[#cbd5e1] dark:border-[#22396F]"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main Grid: Form (Left) & Optional Live Preview (Right) */}
        <div className={`grid gap-6 ${showPreview ? "lg:grid-cols-12" : "grid-cols-1"}`}>
          {/* Main Form Tabs */}
          <div className={showPreview ? "lg:col-span-7 space-y-6" : "space-y-6 max-w-4xl mx-auto"}>
            <AnimatePresence mode="wait">
              {/* TAB 1: ROLE BASICS */}
              {activeTab === "basics" && (
                <motion.div
                  key="basics"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <Card className="border-[#cbd5e1] dark:border-[#22396F] bg-white dark:bg-[#0D1C42] shadow-sm">
                    <CardHeader className="border-b border-[#f1f5f9] dark:border-[#22396F]/50">
                      <CardTitle className="text-lg font-bold flex items-center gap-2 text-[#010736] dark:text-white">
                        <Briefcase className="h-5 w-5 text-[#22396F] dark:text-[#FCF1D0]" />
                        Role Identity & Department
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-5">
                      <div>
                        <Label className="text-xs font-bold uppercase tracking-wider text-[#475569] dark:text-[#cbd5e1]">
                          Job Title <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          placeholder="e.g. Senior Full-Stack Engineer (Next.js & Python)"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          className="mt-1.5 h-11 text-base bg-white dark:bg-[#010736] border-[#cbd5e1] dark:border-[#22396F] focus:border-[#22396F] dark:focus:border-[#FCF1D0]"
                        />
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          <span className="text-[11px] text-[#475569] dark:text-[#cbd5e1]">Suggestions:</span>
                          {[
                            "Senior Full Stack Engineer",
                            "AI / Machine Learning Engineer",
                            "Frontend Developer (React/Next.js)",
                            "DevOps & Cloud Architect",
                            "Lead Product Designer",
                          ].map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => setFormData({ ...formData, title: t })}
                              className="text-[11px] px-2 py-0.5 rounded-full bg-[#f1f5f9] dark:bg-[#010736] hover:bg-[#e2e8f0] dark:hover:bg-[#22396F] text-[#22396F] dark:text-[#FCF1D0] transition-colors"
                            >
                              + {t}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs font-bold uppercase tracking-wider text-[#475569] dark:text-[#cbd5e1]">
                            Department
                          </Label>
                          <Select
                            value={formData.department}
                            onValueChange={(val) => setFormData({ ...formData, department: val })}
                          >
                            <SelectTrigger className="mt-1.5 h-11 bg-white dark:bg-[#010736] border-[#cbd5e1] dark:border-[#22396F]">
                              <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-[#0D1C42] border-[#cbd5e1] dark:border-[#22396F]">
                              <SelectItem value="Engineering">Engineering & Tech</SelectItem>
                              <SelectItem value="AI & Data Science">AI & Data Science</SelectItem>
                              <SelectItem value="Product">Product Management</SelectItem>
                              <SelectItem value="Design">UI/UX & Product Design</SelectItem>
                              <SelectItem value="Marketing">Marketing & Growth</SelectItem>
                              <SelectItem value="Operations">Operations & HR</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-xs font-bold uppercase tracking-wider text-[#475569] dark:text-[#cbd5e1]">
                            Employment Type
                          </Label>
                          <Select
                            value={formData.employmentType}
                            onValueChange={(val) => setFormData({ ...formData, employmentType: val })}
                          >
                            <SelectTrigger className="mt-1.5 h-11 bg-white dark:bg-[#010736] border-[#cbd5e1] dark:border-[#22396F]">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-[#0D1C42] border-[#cbd5e1] dark:border-[#22396F]">
                              <SelectItem value="full_time">Full-time Employee</SelectItem>
                              <SelectItem value="part_time">Part-time</SelectItem>
                              <SelectItem value="contract">Contractor / Freelance</SelectItem>
                              <SelectItem value="internship">Internship</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs font-bold uppercase tracking-wider text-[#475569] dark:text-[#cbd5e1]">
                            Location & Workplace Policy
                          </Label>
                          <div className="relative mt-1.5">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#475569] dark:text-[#cbd5e1]" />
                            <Input
                              placeholder="e.g. Remote, Dhaka, Bangladesh, or Global"
                              value={formData.location}
                              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                              className="pl-9 h-11 bg-white dark:bg-[#010736] border-[#cbd5e1] dark:border-[#22396F]"
                            />
                          </div>
                        </div>

                        <div>
                          <Label className="text-xs font-bold uppercase tracking-wider text-[#475569] dark:text-[#cbd5e1]">
                            Seniority Level
                          </Label>
                          <Select
                            value={formData.experienceLevel}
                            onValueChange={(val) => setFormData({ ...formData, experienceLevel: val })}
                          >
                            <SelectTrigger className="mt-1.5 h-11 bg-white dark:bg-[#010736] border-[#cbd5e1] dark:border-[#22396F]">
                              <SelectValue placeholder="Select seniority" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-[#0D1C42] border-[#cbd5e1] dark:border-[#22396F]">
                              <SelectItem value="entry">Entry Level (0-2 yrs)</SelectItem>
                              <SelectItem value="mid">Mid Level (2-5 yrs)</SelectItem>
                              <SelectItem value="senior">Senior Level (5+ yrs)</SelectItem>
                              <SelectItem value="lead">Lead / Principal (8+ yrs)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex items-center justify-between rounded-xl p-4 bg-[#f1f5f9] dark:bg-[#010736] border border-[#cbd5e1] dark:border-[#22396F]">
                        <div>
                          <p className="text-sm font-bold text-[#010736] dark:text-white">100% Remote Friendly Role</p>
                          <p className="text-xs text-[#475569] dark:text-[#cbd5e1]">Allow candidates worldwide or countrywide to apply remotely</p>
                        </div>
                        <Switch
                          checked={formData.remote}
                          onCheckedChange={(checked) => setFormData({ ...formData, remote: checked })}
                        />
                      </div>

                      <div className="flex justify-end pt-2">
                        <Button
                          onClick={() => setActiveTab("description")}
                          className="bg-[#010736] text-[#FCF1D0] hover:bg-[#22396F] dark:bg-[#FCF1D0] dark:text-[#010736] dark:hover:bg-white font-semibold"
                        >
                          Next: Description & Duties →
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* TAB 2: AI DESCRIPTION & RESPONSIBILITIES */}
              {activeTab === "description" && (
                <motion.div
                  key="description"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <Card className="border-[#cbd5e1] dark:border-[#22396F] bg-white dark:bg-[#0D1C42] shadow-sm">
                    <CardHeader className="border-b border-[#f1f5f9] dark:border-[#22396F]/50 flex flex-row items-center justify-between">
                      <CardTitle className="text-lg font-bold flex items-center gap-2 text-[#010736] dark:text-white">
                        <Sparkles className="h-5 w-5 text-[#22396F] dark:text-[#FCF1D0]" />
                        Job Description & Impact
                      </CardTitle>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleGenerateWithAi}
                        disabled={generatingAi}
                        className="gap-1.5 text-xs border-[#22396F] text-[#22396F] dark:text-[#FCF1D0] dark:border-[#FCF1D0]"
                      >
                        <Bot className="h-3.5 w-3.5" /> Re-generate with AI
                      </Button>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      <div>
                        <Label className="text-xs font-bold uppercase tracking-wider text-[#475569] dark:text-[#cbd5e1]">
                          Role Overview & Mission (Markdown supported)
                        </Label>
                        <Textarea
                          rows={6}
                          placeholder="Describe the mission of this role, the core team, and the immediate impact the hire will make..."
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className="mt-1.5 font-sans bg-white dark:bg-[#010736] border-[#cbd5e1] dark:border-[#22396F]"
                        />
                      </div>

                      {/* Key Responsibilities */}
                      <div>
                        <Label className="text-xs font-bold uppercase tracking-wider text-[#475569] dark:text-[#cbd5e1]">
                          Key Responsibilities & Deliverables
                        </Label>
                        <div className="space-y-2 mt-2">
                          {formData.responsibilities.map((resp, idx) => (
                            <div
                              key={idx}
                              className="flex items-start gap-2 p-2.5 rounded-lg bg-[#f8fafc] dark:bg-[#010736] border border-[#cbd5e1] dark:border-[#22396F]"
                            >
                              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#22396F] text-[#FCF1D0] text-[10px] font-bold mt-0.5">
                                {idx + 1}
                              </span>
                              <p className="flex-1 text-xs text-[#010736] dark:text-[#cbd5e1]">{resp}</p>
                              <button
                                type="button"
                                onClick={() => handleRemoveResponsibility(idx)}
                                className="text-red-400 hover:text-red-500 p-1"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>

                        <div className="flex gap-2 mt-3">
                          <Input
                            placeholder="Add a specific responsibility and press Add..."
                            value={respInput}
                            onChange={(e) => setRespInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddResponsibility())}
                            className="text-xs bg-white dark:bg-[#010736] border-[#cbd5e1] dark:border-[#22396F]"
                          />
                          <Button size="sm" type="button" onClick={handleAddResponsibility} className="gap-1 shrink-0">
                            <Plus className="h-4 w-4" /> Add
                          </Button>
                        </div>
                      </div>

                      {/* Qualifications & Requirements */}
                      <div>
                        <Label className="text-xs font-bold uppercase tracking-wider text-[#475569] dark:text-[#cbd5e1]">
                          Required Qualifications & Background
                        </Label>
                        <div className="space-y-2 mt-2">
                          {formData.requirements.map((req, idx) => (
                            <div
                              key={idx}
                              className="flex items-start gap-2 p-2.5 rounded-lg bg-[#f8fafc] dark:bg-[#010736] border border-[#cbd5e1] dark:border-[#22396F]"
                            >
                              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                              <p className="flex-1 text-xs text-[#010736] dark:text-[#cbd5e1]">{req}</p>
                              <button
                                type="button"
                                onClick={() => handleRemoveRequirement(idx)}
                                className="text-red-400 hover:text-red-500 p-1"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>

                        <div className="flex gap-2 mt-3">
                          <Input
                            placeholder="Add a required qualification..."
                            value={reqInput}
                            onChange={(e) => setReqInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddRequirement())}
                            className="text-xs bg-white dark:bg-[#010736] border-[#cbd5e1] dark:border-[#22396F]"
                          />
                          <Button size="sm" type="button" onClick={handleAddRequirement} className="gap-1 shrink-0">
                            <Plus className="h-4 w-4" /> Add
                          </Button>
                        </div>
                      </div>

                      <div className="flex justify-between pt-2">
                        <Button variant="ghost" onClick={() => setActiveTab("basics")}>
                          ← Back to Basics
                        </Button>
                        <Button
                          onClick={() => setActiveTab("skills")}
                          className="bg-[#010736] text-[#FCF1D0] hover:bg-[#22396F] dark:bg-[#FCF1D0] dark:text-[#010736] dark:hover:bg-white font-semibold"
                        >
                          Next: Skills & Criteria →
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* TAB 3: SKILLS & QUALIFICATIONS */}
              {activeTab === "skills" && (
                <motion.div
                  key="skills"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <Card className="border-[#cbd5e1] dark:border-[#22396F] bg-white dark:bg-[#0D1C42] shadow-sm">
                    <CardHeader className="border-b border-[#f1f5f9] dark:border-[#22396F]/50">
                      <CardTitle className="text-lg font-bold flex items-center gap-2 text-[#010736] dark:text-white">
                        <Layers className="h-5 w-5 text-[#22396F] dark:text-[#FCF1D0]" />
                        Required Skills & Competencies
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      <div>
                        <Label className="text-xs font-bold uppercase tracking-wider text-[#475569] dark:text-[#cbd5e1]">
                          Selected Tech Skills & Keywords ({formData.skills.length})
                        </Label>
                        <div className="flex flex-wrap gap-2 mt-2 p-3 min-h-[56px] rounded-xl bg-[#f8fafc] dark:bg-[#010736] border border-[#cbd5e1] dark:border-[#22396F]">
                          {formData.skills.map((skill) => (
                            <Badge
                              key={skill}
                              className="bg-[#010736] text-[#FCF1D0] dark:bg-[#FCF1D0] dark:text-[#010736] border-0 gap-1.5 pl-3 pr-2 py-1"
                            >
                              {skill}
                              <button
                                type="button"
                                onClick={() => handleRemoveSkill(skill)}
                                className="hover:opacity-75"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                          {formData.skills.length === 0 && (
                            <p className="text-xs text-muted-foreground self-center">No skills added yet. Select from below or type custom skill.</p>
                          )}
                        </div>

                        {/* Add custom skill input */}
                        <div className="flex gap-2 mt-3">
                          <Input
                            placeholder="Type a skill and press Enter (e.g. Next.js, Redis, PyTorch)..."
                            value={skillInput}
                            onChange={(e) => setSkillInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddSkill(skillInput);
                              }
                            }}
                            className="h-10 text-xs bg-white dark:bg-[#010736] border-[#cbd5e1] dark:border-[#22396F]"
                          />
                          <Button
                            type="button"
                            onClick={() => handleAddSkill(skillInput)}
                            className="gap-1 shrink-0"
                          >
                            <Plus className="h-4 w-4" /> Add Skill
                          </Button>
                        </div>

                        {/* Quick Add Pills */}
                        <div className="mt-4">
                          <p className="text-xs font-semibold text-[#475569] dark:text-[#cbd5e1] mb-2">
                            Quick add trending competencies:
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {POPULAR_SKILLS.map((s) => {
                              const isSelected = formData.skills.includes(s);
                              return (
                                <button
                                  key={s}
                                  type="button"
                                  disabled={isSelected}
                                  onClick={() => handleAddSkill(s)}
                                  className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                                    isSelected
                                      ? "opacity-40 cursor-not-allowed border-transparent bg-gray-200 dark:bg-gray-800"
                                      : "border-[#cbd5e1] dark:border-[#22396F] bg-white dark:bg-[#0D1C42] hover:border-[#010736] dark:hover:border-[#FCF1D0] text-[#010736] dark:text-white"
                                  }`}
                                >
                                  + {s}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#f1f5f9] dark:border-[#22396F]/50">
                        <div>
                          <Label className="text-xs font-bold uppercase tracking-wider text-[#475569] dark:text-[#cbd5e1]">
                            Minimum Years of Experience
                          </Label>
                          <Input
                            type="number"
                            min="0"
                            max="20"
                            value={formData.experienceYears}
                            onChange={(e) => setFormData({ ...formData, experienceYears: Number(e.target.value) })}
                            className="mt-1.5 h-11 bg-white dark:bg-[#010736] border-[#cbd5e1] dark:border-[#22396F]"
                          />
                        </div>

                        <div>
                          <Label className="text-xs font-bold uppercase tracking-wider text-[#475569] dark:text-[#cbd5e1]">
                            Education Benchmark
                          </Label>
                          <Input
                            placeholder="e.g. Bachelor's in CS or equivalent field"
                            value={formData.education}
                            onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                            className="mt-1.5 h-11 bg-white dark:bg-[#010736] border-[#cbd5e1] dark:border-[#22396F]"
                          />
                        </div>
                      </div>

                      <div className="flex justify-between pt-2">
                        <Button variant="ghost" onClick={() => setActiveTab("description")}>
                          ← Back
                        </Button>
                        <Button
                          onClick={() => setActiveTab("compensation")}
                          className="bg-[#010736] text-[#FCF1D0] hover:bg-[#22396F] dark:bg-[#FCF1D0] dark:text-[#010736] dark:hover:bg-white font-semibold"
                        >
                          Next: Pay & Benefits →
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* TAB 4: COMPENSATION & BENEFITS */}
              {activeTab === "compensation" && (
                <motion.div
                  key="compensation"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <Card className="border-[#cbd5e1] dark:border-[#22396F] bg-white dark:bg-[#0D1C42] shadow-sm">
                    <CardHeader className="border-b border-[#f1f5f9] dark:border-[#22396F]/50">
                      <CardTitle className="text-lg font-bold flex items-center gap-2 text-[#010736] dark:text-white">
                        <DollarSign className="h-5 w-5 text-[#22396F] dark:text-[#FCF1D0]" />
                        Compensation & Perks Package
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      <div>
                        <Label className="text-xs font-bold uppercase tracking-wider text-[#475569] dark:text-[#cbd5e1]">
                          Salary Range
                        </Label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-1.5">
                          <div>
                            <Label className="text-[11px] text-[#475569] dark:text-[#cbd5e1]">Minimum</Label>
                            <Input
                              type="number"
                              placeholder="Min"
                              value={formData.salaryMin}
                              onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
                              className="h-11 bg-white dark:bg-[#010736] border-[#cbd5e1] dark:border-[#22396F]"
                            />
                          </div>
                          <div>
                            <Label className="text-[11px] text-[#475569] dark:text-[#cbd5e1]">Maximum</Label>
                            <Input
                              type="number"
                              placeholder="Max"
                              value={formData.salaryMax}
                              onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
                              className="h-11 bg-white dark:bg-[#010736] border-[#cbd5e1] dark:border-[#22396F]"
                            />
                          </div>
                          <div>
                            <Label className="text-[11px] text-[#475569] dark:text-[#cbd5e1]">Currency</Label>
                            <Select
                              value={formData.currency}
                              onValueChange={(val) => setFormData({ ...formData, currency: val })}
                            >
                              <SelectTrigger className="h-11 bg-white dark:bg-[#010736] border-[#cbd5e1] dark:border-[#22396F]">
                                <SelectValue placeholder="Currency" />
                              </SelectTrigger>
                              <SelectContent className="bg-white dark:bg-[#0D1C42] border-[#cbd5e1] dark:border-[#22396F]">
                                <SelectItem value="BDT">BDT (৳ Bangladesh Taka)</SelectItem>
                                <SelectItem value="USD">USD ($ US Dollar)</SelectItem>
                                <SelectItem value="EUR">EUR (€ Euro)</SelectItem>
                                <SelectItem value="GBP">GBP (£ British Pound)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      {/* Benefits & Perks */}
                      <div>
                        <Label className="text-xs font-bold uppercase tracking-wider text-[#475569] dark:text-[#cbd5e1]">
                          Benefits & Cultural Perks
                        </Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                          {POPULAR_BENEFITS.map((benefit) => {
                            const isChecked = formData.benefits.includes(benefit);
                            return (
                              <button
                                key={benefit}
                                type="button"
                                onClick={() => handleToggleBenefit(benefit)}
                                className={`flex items-center gap-2 p-3 rounded-xl border text-left text-xs font-medium transition-all ${
                                  isChecked
                                    ? "bg-[#010736] text-[#FCF1D0] dark:bg-[#FCF1D0] dark:text-[#010736] border-transparent shadow-sm"
                                    : "bg-white dark:bg-[#010736] border-[#cbd5e1] dark:border-[#22396F] text-[#475569] dark:text-[#cbd5e1] hover:border-[#010736] dark:hover:border-[#FCF1D0]"
                                }`}
                              >
                                <CheckCircle2 className={`h-4 w-4 shrink-0 ${isChecked ? "opacity-100" : "opacity-30"}`} />
                                <span>{benefit}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex justify-between pt-2">
                        <Button variant="ghost" onClick={() => setActiveTab("skills")}>
                          ← Back
                        </Button>
                        <Button
                          onClick={() => setActiveTab("interview")}
                          className="bg-[#010736] text-[#FCF1D0] hover:bg-[#22396F] dark:bg-[#FCF1D0] dark:text-[#010736] dark:hover:bg-white font-semibold"
                        >
                          Next: AI Interview Setup →
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* TAB 5: AI INTERVIEW SETUP */}
              {activeTab === "interview" && (
                <motion.div
                  key="interview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <Card className="border-[#cbd5e1] dark:border-[#22396F] bg-white dark:bg-[#0D1C42] shadow-sm">
                    <CardHeader className="border-b border-[#f1f5f9] dark:border-[#22396F]/50">
                      <CardTitle className="text-lg font-bold flex items-center gap-2 text-[#010736] dark:text-white">
                        <Bot className="h-5 w-5 text-[#22396F] dark:text-[#FCF1D0]" />
                        Automated AI Screening & Interview Board
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      <div className="flex items-center justify-between rounded-xl p-4 bg-gradient-to-r from-[#010736]/10 to-[#22396F]/10 dark:from-[#22396F]/30 dark:to-[#0D1C42] border border-[#cbd5e1] dark:border-[#22396F]">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#010736] dark:bg-[#FCF1D0] text-[#FCF1D0] dark:text-[#010736]">
                            <Video className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[#010736] dark:text-white">
                              Activate Autonomous AI Interviewer
                            </p>
                            <p className="text-xs text-[#475569] dark:text-[#cbd5e1]">
                              Invited applicants undergo voice/video screening with AI proctoring & scoring
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={formData.aiInterviewEnabled}
                          onCheckedChange={(checked) => setFormData({ ...formData, aiInterviewEnabled: checked })}
                        />
                      </div>

                      {formData.aiInterviewEnabled && (
                        <div className="space-y-4 pt-2">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <Label className="text-xs font-bold uppercase tracking-wider text-[#475569] dark:text-[#cbd5e1]">
                                Questions Per Candidate Session
                              </Label>
                              <Select
                                value={String(formData.aiQuestionCount)}
                                onValueChange={(val) => setFormData({ ...formData, aiQuestionCount: Number(val) })}
                              >
                                <SelectTrigger className="mt-1.5 h-11 bg-white dark:bg-[#010736] border-[#cbd5e1] dark:border-[#22396F]">
                                  <SelectValue placeholder="Select questions" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-[#0D1C42] border-[#cbd5e1] dark:border-[#22396F]">
                                  <SelectItem value="3">3 Questions (~5 mins fast screening)</SelectItem>
                                  <SelectItem value="5">5 Questions (~10 mins balanced assessment)</SelectItem>
                                  <SelectItem value="7">7 Questions (~15 mins deep technical dive)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label className="text-xs font-bold uppercase tracking-wider text-[#475569] dark:text-[#cbd5e1]">
                                AI Difficulty Calibration
                              </Label>
                              <Select
                                value={formData.aiInterviewDifficulty}
                                onValueChange={(val) => setFormData({ ...formData, aiInterviewDifficulty: val })}
                              >
                                <SelectTrigger className="mt-1.5 h-11 bg-white dark:bg-[#010736] border-[#cbd5e1] dark:border-[#22396F]">
                                  <SelectValue placeholder="Select difficulty" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-[#0D1C42] border-[#cbd5e1] dark:border-[#22396F]">
                                  <SelectItem value="fundamental">Fundamental Concepts</SelectItem>
                                  <SelectItem value="intermediate">Intermediate Real-world Scenarios</SelectItem>
                                  <SelectItem value="hard">Advanced Architecture & High Stress Edge Cases</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div>
                            <Label className="text-xs font-bold uppercase tracking-wider text-[#475569] dark:text-[#cbd5e1]">
                              Key Competency Focus Areas
                            </Label>
                            <Input
                              placeholder="e.g. Distributed Caching, Next.js App Router, Clean Architecture"
                              value={formData.aiPrimaryFocus}
                              onChange={(e) => setFormData({ ...formData, aiPrimaryFocus: e.target.value })}
                              className="mt-1.5 h-11 bg-white dark:bg-[#010736] border-[#cbd5e1] dark:border-[#22396F]"
                            />
                            <p className="text-[11px] text-[#475569] dark:text-[#cbd5e1] mt-1">
                              Gemini will craft tailored questions stressing these areas when interviewing applicants.
                            </p>
                          </div>

                          <div className="flex items-center justify-between rounded-xl p-3 bg-[#f8fafc] dark:bg-[#010736] border border-[#cbd5e1] dark:border-[#22396F]">
                            <div>
                              <p className="text-xs font-bold text-[#010736] dark:text-white">Auto-Invite Upon Application</p>
                              <p className="text-[11px] text-[#475569] dark:text-[#cbd5e1]">Candidate receives an instant invitation to take the AI interview upon submitting resume</p>
                            </div>
                            <Switch
                              checked={formData.aiAutoInvite}
                              onCheckedChange={(checked) => setFormData({ ...formData, aiAutoInvite: checked })}
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-[#f1f5f9] dark:border-[#22396F]/50">
                        <Button variant="ghost" onClick={() => setActiveTab("compensation")}>
                          ← Back
                        </Button>
                        <Button
                          disabled={publishing}
                          onClick={() => handleSubmitJob("active")}
                          className="bg-[#010736] text-[#FCF1D0] hover:bg-[#22396F] dark:bg-[#FCF1D0] dark:text-[#010736] dark:hover:bg-white font-bold gap-2 shadow-md px-6"
                        >
                          {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                          Publish Job Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column: Live Candidate View Preview */}
          {showPreview && (
            <div className="lg:col-span-5">
              <div className="sticky top-20 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#475569] dark:text-[#cbd5e1] flex items-center gap-1.5">
                    <Eye className="h-3.5 w-3.5 text-[#22396F] dark:text-[#FCF1D0]" /> Live Candidate View
                  </span>
                  <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
                    Live Reactive Preview
                  </Badge>
                </div>

                <Card className="border-[#cbd5e1] dark:border-[#22396F] bg-white dark:bg-[#0D1C42] shadow-xl overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-[#22396F] via-[#FCF1D0] to-[#010736]" />
                  <CardContent className="p-5 space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#010736] text-[#FCF1D0]">
                          <Building2 className="h-4 w-4" />
                        </span>
                        <span className="text-xs font-semibold text-[#475569] dark:text-[#cbd5e1]">
                          Your Company
                        </span>
                        <Badge className="ml-auto text-[10px] bg-[#FCF1D0] text-[#010736] font-semibold border-0">
                          {formData.employmentType.replace("_", " ")}
                        </Badge>
                      </div>

                      <h3 className="text-lg font-extrabold text-[#010736] dark:text-white leading-tight">
                        {formData.title || "Untitled Job Posting"}
                      </h3>

                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-[#475569] dark:text-[#cbd5e1]">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {formData.location || "Remote"}
                        </span>
                        {formData.salaryMin && (
                          <span className="flex items-center gap-1 font-semibold text-[#22396F] dark:text-[#FCF1D0]">
                            <DollarSign className="h-3 w-3" />
                            {formData.currency} {Number(formData.salaryMin).toLocaleString()} - {Number(formData.salaryMax).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="border-t border-[#f1f5f9] dark:border-[#22396F]/50 pt-3">
                      <p className="text-xs font-bold text-[#010736] dark:text-white mb-1.5">Required Skills</p>
                      <div className="flex flex-wrap gap-1">
                        {formData.skills.map((s) => (
                          <span
                            key={s}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-[#f1f5f9] dark:bg-[#010736] text-[#22396F] dark:text-[#FCF1D0] border border-[#cbd5e1] dark:border-[#22396F]"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    {formData.aiInterviewEnabled && (
                      <div className="rounded-xl p-3 bg-gradient-to-r from-[#22396F]/10 to-[#FCF1D0]/10 border border-[#22396F]/20 dark:border-[#FCF1D0]/20 flex items-center gap-2.5">
                        <Bot className="h-5 w-5 text-[#22396F] dark:text-[#FCF1D0] shrink-0" />
                        <div>
                          <p className="text-[11px] font-bold text-[#010736] dark:text-white">
                            Autonomous AI Interviewer Equipped
                          </p>
                          <p className="text-[10px] text-[#475569] dark:text-[#cbd5e1]">
                            {formData.aiQuestionCount} questions ({formData.aiInterviewDifficulty})
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="pt-2">
                      <Button className="w-full bg-[#010736] text-[#FCF1D0] dark:bg-[#FCF1D0] dark:text-[#010736] font-bold" disabled>
                        Apply for this Role
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
