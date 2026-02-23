import { config } from "dotenv";
import { resolve } from "path";

// Load .env.local file
config({ path: resolve(__dirname, "../.env.local") });

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../src/models/User";
import Company from "../src/models/Company";
import Candidate from "../src/models/Candidate";
import JobPosting from "../src/models/JobPosting";
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

    // Create Users
    console.log("Creating users...");
    // Use plain password - User model will hash it in pre-save hook
    const plainPassword = "password123";

    const recruiter1 = await User.create({
      fullName: "John Recruiter",
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
      description: "Leading technology solutions provider specializing in enterprise software and cloud services.",
      industry: "Technology",
      website: "https://techcorp.example.com",
      logo: "https://placehold.co/400x400/cyan/white?text=TechCorp",
      size: "201-500",
      location: "San Francisco, CA",
      ownerId: recruiter1._id,
    });

    const company2 = await Company.create({
      name: "Innovate Labs",
      description: "Cutting-edge AI and machine learning research company building the future of technology.",
      industry: "Artificial Intelligence",
      website: "https://innovatelabs.example.com",
      logo: "https://placehold.co/400x400/purple/white?text=Innovate",
      size: "51-200",
      location: "New York, NY",
      ownerId: recruiter2._id,
    });

    const company3 = await Company.create({
      name: "CloudScale Inc",
      description: "Cloud infrastructure and DevOps solutions for modern enterprises.",
      industry: "Cloud Computing",
      website: "https://cloudscale.example.com",
      logo: "https://placehold.co/400x400/teal/white?text=CloudScale",
      size: "11-50",
      location: "Austin, TX",
      ownerId: recruiter1._id,
    });

    // Create Job Postings
    console.log("Creating job postings...");
    await JobPosting.create({
      companyId: company1._id,
      recruiterId: recruiter1._id,
      createdBy: recruiter1._id,
      title: "Senior Full Stack Developer",
      description: `We are seeking an experienced Full Stack Developer to join our growing team. You will be responsible for designing, developing, and maintaining scalable web applications.

Key Responsibilities:
- Design and develop robust, scalable web applications
- Work with React, Node.js, and MongoDB
- Collaborate with cross-functional teams
- Participate in code reviews and mentoring junior developers
- Implement best practices for testing and deployment

What We Offer:
- Competitive salary and equity
- Health, dental, and vision insurance
- Flexible work schedule and remote options
- Professional development opportunities`,
      requirements: [
        "5+ years of experience in full-stack development",
        "Strong proficiency in React, Node.js, TypeScript",
        "Experience with MongoDB or other NoSQL databases",
        "Knowledge of AWS/Azure cloud platforms",
        "Excellent problem-solving and communication skills",
      ],
      skills: [
        "React",
        "Node.js",
        "TypeScript",
        "MongoDB",
        "AWS",
        "Docker",
        "GraphQL",
        "REST APIs",
      ],
      experienceLevel: "senior",
      jobType: "full-time",
      location: "San Francisco, CA",
      workMode: "hybrid",
      salaryRange: { min: 120000, max: 180000, currency: "USD" },
      benefits: [
        "Health Insurance",
        "401(k) Matching",
        "Remote Work",
        "Unlimited PTO",
        "Learning Budget",
      ],
      applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      status: "active",
    });

    await JobPosting.create({
      companyId: company2._id,
      recruiterId: recruiter2._id,
      createdBy: recruiter2._id,
      title: "Machine Learning Engineer",
      description: `Join our AI team to build cutting-edge machine learning models and systems. You will work on exciting projects involving NLP, computer vision, and recommendation systems.

Key Responsibilities:
- Design and implement ML models and pipelines
- Work with large-scale datasets
- Deploy models to production environments
- Collaborate with research team on new algorithms
- Optimize model performance and scalability

What We Offer:
- Work on state-of-the-art AI projects
- Access to powerful compute resources
- Publication opportunities
- Conference attendance budget`,
      requirements: [
        "MS/PhD in Computer Science, ML, or related field",
        "3+ years of experience in ML engineering",
        "Strong Python and TensorFlow/PyTorch skills",
        "Experience with NLP or Computer Vision",
        "Knowledge of MLOps and model deployment",
      ],
      skills: [
        "Python",
        "TensorFlow",
        "PyTorch",
        "NLP",
        "Computer Vision",
        "Kubernetes",
        "MLflow",
        "SQL",
      ],
      experienceLevel: "mid",
      jobType: "full-time",
      location: "New York, NY",
      workMode: "remote",
      salaryRange: { min: 140000, max: 200000, currency: "USD" },
      benefits: [
        "Health Insurance",
        "Stock Options",
        "Remote First",
        "Learning Budget",
        "Conference Budget",
      ],
      applicationDeadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      status: "active",
    });

    await JobPosting.create({
      companyId: company3._id,
      recruiterId: recruiter1._id,
      createdBy: recruiter1._id,
      title: "DevOps Engineer",
      description: `We're looking for a talented DevOps Engineer to help us build and maintain our cloud infrastructure. You'll work with modern tools and technologies to ensure reliable, scalable systems.

Key Responsibilities:
- Design and manage cloud infrastructure (AWS/GCP)
- Implement CI/CD pipelines
- Monitor system performance and reliability
- Automate deployment processes
- Collaborate with development teams

What We Offer:
- Work with latest DevOps tools
- Flexible work environment
- Growth opportunities
- Supportive team culture`,
      requirements: [
        "3+ years of DevOps experience",
        "Strong knowledge of AWS or GCP",
        "Experience with Kubernetes and Docker",
        "Proficiency in scripting (Python, Bash)",
        "Understanding of networking and security",
      ],
      skills: [
        "AWS",
        "Kubernetes",
        "Docker",
        "Terraform",
        "Jenkins",
        "Python",
        "Bash",
        "Monitoring",
      ],
      experienceLevel: "mid",
      jobType: "full-time",
      location: "Austin, TX",
      workMode: "hybrid",
      salaryRange: { min: 100000, max: 150000, currency: "USD" },
      benefits: [
        "Health Insurance",
        "401(k)",
        "Flexible Hours",
        "Remote Options",
        "Training Budget",
      ],
      applicationDeadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      status: "active",
    });

    await JobPosting.create({
      companyId: company1._id,
      recruiterId: recruiter1._id,
      createdBy: recruiter1._id,
      title: "Frontend Developer (React)",
      description: `Join our frontend team to build beautiful, performant user interfaces. You'll work on our flagship products used by thousands of users daily.

Key Responsibilities:
- Develop responsive web applications with React
- Implement pixel-perfect designs
- Optimize application performance
- Write clean, maintainable code
- Collaborate with designers and backend team

What We Offer:
- Modern tech stack
- Creative freedom
- Collaborative environment
- Career growth opportunities`,
      requirements: [
        "2+ years of React development experience",
        "Strong JavaScript/TypeScript skills",
        "Experience with state management (Redux/Zustand)",
        "Knowledge of CSS and styling frameworks",
        "Understanding of web performance optimization",
      ],
      skills: [
        "React",
        "TypeScript",
        "CSS",
        "Tailwind CSS",
        "Redux",
        "Next.js",
        "Jest",
        "Git",
      ],
      experienceLevel: "junior",
      jobType: "full-time",
      location: "San Francisco, CA",
      workMode: "on-site",
      salaryRange: { min: 80000, max: 120000, currency: "USD" },
      benefits: [
        "Health Insurance",
        "Snacks & Meals",
        "Gym Membership",
        "Learning Budget",
      ],
      applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: "active",
    });

    await JobPosting.create({
      companyId: company2._id,
      recruiterId: recruiter2._id,
      createdBy: recruiter2._id,
      title: "Data Scientist",
      description: `We're seeking a Data Scientist to extract insights from large datasets and build predictive models that drive business decisions.

Key Responsibilities:
- Analyze complex datasets
- Build predictive and statistical models
- Create data visualizations and reports
- Work with product team on feature development
- Communicate findings to stakeholders

What We Offer:
- Access to interesting datasets
- Modern data stack
- Collaborative research environment
- Impact on product direction`,
      requirements: [
        "MS in Statistics, Data Science, or related field",
        "2+ years of data science experience",
        "Strong Python and SQL skills",
        "Experience with statistical modeling",
        "Excellent communication skills",
      ],
      skills: [
        "Python",
        "SQL",
        "Pandas",
        "Scikit-learn",
        "Statistics",
        "Tableau",
        "R",
        "Jupyter",
      ],
      experienceLevel: "mid",
      jobType: "full-time",
      location: "New York, NY",
      workMode: "hybrid",
      salaryRange: { min: 110000, max: 160000, currency: "USD" },
      benefits: [
        "Health Insurance",
        "Stock Options",
        "Flexible Schedule",
        "Conference Budget",
      ],
      applicationDeadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      status: "active",
    });

    // Create Candidate Profiles
    console.log("Creating candidate profiles...");
    await Candidate.create({
      userId: candidate1._id,
      resumeUrl: "/uploads/resumes/alice-developer-resume.pdf",
      skills: ["React", "Node.js", "TypeScript", "MongoDB", "AWS"],
      experience: [
        {
          title: "Senior Software Engineer",
          company: "Tech Startup Inc",
          startDate: new Date("2021-01-01"),
          endDate: new Date("2024-01-01"),
          description: "Led development of core platform features",
          current: false,
        },
        {
          title: "Software Engineer",
          company: "Digital Agency",
          startDate: new Date("2019-01-01"),
          endDate: new Date("2020-12-31"),
          description: "Built client web applications",
          current: false,
        },
      ],
      education: [
        {
          degree: "Bachelor of Science",
          field: "Computer Science",
          institution: "University of California, Berkeley",
          startDate: new Date("2015-09-01"),
          endDate: new Date("2019-05-31"),
          gpa: 3.7,
        },
      ],
      certifications: [
        {
          name: "AWS Solutions Architect",
          issuer: "Amazon Web Services",
          issueDate: new Date("2022-06-01"),
        },
      ],
    });

    await Candidate.create({
      userId: candidate2._id,
      skills: ["Python", "TensorFlow", "Machine Learning", "Data Science"],
      experience: [
        {
          title: "ML Engineer",
          company: "AI Solutions Corp",
          startDate: new Date("2020-03-01"),
          current: true,
          description: "Developing ML models for production",
        },
      ],
      education: [
        {
          degree: "Master of Science",
          field: "Machine Learning",
          institution: "Stanford University",
          startDate: new Date("2018-09-01"),
          endDate: new Date("2020-06-30"),
          gpa: 3.9,
        },
      ],
    });

    console.log("✅ Database seeded successfully!");
    console.log("\nDemo Credentials:");
    console.log("Recruiter: recruiter@example.com / password123");
    console.log("Candidate: candidate@example.com / password123");

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
