"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Brain,
  Shield,
  Zap,
  Users,
  FileSearch,
  Video,
  ArrowRight,
  CheckCircle2,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
};

export default function HomePage() {
  return (
    <div className="relative overflow-hidden bg-white dark:bg-[#010736] text-[#010736] dark:text-white transition-colors duration-200">
      {/* Hero Section */}
      <section className="relative py-20 sm:py-28 lg:py-36 border-b border-[#cbd5e1] dark:border-[#22396F]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div variants={fadeUp}>
              <Badge
                variant="outline"
                className="mb-6 px-4 py-1.5 text-sm font-medium bg-[#f1f5f9] text-[#010736] border-[#cbd5e1] dark:bg-[#0D1C42] dark:text-[#FCF1D0] dark:border-[#22396F] hover:bg-[#e2e8f0] dark:hover:bg-[#22396F]"
              >
                <Brain className="h-3.5 w-3.5 mr-1.5 text-[#22396F] dark:text-[#FCF1D0]" />
                Powered by Google Gemini AI
              </Badge>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6 text-[#010736] dark:text-white"
            >
              Hire Smarter with{" "}
              <span className="text-[#22396F] dark:text-[#FCF1D0]">
                AI-Powered
              </span>{" "}
              Interviews
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-lg sm:text-xl text-[#475569] dark:text-[#cbd5e1] max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              InterviewIQ uses artificial intelligence to parse resumes, generate
              tailored interview questions, evaluate responses in real-time, and ensure
              interview integrity with automated proctoring.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button
                size="lg"
                asChild
                className="h-13 px-8 text-base bg-[#010736] text-[#FCF1D0] hover:bg-[#22396F] dark:bg-[#FCF1D0] dark:text-[#010736] dark:hover:bg-white font-semibold transition-all hover:scale-105 border-0 shadow-md"
              >
                <Link href="/signup">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="h-13 px-8 text-base border-[#cbd5e1] bg-white text-[#010736] hover:bg-[#f1f5f9] dark:border-[#22396F] dark:bg-[#0D1C42] dark:text-white dark:hover:bg-[#22396F] dark:hover:text-[#FCF1D0]"
              >
                <Link href="/jobs">Browse Jobs</Link>
              </Button>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="flex items-center justify-center gap-6 mt-10 text-sm text-[#475569] dark:text-[#cbd5e1]"
            >
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-[#22396F] dark:text-[#FCF1D0]" />
                Free to use
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-[#22396F] dark:text-[#FCF1D0]" />
                No credit card
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-[#22396F] dark:text-[#FCF1D0]" />
                Full proctoring
              </span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 sm:py-28 bg-[#f8fafc] dark:bg-[#0D1C42] border-b border-[#cbd5e1] dark:border-[#22396F]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold mb-4 text-[#010736] dark:text-white">
              Everything You Need for <span className="text-[#22396F] dark:text-[#FCF1D0]">Modern Hiring</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-[#475569] dark:text-[#cbd5e1] text-lg max-w-2xl mx-auto">
              From resume parsing to interview proctoring — we cover every step with cutting-edge AI.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature, i) => (
              <motion.div key={i} variants={fadeUp}>
                <Card className="h-full border-[#cbd5e1] dark:border-[#22396F] bg-white dark:bg-[#010736] hover:border-[#22396F] dark:hover:border-[#FCF1D0] transition-all duration-300 hover:-translate-y-1 group shadow-sm">
                  <CardContent className="p-6">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl mb-4 bg-[#f1f5f9] dark:bg-[#0D1C42] border border-[#cbd5e1] dark:border-[#22396F] text-[#22396F] dark:text-[#FCF1D0] transition-transform group-hover:scale-110">
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-[#010736] dark:text-white">{feature.title}</h3>
                    <p className="text-sm text-[#475569] dark:text-[#cbd5e1] leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 sm:py-28 bg-white dark:bg-[#010736] border-b border-[#cbd5e1] dark:border-[#22396F]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold mb-4 text-[#010736] dark:text-white">
              How It <span className="text-[#22396F] dark:text-[#FCF1D0]">Works</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-[#475569] dark:text-[#cbd5e1] text-lg">
              Three simple steps to transform your hiring workflow
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {steps.map((step, i) => (
              <motion.div key={i} variants={fadeUp} className="relative text-center p-6 rounded-2xl bg-[#f8fafc] dark:bg-[#0D1C42] border border-[#cbd5e1] dark:border-[#22396F]">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#010736] dark:bg-[#22396F] text-[#FCF1D0] text-2xl font-bold mb-6 border border-[#cbd5e1] dark:border-[#FCF1D0]/30 shadow-md">
                  {i + 1}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-[#010736] dark:text-white">{step.title}</h3>
                <p className="text-[#475569] dark:text-[#cbd5e1] leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-[#f8fafc] dark:bg-[#0D1C42] border-b border-[#cbd5e1] dark:border-[#22396F]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, i) => (
              <div key={i} className="p-4 rounded-xl bg-white dark:bg-[#010736] border border-[#cbd5e1] dark:border-[#22396F] shadow-sm">
                <div className="text-3xl sm:text-4xl font-bold mb-1 text-[#010736] dark:text-[#FCF1D0]">{stat.value}</div>
                <div className="text-sm text-[#475569] dark:text-[#cbd5e1]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 sm:py-28 bg-white dark:bg-[#010736] border-b border-[#cbd5e1] dark:border-[#22396F]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold mb-4 text-[#010736] dark:text-white">
              Trusted by <span className="text-[#22396F] dark:text-[#FCF1D0]">Recruiters & Candidates</span>
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {testimonials.map((t, i) => (
              <motion.div key={i} variants={fadeUp}>
                <Card className="h-full border-[#cbd5e1] dark:border-[#22396F] bg-[#f8fafc] dark:bg-[#0D1C42] shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className="h-4 w-4 fill-[#22396F] text-[#22396F] dark:fill-[#FCF1D0] dark:text-[#FCF1D0]" />
                      ))}
                    </div>
                    <p className="text-sm text-[#475569] dark:text-[#cbd5e1] mb-6 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-[#010736] dark:bg-[#22396F] text-[#FCF1D0] border border-[#cbd5e1] dark:border-[#22396F] flex items-center justify-center text-sm font-bold">
                        {t.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#010736] dark:text-white">{t.name}</p>
                        <p className="text-xs text-[#475569] dark:text-[#cbd5e1]">{t.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-28 bg-[#f8fafc] dark:bg-[#0D1C42]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-[#010736] dark:text-white">
              Ready to Upgrade Your <span className="text-[#22396F] dark:text-[#FCF1D0]">Hiring Workflow?</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-[#475569] dark:text-[#cbd5e1] mb-10 max-w-2xl mx-auto">
              Empower your recruitment team with objective, AI-evaluated candidate interviews.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="h-13 px-10 text-base bg-[#010736] text-[#FCF1D0] hover:bg-[#22396F] dark:bg-[#FCF1D0] dark:text-[#010736] dark:hover:bg-white font-semibold border-0 shadow-md">
                <Link href="/signup">
                  Start Hiring with AI
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="h-13 px-10 text-base border-[#cbd5e1] bg-white text-[#010736] hover:bg-[#f1f5f9] dark:border-[#22396F] dark:bg-[#010736] dark:text-white dark:hover:bg-[#22396F] dark:hover:text-[#FCF1D0]">
                <Link href="/jobs">I&apos;m a Candidate</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

const features = [
  {
    title: "AI Resume Parsing",
    description: "Upload a resume and our AI instantly extracts skills, experience, education, and calculates an objective match score.",
    icon: FileSearch,
  },
  {
    title: "Smart Question Generation",
    description: "AI generates role-specific interview questions tailored to each job posting with clear evaluation criteria.",
    icon: Brain,
  },
  {
    title: "Real-time Answer Evaluation",
    description: "Answers are analyzed instantly for technical depth, structured communication, and conceptual clarity.",
    icon: Zap,
  },
  {
    title: "Video Interviews with Proctoring",
    description: "Secure video interview experience with browser focus tracking, tab-switch monitoring, and full-screen enforcement.",
    icon: Video,
  },
  {
    title: "Anti-Cheating Security",
    description: "Comprehensive proctoring flags unauthorized activity, external tabs, copy-pasting, and background interruptions.",
    icon: Shield,
  },
  {
    title: "Resume-Job Matching",
    description: "Intelligent matching algorithm scores candidates against role requirements with actionable breakdowns.",
    icon: Users,
  },
];

const steps = [
  {
    title: "Upload & Parse Resume",
    description: "Candidates upload their resume. Our AI extracts core strengths and matches competencies against the job description.",
  },
  {
    title: "AI-Powered Interview",
    description: "Candidates complete an interactive video interview guided by role-specific AI questions and automated proctoring.",
  },
  {
    title: "Review Results & Hire",
    description: "Recruiters receive a comprehensive candidate report with scores, strengths, weaknesses, and hiring recommendations.",
  },
];

const stats = [
  { value: "10K+", label: "Interviews Conducted" },
  { value: "95%", label: "Accuracy Rate" },
  { value: "3x", label: "Faster Hiring" },
  { value: "500+", label: "Companies Trust Us" },
];

const testimonials = [
  { quote: "InterviewIQ cut our screening time by over half. The automated question generation and scoring are spot on.", name: "Sarah Chen", role: "HR Director, TechCorp" },
  { quote: "The security and proctoring reports provide total transparency. We can trust every assessment.", name: "Ahmed Rahman", role: "CTO, CloudScale" },
  { quote: "As a candidate, the interview was streamlined and frictionless. Immediate feedback gave me real confidence.", name: "Priya Sharma", role: "Software Engineer" },
];
