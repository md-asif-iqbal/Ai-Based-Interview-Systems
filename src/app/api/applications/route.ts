import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Application from "@/models/Application";
import Candidate from "@/models/Candidate";
import JobPosting from "@/models/JobPosting";
import Interview from "@/models/Interview";
import { getAuthUserFromRequest } from "@/lib/auth/middleware";
import { createApplicationSchema } from "@/lib/validations";
import { calculateResumeMatch } from "@/lib/utils/resumeMatcher";
import { generateInterviewQuestions, generateFallbackQuestions } from "@/lib/gemini/questionGenerator";

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
          console.log("[AI] Generating personalized questions for job:", job.title);
          questions = await generateInterviewQuestions({
            jobTitle: job.title,
            jobDescription: job.description || "",
            requiredSkills: job.requirements?.skills || [],
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            candidateResume: candidate.parsedResume as any,
            count: 8,
            type: "mixed",
          });
          console.log("[AI] Generated", questions.length, "questions tailored to candidate CV");
        } catch (aiError) {
          console.error("[AI] Question generation failed, using dynamic candidate fallback:", aiError);
          questions = generateFallbackQuestions({
            jobTitle: job.title,
            jobDescription: job.description || "",
            requiredSkills: job.requirements?.skills || [],
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            candidateResume: candidate.parsedResume as any,
            count: 8,
            type: "mixed",
          });
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
