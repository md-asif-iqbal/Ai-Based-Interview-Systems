import { config } from "dotenv";
import { resolve } from "path";

// Load .env.local file
config({ path: resolve(__dirname, "../.env.local") });

import mongoose from "mongoose";
import User from "../src/models/User";
import Company from "../src/models/Company";
import Candidate from "../src/models/Candidate";
import JobPosting from "../src/models/JobPosting";
import Application from "../src/models/Application";
import Interview from "../src/models/Interview";
import Notification from "../src/models/Notification";
import connectToDatabase from "../src/lib/db/mongodb";

async function seedDatabase() {
  try {
    await connectToDatabase();

    // Clear existing data
    console.log("Clearing existing data...");
    await User.deleteMany({});
    await Company.deleteMany({});
    await Candidate.deleteMany({});
    await JobPosting.deleteMany({});
    await Application.deleteMany({});
    await Interview.deleteMany({});
    await Notification.deleteMany({});

    // Create Users
    console.log("Creating users...");
    const plainPassword = "password123";

    const recruiter1 = await User.create({
      fullName: "Alex Rivera",
      email: "recruiter@example.com",
      password: plainPassword,
      role: "recruiter",
      isEmailVerified: true,
    });

    const recruiter2 = await User.create({
      fullName: "Sarah Johnson",
      email: "sarah.j@techcorp.com",
      password: plainPassword,
      role: "recruiter",
      isEmailVerified: true,
    });

    const candidate1 = await User.create({
      fullName: "Alice Developer",
      email: "candidate@example.com",
      password: plainPassword,
      role: "candidate",
      isEmailVerified: true,
    });

    const candidate2 = await User.create({
      fullName: "Bob Engineer",
      email: "bob.e@email.com",
      password: plainPassword,
      role: "candidate",
      isEmailVerified: true,
    });

    const candidate3 = await User.create({
      fullName: "Carol Martinez",
      email: "carol.m@email.com",
      password: plainPassword,
      role: "candidate",
      isEmailVerified: true,
    });

    // Create Companies
    console.log("Creating companies...");
    const company1 = await Company.create({
      name: "TechCorp Solutions",
      description: "Leading enterprise cloud and software architecture provider delivering mission-critical applications.",
      industry: "Technology",
      website: "https://techcorp.example.com",
      size: "201-500",
      location: "San Francisco, CA",
      ownerId: recruiter1._id,
    });

    const company2 = await Company.create({
      name: "Innovate AI Labs",
      description: "Cutting-edge artificial intelligence and LLM intelligence platform.",
      industry: "Artificial Intelligence",
      website: "https://innovatelabs.example.com",
      size: "51-200",
      location: "New York, NY",
      ownerId: recruiter2._id,
    });

    const company3 = await Company.create({
      name: "CloudScale Systems",
      description: "High-performance DevOps, Kubernetes infrastructure, and observability tooling.",
      industry: "Cloud Computing",
      website: "https://cloudscale.example.com",
      size: "11-50",
      location: "Austin, TX",
      ownerId: recruiter1._id,
    });

    // Create Job Postings
    console.log("Creating job postings...");
    const job1 = await JobPosting.create({
      companyId: company1._id,
      recruiterId: recruiter1._id,
      createdBy: recruiter1._id,
      title: "Senior Full Stack Developer",
      description: `We are seeking an experienced Senior Full Stack Developer to build robust, scalable applications with React, Next.js, Node.js, and MongoDB.

Key Responsibilities:
- Architect and develop high-throughput web systems
- Build responsive user interfaces with Next.js and Tailwind CSS
- Integrate MongoDB data layers and REST/GraphQL APIs
- Collaborate with AI evaluation systems and microservices
- Mentor engineers and drive code quality

What We Offer:
- Competitive compensation and equity package
- Comprehensive health, dental, and life coverage
- Remote-first flexible working environment
- Generous annual learning and conference budget`,
      requirements: [
        "5+ years of software engineering experience",
        "Deep expertise in React, Next.js, and Node.js",
        "Hands-on experience with MongoDB and schema design",
        "Familiarity with containerization and cloud deployments",
      ],
      skills: ["React", "Node.js", "TypeScript", "Next.js", "MongoDB", "Docker", "Tailwind CSS"],
      experienceLevel: "senior",
      jobType: "full-time",
      location: "San Francisco, CA",
      workMode: "remote",
      salaryRange: { min: 140000, max: 185000, currency: "USD" },
      benefits: ["Health Insurance", "Remote Work", "401(k) Match", "Unlimited PTO"],
      applicationDeadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      status: "active",
      applicationCount: 3,
      interviewCount: 1,
    });

    const job2 = await JobPosting.create({
      companyId: company2._id,
      recruiterId: recruiter2._id,
      createdBy: recruiter2._id,
      title: "Machine Learning Engineer",
      description: `Join our AI research team developing next-generation multimodal models and intelligent evaluation agents.

Key Responsibilities:
- Design, train, and deploy machine learning models
- Build low-latency inference pipelines for NLP and voice evaluation
- Optimize vector embeddings and retrieval augmented generation
- Benchmark model performance against human evaluations

Requirements:
- MS or PhD in Computer Science, AI, or equivalent practical experience
- 3+ years experience in Python, PyTorch, and NLP
- Experience deploying ML models on Kubernetes and cloud infrastructure`,
      requirements: [
        "3+ years experience with PyTorch and Python",
        "Strong understanding of NLP and transformer architectures",
        "Experience building production inference pipelines",
      ],
      skills: ["Python", "PyTorch", "NLP", "Machine Learning", "Kubernetes", "FastAPI"],
      experienceLevel: "mid",
      jobType: "full-time",
      location: "New York, NY",
      workMode: "hybrid",
      salaryRange: { min: 150000, max: 210000, currency: "USD" },
      benefits: ["Health Insurance", "Stock Options", "Learning Stipend", "Equipment Budget"],
      applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: "active",
      applicationCount: 2,
      interviewCount: 1,
    });

    const job3 = await JobPosting.create({
      companyId: company3._id,
      recruiterId: recruiter1._id,
      createdBy: recruiter1._id,
      title: "DevOps & Cloud Engineer",
      description: `Lead our cloud infrastructure automation, CI/CD pipelines, and observability stack across multi-region deployments.`,
      requirements: [
        "3+ years managing AWS or GCP cloud environments",
        "Proficiency in Terraform, Docker, and Kubernetes",
        "Solid shell scripting and automation skills",
      ],
      skills: ["AWS", "Docker", "Kubernetes", "Terraform", "CI/CD", "Linux"],
      experienceLevel: "mid",
      jobType: "full-time",
      location: "Austin, TX",
      workMode: "remote",
      salaryRange: { min: 125000, max: 165000, currency: "USD" },
      benefits: ["Health Coverage", "Flexible Schedule", "Home Office Setup"],
      applicationDeadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      status: "active",
      applicationCount: 1,
      interviewCount: 0,
    });

    const job4 = await JobPosting.create({
      companyId: company1._id,
      recruiterId: recruiter1._id,
      createdBy: recruiter1._id,
      title: "Frontend Engineer (React / Next.js)",
      description: `Create beautiful, ultra-fast web experiences for our AI interview platform using React 19, TypeScript, and Tailwind CSS.`,
      requirements: [
        "2+ years of dedicated React / Next.js experience",
        "Strong CSS skills, accessibility best practices, and responsive design",
        "State management with Zustand and clean component architectures",
      ],
      skills: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Zustand"],
      experienceLevel: "junior",
      jobType: "full-time",
      location: "San Francisco, CA",
      workMode: "hybrid",
      salaryRange: { min: 85000, max: 120000, currency: "USD" },
      benefits: ["Health Insurance", "Commuter Benefits", "Mentorship Program"],
      applicationDeadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
      status: "active",
      applicationCount: 4,
      interviewCount: 1,
    });

    // Create Candidates
    console.log("Creating candidate profiles...");
    const cand1Profile = await Candidate.create({
      userId: candidate1._id,
      resumeUrl: "/uploads/resumes/alice-developer.pdf",
      skills: ["React", "Next.js", "TypeScript", "Node.js", "MongoDB", "Tailwind CSS"],
      experience: [
        {
          title: "Senior Full Stack Engineer",
          company: "Nexus Digital Systems",
          startDate: new Date("2021-03-01"),
          current: true,
          description: "Built scalable enterprise React and Node.js microservices.",
        },
        {
          title: "Frontend Developer",
          company: "Webcraft Studio",
          startDate: new Date("2019-01-01"),
          endDate: new Date("2021-02-28"),
          description: "Developed modern web apps and dynamic user dashboards.",
          current: false,
        },
      ],
      education: [
        {
          degree: "Bachelor of Science",
          field: "Computer Science",
          institution: "University of California, Berkeley",
          startDate: new Date("2015-09-01"),
          endDate: new Date("2019-05-30"),
          gpa: 3.85,
        },
      ],
      certifications: [
        {
          name: "AWS Certified Developer",
          issuer: "Amazon Web Services",
          issueDate: new Date("2022-04-15"),
        },
      ],
    });

    const cand2Profile = await Candidate.create({
      userId: candidate2._id,
      skills: ["Python", "PyTorch", "NLP", "Machine Learning", "FastAPI"],
      experience: [
        {
          title: "Machine Learning Researcher",
          company: "AI Core Labs",
          startDate: new Date("2020-06-01"),
          current: true,
          description: "Developing language model fine-tuning pipelines.",
        },
      ],
      education: [
        {
          degree: "Master of Science",
          field: "Artificial Intelligence",
          institution: "Stanford University",
          startDate: new Date("2018-09-01"),
          endDate: new Date("2020-05-30"),
          gpa: 3.92,
        },
      ],
    });

    // Create Applications
    console.log("Creating applications...");
    const app1 = await Application.create({
      jobId: job1._id,
      candidateId: cand1Profile._id,
      status: "interviewed",
      resumeMatchScore: 92,
      coverLetter: "I am passionate about building scalable full-stack applications with React and MongoDB.",
      expectedSalary: 160000,
      appliedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    });

    const app2 = await Application.create({
      jobId: job4._id,
      candidateId: cand1Profile._id,
      status: "interview_scheduled",
      resumeMatchScore: 89,
      coverLetter: "Excited about modern UI engineering and AI integration.",
      expectedSalary: 110000,
      appliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    });

    const app3 = await Application.create({
      jobId: job2._id,
      candidateId: cand2Profile._id,
      status: "interviewed",
      resumeMatchScore: 95,
      coverLetter: "Passionate about NLP, model evaluation, and high-performance inference.",
      expectedSalary: 180000,
      appliedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    });

    // Create Interviews
    console.log("Creating interviews...");
    // 1. Completed interview for Alice Developer (Senior Full Stack)
    await Interview.create({
      applicationId: app1._id,
      interviewType: "technical",
      mode: "ai_conducted",
      scheduledAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      startedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 25 * 60 * 1000),
      durationSeconds: 1500,
      status: "completed",
      overallScore: 88,
      detailedScores: {
        technical: 90,
        communication: 86,
        problemSolving: 88,
        confidence: 87,
      },
      strengths: [
        "In-depth knowledge of React component lifecycle and server components",
        "Strong understanding of MongoDB indexing and aggregation queries",
        "Clear and structured communication style",
      ],
      weaknesses: [
        "Could elaborate more on microservice caching patterns",
      ],
      aiRecommendation: "strong_hire",
      securityScore: 98,
      totalViolations: 0,
      faceVisibilityPercentage: 99,
      integrityVerified: true,
      questions: [
        {
          questionText: "How do React Server Components differ from traditional Client Components in Next.js?",
          question: "How do React Server Components differ from traditional Client Components in Next.js?",
          category: "technical",
          difficulty: "medium",
          timeLimitSeconds: 60,
          order: 1,
        },
        {
          questionText: "Explain how MongoDB compound indexes optimize complex query performance.",
          question: "Explain how MongoDB compound indexes optimize complex query performance.",
          category: "technical",
          difficulty: "hard",
          timeLimitSeconds: 60,
          order: 2,
        },
        {
          questionText: "Describe a challenging bug you debugged in production and how you resolved it.",
          question: "Describe a challenging bug you debugged in production and how you resolved it.",
          category: "behavioral",
          difficulty: "medium",
          timeLimitSeconds: 60,
          order: 3,
        },
      ],
      answers: [
        {
          questionIndex: 0,
          answerText: "React Server Components execute entirely on the server and render HTML with zero client-side JavaScript bundle overhead, whereas client components allow client interactivity and hooks.",
          score: 92,
          duration: 48,
        },
        {
          questionIndex: 1,
          answerText: "Compound indexes follow the Equality, Sort, Range rule to allow MongoDB to satisfy multi-key lookups without scanning entire collections.",
          score: 88,
          duration: 52,
        },
        {
          questionIndex: 2,
          answerText: "Identified a memory leak caused by uncleaned event listeners in a WebSocket connection by analyzing heap snapshots, then encapsulated cleanup in useEffect return functions.",
          score: 84,
          duration: 55,
        },
      ],
    });

    // 2. Scheduled/Ready interview for Alice Developer (Frontend Engineer)
    await Interview.create({
      applicationId: app2._id,
      interviewType: "technical",
      mode: "ai_conducted",
      scheduledAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      status: "scheduled",
      overallScore: 0,
      questions: [
        {
          questionText: "What are the core advantages of Tailwind CSS v4's modern CSS engine?",
          question: "What are the core advantages of Tailwind CSS v4's modern CSS engine?",
          category: "technical",
          difficulty: "medium",
          timeLimitSeconds: 60,
          order: 1,
        },
        {
          questionText: "How do you manage client-side state efficiently with Zustand in a large Next.js app?",
          question: "How do you manage client-side state efficiently with Zustand in a large Next.js app?",
          category: "technical",
          difficulty: "medium",
          timeLimitSeconds: 60,
          order: 2,
        },
      ],
    });

    // 3. Completed interview for Bob Engineer (ML Engineer)
    await Interview.create({
      applicationId: app3._id,
      interviewType: "technical",
      mode: "ai_conducted",
      scheduledAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 20 * 60 * 1000),
      durationSeconds: 1200,
      status: "completed",
      overallScore: 92,
      detailedScores: {
        technical: 95,
        communication: 88,
        problemSolving: 94,
        confidence: 90,
      },
      strengths: ["Exceptional PyTorch and transformer knowledge", "Strong systems thinking for distributed inference"],
      aiRecommendation: "strong_hire",
      securityScore: 100,
      totalViolations: 0,
      faceVisibilityPercentage: 100,
      integrityVerified: true,
      questions: [
        {
          questionText: "Describe the trade-offs between Quantization (e.g. INT8/FP4) and model pruning.",
          question: "Describe the trade-offs between Quantization (e.g. INT8/FP4) and model pruning.",
          category: "technical",
          difficulty: "hard",
          timeLimitSeconds: 60,
          order: 1,
        },
      ],
      answers: [
        {
          questionIndex: 0,
          answerText: "Quantization reduces memory footprint and increases throughput by reducing weight precision, while pruning removes redundant weights entirely.",
          score: 92,
          duration: 50,
        },
      ],
    });

    // Create Notifications
    console.log("Creating notifications...");
    await Notification.create({
      userId: candidate1._id,
      type: "interview_completed",
      title: "Interview Evaluated",
      message: "Your AI technical interview for Senior Full Stack Developer has been scored: 88%. Strong Hire recommendation!",
      read: false,
      link: "/dashboard",
    });

    await Notification.create({
      userId: candidate1._id,
      type: "interview_scheduled",
      title: "Upcoming AI Interview",
      message: "Your interview for Frontend Engineer (React / Next.js) is scheduled and ready to begin.",
      read: false,
      link: "/interviews",
    });

    await Notification.create({
      userId: recruiter1._id,
      type: "application_received",
      title: "New Top Candidate Application",
      message: "Alice Developer applied for Senior Full Stack Developer with 92% resume match.",
      read: false,
      link: "/recruiter/dashboard",
    });

    console.log("✅ Database seeded successfully with complete real-world data!");
    console.log("\nDemo Credentials:");
    console.log("• Recruiter: recruiter@example.com / password123");
    console.log("• Candidate: candidate@example.com / password123");

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
