import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Application from "@/models/Application";
import Candidate from "@/models/Candidate";
import JobPosting from "@/models/JobPosting";
import Company from "@/models/Company";
import Notification from "@/models/Notification";
import User from "@/models/User";
import { getAuthUserFromRequest } from "@/lib/auth/middleware";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authUser = await getAuthUserFromRequest(req);
    if (!authUser || (authUser.role !== "recruiter" && authUser.role !== "admin")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { scheduledAt, meetingLink, notes } = body;

    await connectDB();

    const application = await Application.findById(id)
      .populate({
        path: "jobId",
        select: "title companyId",
        populate: { path: "companyId", select: "name logo" },
      })
      .populate("candidateId");

    if (!application) {
      return NextResponse.json({ success: false, error: "Application not found" }, { status: 404 });
    }

    const recruiterUser = await User.findById(authUser.userId).select("fullName");
    const recruiterName = recruiterUser?.fullName || "Recruitment Team";

    // Prepare final interview data
    const finalInterviewData = {
      selectedForFinalRound: true,
      selectedAt: new Date(),
      recruiterId: authUser.userId,
      recruiterName,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      meetingLink: meetingLink || "",
      notes: notes || "Congratulations! You have been selected for the final interview round.",
    };

    const currentAppData = application.applicationData || {};
    application.status = "final_interview";
    application.applicationData = {
      ...currentAppData,
      selectedForFinalRound: true,
      finalInterview: finalInterviewData,
    };
    await application.save();

    // Fetch candidate's User ID to dispatch notification
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cand = application.candidateId as any;
    const candidateUserId = cand?.userId || cand?._id;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const job = application.jobId as any;
    const jobTitle = job?.title || "your applied position";
    const companyName = job?.companyId?.name || "the hiring team";

    if (candidateUserId) {
      try {
        await Notification.create({
          userId: candidateUserId,
          type: "final_interview_selected",
          title: "🎉 Selected for Final Interview!",
          message: `Congratulations! You have been selected for the final interview round for ${jobTitle} at ${companyName}.`,
          link: "/applications",
          read: false,
          data: {
            applicationId: application._id,
            jobTitle,
            companyName,
            finalInterview: finalInterviewData,
          },
        });
      } catch (notifErr) {
        console.error("Failed to create notification:", notifErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Candidate selected for final interview and notified successfully.",
      data: application,
    });
  } catch (error) {
    console.error("Select final interview error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to select candidate for final interview" },
      { status: 500 }
    );
  }
}
