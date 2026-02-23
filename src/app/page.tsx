"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Brain,
  Sparkles,
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
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-20 sm:py-28 lg:py-36">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-200 h-200 bg-linear-to-br from-primary/20 via-accent/10 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-100 h-100 bg-linear-to-tl from-accent/15 to-transparent rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div variants={fadeUp}>
              <Badge
                variant="secondary"
                className="mb-6 px-4 py-1.5 text-sm font-medium bg-primary/10 text-primary border-primary/20 hover:bg-primary/15"
              >
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                Powered by Google Gemini AI
              </Badge>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6"
            >
              Hire Smarter with{" "}
              <span className="bg-linear-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                AI-Powered
              </span>{" "}
              Interviews
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              NaaSMind uses artificial intelligence to parse resumes, generate
              interview questions, evaluate answers in real-time, and ensure
              interview integrity — all automatically.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button
                size="lg"
                asChild
                className="h-13 px-8 text-base bg-linear-to-r from-primary to-accent hover:opacity-90 shadow-xl shadow-primary/30 transition-all hover:shadow-primary/40 hover:scale-105"
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
                className="h-13 px-8 text-base border-border/60 hover:bg-muted"
              >
                <Link href="/jobs">Browse Jobs</Link>
              </Button>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="flex items-center justify-center gap-6 mt-10 text-sm text-muted-foreground"
            >
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-accent" />
                Free to use
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-accent" />
                No credit card
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-accent" />
                AI-powered
              </span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 sm:py-28 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold mb-4">
              Everything You Need for{" "}
              <span className="text-primary">Modern Hiring</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground text-lg max-w-2xl mx-auto">
              From resume parsing to interview proctoring — we&apos;ve got every step covered with cutting-edge AI.
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
                <Card className="h-full border-border/40 bg-card/50 backdrop-blur-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1 group">
                  <CardContent className="p-6">
                    <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl mb-4 ${feature.color} transition-transform group-hover:scale-110`}>
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold mb-4">
              How It <span className="text-primary">Works</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground text-lg">
              Three simple steps to transform your hiring process
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
              <motion.div key={i} variants={fadeUp} className="relative text-center">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-accent text-primary-foreground text-2xl font-bold mb-6 shadow-lg shadow-primary/25">
                  {i + 1}
                </div>
                {i < 2 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] border-t-2 border-dashed border-primary/30" />
                )}
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-linear-to-r from-primary to-accent text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, i) => (
              <div key={i}>
                <div className="text-3xl sm:text-4xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm opacity-80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 sm:py-28 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold mb-4">
              Loved by <span className="text-primary">Recruiters & Candidates</span>
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
                <Card className="h-full border-border/40">
                  <CardContent className="p-6">
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-linear-to-br from-primary to-accent flex items-center justify-center text-primary-foreground text-sm font-bold">
                        {t.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.role}</p>
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
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Ready to Transform Your <span className="text-primary">Hiring Process?</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
              Join thousands of companies using NaaSMind to find the best talent with AI-powered interviews.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="h-13 px-10 text-base bg-linear-to-r from-primary to-accent hover:opacity-90 shadow-xl shadow-primary/30">
                <Link href="/signup">
                  Start Hiring with AI
                  <Sparkles className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="h-13 px-10 text-base">
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
    description: "Upload a resume and our AI instantly extracts skills, experience, education, and provides a quality score.",
    icon: FileSearch,
    color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  },
  {
    title: "Smart Question Generation",
    description: "AI generates role-specific interview questions tailored to each job posting with expected answers.",
    icon: Brain,
    color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  },
  {
    title: "Real-time Answer Evaluation",
    description: "Answers are evaluated in real-time by AI for relevance, depth, clarity, and technical accuracy.",
    icon: Zap,
    color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  },
  {
    title: "Video Interviews with Proctoring",
    description: "Secure video interviews with face detection, tab-switch monitoring, and full-screen enforcement.",
    icon: Video,
    color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  },
  {
    title: "Anti-Cheating Security",
    description: "Comprehensive proctoring detects tab switches, multiple faces, copy-paste, and developer tools.",
    icon: Shield,
    color: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  },
  {
    title: "Resume-Job Matching",
    description: "Intelligent matching algorithm scores candidates against job requirements with detailed breakdown.",
    icon: Users,
    color: "bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400",
  },
];

const steps = [
  {
    title: "Upload & Parse Resume",
    description: "Candidates upload their resume. Our AI extracts all relevant information and scores the resume quality.",
  },
  {
    title: "AI-Powered Interview",
    description: "AI generates role-specific questions. Candidates answer via video with real-time proctoring and evaluation.",
  },
  {
    title: "Get Results & Hire",
    description: "Recruiters receive detailed reports with scores, strengths, weaknesses, and AI hiring recommendations.",
  },
];

const stats = [
  { value: "10K+", label: "Interviews Conducted" },
  { value: "95%", label: "Accuracy Rate" },
  { value: "3x", label: "Faster Hiring" },
  { value: "500+", label: "Companies Trust Us" },
];

const testimonials = [
  { quote: "SoftLanding cut our hiring time by 60%. The AI question generation is incredibly accurate and relevant.", name: "Sarah Chen", role: "HR Director, TechCorp" },
  { quote: "The proctoring system gave us confidence that interviews are fair. The security reports are very detailed.", name: "Ahmed Rahman", role: "CTO, StartupBD" },
  { quote: "As a candidate, the AI interview felt natural and fair. The instant feedback on my answers was amazing.", name: "Priya Sharma", role: "Software Engineer" },
];
