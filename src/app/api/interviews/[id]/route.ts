import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Interview from "@/models/Interview";
import "@/models/Application"; // Register for populate
import "@/models/JobPosting"; // Register for populate
import "@/models/Company"; // Register for populate
import "@/models/Candidate"; // Register for populate
import { getAuthUserFromRequest } from "@/lib/auth/middleware";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authUser = await getAuthUserFromRequest(req);
    if (!authUser) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const interview = await Interview.findById(id)
      .populate({
        path: "applicationId",
        populate: [
          { path: "jobId", populate: { path: "companyId", select: "name logo" } },
          { path: "candidateId" },
        ],
      })
      .lean();

    if (!interview) {
      return NextResponse.json({ success: false, error: "Interview not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: interview });
  } catch (error) {
    console.error("Get interview error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch interview" },
      { status: 500 }
    );
  }
}
