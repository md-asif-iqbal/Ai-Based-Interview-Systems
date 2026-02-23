import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Interview from "@/models/Interview";
import Application from "@/models/Application";
import JobPosting from "@/models/JobPosting";
import { getAuthUserFromRequest } from "@/lib/auth/middleware";
import { createInterviewSchema } from "@/lib/validations";
import { generateInterviewQuestions } from "@/lib/gemini/questionGenerator";

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUserFromRequest(req);
    if (!authUser) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    let interviews;
    if (authUser.role === "candidate") {
      // Get candidate profile first
      const Candidate = (await import("@/models/Candidate")).default;
      const candidateProfile = await Candidate.findOne({ userId: authUser.userId });
      
      if (!candidateProfile) {
        return NextResponse.json({ success: true, data: [] }, { status: 200 });
      }
      
      // Get candidate's interviews through their applications
      const applications = await Application.find({ candidateId: candidateProfile._id }).select("_id");
      const applicationIds = applications.map(app => app._id);
      
      interviews = await Interview.find({ applicationId: { $in: applicationIds } })
        .populate({
          path: "applicationId",
          populate: {
            path: "jobId",
            select: "title company location type"
          }
        })
        .sort({ scheduledAt: -1 });
    } else {
      // Recruiter/admin gets all interviews
      interviews = await Interview.find()
        .populate({
          path: "applicationId",
          populate: [
            { path: "jobId", select: "title company location type" },
            { 
              path: "candidateId", 
              select: "fullName email userId skills",
              populate: { path: "userId", select: "fullName email" }
            }
          ]
        })
        .sort({ scheduledAt: -1 });
    }

    return NextResponse.json({ success: true, data: interviews }, { status: 200 });
  } catch (error) {
    console.error("Get interviews error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch interviews" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUserFromRequest(req);
    if (!authUser || (authUser.role !== "recruiter" && authUser.role !== "admin")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = createInterviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    await connectDB();

    // Get application and job details
    const application = await Application.findById(parsed.data.applicationId).populate("jobId");
    if (!application) {
      return NextResponse.json({ success: false, error: "Application not found" }, { status: 404 });
    }

    const job = await JobPosting.findById(application.jobId);
    if (!job) {
      return NextResponse.json({ success: false, error: "Job not found" }, { status: 404 });
    }

    // Generate questions with AI
    const questions = await generateInterviewQuestions(
      `${job.title}\n${job.description}\nSkills: ${job.requirements?.skills?.join(", ")}`,
      10,
      parsed.data.interviewType
    );

    const interview = await Interview.create({
      applicationId: parsed.data.applicationId,
      interviewType: parsed.data.interviewType,
      scheduledAt: new Date(parsed.data.scheduledAt),
      mode: "ai_conducted",
      questions,
    });

    // Update application status
    await Application.findByIdAndUpdate(parsed.data.applicationId, {
      status: "interview_scheduled",
    });

    return NextResponse.json(
      { success: true, data: interview, message: "Interview scheduled" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create interview error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create interview" },
      { status: 500 }
    );
  }
}
