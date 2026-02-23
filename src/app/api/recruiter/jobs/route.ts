import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import JobPosting from "@/models/JobPosting";
import Company from "@/models/Company";
import { getAuthUserFromRequest } from "@/lib/auth/middleware";

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUserFromRequest(req);
    if (!authUser) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Find the company owned by this recruiter
    const company = await Company.findOne({ ownerId: authUser.userId });
    if (!company) {
      return NextResponse.json({ success: true, data: [] });
    }

    const jobs = await JobPosting.find({ companyId: company._id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: jobs });
  } catch (error) {
    console.error("Get recruiter jobs error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}
