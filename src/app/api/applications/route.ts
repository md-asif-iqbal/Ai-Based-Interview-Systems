import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Application from "@/models/Application";
import Candidate from "@/models/Candidate";
import JobPosting from "@/models/JobPosting";
import Interview from "@/models/Interview";
import { getAuthUserFromRequest } from "@/lib/auth/middleware";
import { createApplicationSchema } from "@/lib/validations";
import { calculateResumeMatch } from "@/lib/utils/resumeMatcher";
import { generateInterviewQuestions } from "@/lib/gemini/questionGenerator";

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUserFromRequest(req);
    if (!authUser || authUser.role !== "candidate") {
      return NextResponse.json({ success: false, error: "Only candidates can apply" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = createApplicationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    await connectDB();

    // Check job exists
    const job = await JobPosting.findById(parsed.data.jobId);
    if (!job || job.status !== "active") {
      return NextResponse.json({ success: false, error: "Job not found or closed" }, { status: 404 });
    }

    // Get or create candidate profile
    let candidate = await Candidate.findOne({ userId: authUser.userId });
    if (!candidate) {
      candidate = await Candidate.create({ userId: authUser.userId, skills: [] });
    }

    // Check duplicate application
    const existing = await Application.findOne({
      jobId: parsed.data.jobId,
      candidateId: candidate._id,
    });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "Already applied to this job" },
        { status: 409 }
      );
    }

    // Calculate match score
    let matchScore = 0;
    if (candidate.parsedResume) {
      const match = calculateResumeMatch(candidate.parsedResume, {
        skills: job.requirements?.skills || [],
        experienceYears: job.requirements?.experienceYears || 0,
        education: job.requirements?.education || "",
      });
      matchScore = match.totalScore;
    }

    const application = await Application.create({
      jobId: parsed.data.jobId,
      candidateId: candidate._id,
      coverLetter: parsed.data.coverLetter,
      expectedSalary: parsed.data.expectedSalary,
      noticePeriod: parsed.data.noticePeriod,
      canStartFrom: parsed.data.canStartFrom,
      resumeMatchScore: matchScore,
    });

    // Increment application count
    await JobPosting.findByIdAndUpdate(parsed.data.jobId, {
      $inc: { applicationCount: 1 },
    });

    // AUTO-INTERVIEW: If resume match ≥ 50%, automatically create interview
    let interviewCreated = false;
    if (matchScore >= 50) {
      try {
        // Generate smart questions based on job + resume
        let questions: Array<{
          questionText: string;
          category: string;
          difficulty: string;
          expectedKeywords: string[];
          timeLimitSeconds?: number;
          timeLimit?: number;
          order: number;
        }> = [];

        try {
          const resumeSkills = (candidate.parsedResume as { skills?: string[] })?.skills?.join(", ") || "";
          const resumeExp = ((candidate.parsedResume as { experience?: Array<{ position?: string; company?: string }> })?.experience || [])
            .map((e) => `${e.position} at ${e.company}`).join(", ") || "";
          const jobDesc = [
            `Job Title: ${job.title}`,
            job.description ? `Description: ${job.description}` : "",
            job.requirements?.skills?.length ? `Required Skills: ${job.requirements.skills.join(", ")}` : "",
            resumeSkills ? `Candidate Skills: ${resumeSkills}` : "",
            resumeExp ? `Candidate Experience: ${resumeExp}` : "",
          ].filter(Boolean).join("\n");
          console.log("[AI] Generating questions for job:", job.title);
          questions = await generateInterviewQuestions(jobDesc, 8, "mixed");
          console.log("[AI] Generated", questions.length, "questions successfully");
        } catch (aiError) {
          // Log the actual error so we can debug
          console.error("[AI] Question generation failed, using fallback:", aiError);
          questions = [];
        }

        // If AI failed, use smart fallback questions
        if (questions.length === 0) {
          const skills = job.requirements?.skills || [];
          const skillStr = skills.slice(0, 3).join(", ") || "your technical skills";
          questions = [
            { questionText: `Please introduce yourself — tell me about your background, your skills, and what brings you to this interview today.`, category: "behavioral", difficulty: "easy", expectedKeywords: ["experience", "background", "skills", "motivation", "education"], order: 1 },
            { questionText: `Why are you interested in the ${job.title} position, and what makes you a good fit for this role?`, category: "behavioral", difficulty: "easy", expectedKeywords: ["interest", "fit", "passion", "goals", "value"], order: 2 },
            { questionText: `What experience do you have with ${skillStr}? Give specific examples from your recent work or projects.`, category: "technical", difficulty: "medium", expectedKeywords: skills.slice(0, 5).concat(["experience", "projects"]), order: 3 },
            { questionText: `Describe a technically challenging project you worked on. What was your approach and what did you learn?`, category: "technical", difficulty: "medium", expectedKeywords: ["challenge", "solution", "architecture", "learning", "result"], order: 4 },
            { questionText: `Tell me about a time when you had to work under a tight deadline. How did you prioritize and deliver?`, category: "behavioral", difficulty: "medium", expectedKeywords: ["deadline", "priority", "planning", "delivery", "team"], order: 5 },
            { questionText: `What's your approach to code quality and testing? How do you ensure your code is reliable and maintainable?`, category: "technical", difficulty: "medium", expectedKeywords: ["testing", "code review", "CI/CD", "unit tests", "quality", "maintainable"], order: 6 },
            { questionText: `If you joined our team and found the codebase was poorly documented with technical debt, what steps would you take?`, category: "situational", difficulty: "medium", expectedKeywords: ["documentation", "refactoring", "prioritization", "incremental", "communication"], order: 7 },
            { questionText: `Describe a situation where you disagreed with a team member on a technical decision. How did you handle it?`, category: "behavioral", difficulty: "medium", expectedKeywords: ["conflict", "communication", "resolution", "compromise", "teamwork"], order: 8 },
            { questionText: `How do you stay updated with new technologies and trends in your field? What have you learned recently?`, category: "behavioral", difficulty: "easy", expectedKeywords: ["learning", "courses", "blogs", "community", "practice", "growth"], order: 9 },
            { questionText: `Where do you see yourself in 3-5 years, and how does the ${job.title} role fit into your career goals?`, category: "behavioral", difficulty: "easy", expectedKeywords: ["goals", "growth", "career", "ambition", "development", "contribution"], order: 10 },
          ];
        }

        // Create interview document
        await Interview.create({
          applicationId: application._id,
          interviewType: "technical",
          scheduledAt: new Date(),
          mode: "ai_conducted",
          status: "ready",
          questions: questions.map((q, i) => ({
            questionText: q.questionText,
            question: q.questionText,
            category: q.category,
            difficulty: q.difficulty,
            expectedKeywords: q.expectedKeywords || [],
            timeLimit: 50,
            timeLimitSeconds: 50,
            order: q.order || i + 1,
          })),
          answers: [],
          totalViolations: 0,
        });

        // Update application status
        application.status = "interview_scheduled";
        await application.save();
        interviewCreated = true;
      } catch (interviewErr) {
        console.error("Auto-interview creation failed:", interviewErr);
        // Non-blocking — application still created successfully
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: application,
        interviewScheduled: interviewCreated,
        message: interviewCreated
          ? `Application submitted! Resume match: ${matchScore}%. AI Interview has been automatically scheduled.`
          : "Application submitted successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Application error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit application" },
      { status: 500 }
    );
  }
}
