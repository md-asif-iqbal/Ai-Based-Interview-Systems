import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Interview from "@/models/Interview";
import Application from "@/models/Application";
import "@/models/JobPosting";
import "@/models/Company";
import Candidate from "@/models/Candidate";
import { getAuthUserFromRequest } from "@/lib/auth/middleware";

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUserFromRequest(req);
    if (!authUser) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const candidate = await Candidate.findOne({ userId: authUser.userId });
    if (!candidate) {
      return NextResponse.json({ success: true, data: [] });
    }

    const applications = await Application.find({ candidateId: candidate._id }).select("_id");
    const applicationIds = applications.map((app) => app._id);

    const interviews = await Interview.find({ applicationId: { $in: applicationIds } })
      .populate({
        path: "applicationId",
        populate: {
          path: "jobId",
          select: "title location type",
          populate: { path: "companyId", select: "name logo" },
        },
      })
      .select(
        "_id applicationId status scheduledAt completedAt interviewType overallScore aiRecommendation detailedScores questions interviewType"
      )
      .sort({ scheduledAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: interviews });
  } catch (error) {
    console.error("Get my interviews error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch interviews" },
      { status: 500 }
    );
  }
}
