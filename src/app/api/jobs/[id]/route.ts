import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import JobPosting from "@/models/JobPosting";
import "@/models/Company"; // Register for populate
import { getAuthUserFromRequest } from "@/lib/auth/middleware";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();

    const job = await JobPosting.findById(id)
      .populate("companyId", "name logo location industry size website description")
      .lean();

    if (!job) {
      return NextResponse.json(
        { success: false, error: "Job not found" },
        { status: 404 }
      );
    }

    // Increment view count
    await JobPosting.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });

    return NextResponse.json({ success: true, data: job });
  } catch (error) {
    console.error("Get job error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch job" },
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

    await connectDB();
    const body = await req.json();

    const job = await JobPosting.findOneAndUpdate(
      { _id: id, createdBy: authUser.userId },
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!job) {
      return NextResponse.json(
        { success: false, error: "Job not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: job });
  } catch (error) {
    console.error("Update job error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update job" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authUser = await getAuthUserFromRequest(req);
    if (!authUser || (authUser.role !== "recruiter" && authUser.role !== "admin")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    await connectDB();

    const job = await JobPosting.findOneAndUpdate(
      { _id: id, createdBy: authUser.userId },
      { status: "deleted" },
      { new: true }
    );

    if (!job) {
      return NextResponse.json(
        { success: false, error: "Job not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Job deleted successfully" });
  } catch (error) {
    console.error("Delete job error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete job" },
      { status: 500 }
    );
  }
}
