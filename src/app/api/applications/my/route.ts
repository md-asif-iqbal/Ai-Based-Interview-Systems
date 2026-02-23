import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Application from "@/models/Application";
import Candidate from "@/models/Candidate";
import "@/models/JobPosting"; // Register for populate
import "@/models/Company"; // Register for populate
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

    const applications = await Application.find({ candidateId: candidate._id })
      .populate({
        path: "jobId",
        populate: { path: "companyId", select: "name logo" },
      })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: applications });
  } catch (error) {
    console.error("Get my applications error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}
