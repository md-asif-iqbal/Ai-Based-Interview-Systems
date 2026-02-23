import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Application from "@/models/Application";
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

    const application = await Application.findById(id)
      .populate({
        path: "jobId",
        populate: { path: "companyId" },
      })
      .populate("candidateId")
      .lean();

    if (!application) {
      return NextResponse.json({ success: false, error: "Application not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: application });
  } catch (error) {
    console.error("Get application error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch application" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authUser = await getAuthUserFromRequest(req);
    if (!authUser || (authUser.role !== "recruiter" && authUser.role !== "admin")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const { status } = await req.json();
    await connectDB();

    const validStatuses = [
      "applied", "screening", "interview_scheduled", "interviewed",
      "under_review", "offer", "rejected", "withdrawn",
    ];

    if (!validStatuses.includes(status)) {
      return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 });
    }

    const application = await Application.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!application) {
      return NextResponse.json({ success: false, error: "Application not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: application });
  } catch (error) {
    console.error("Update application error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update application" },
      { status: 500 }
    );
  }
}
