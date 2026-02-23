import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Interview from "@/models/Interview";
import { getAuthUserFromRequest } from "@/lib/auth/middleware";

export async function POST(
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

    const interview = await Interview.findById(id);
    if (!interview) {
      return NextResponse.json({ success: false, error: "Interview not found" }, { status: 404 });
    }

    if (interview.status !== "scheduled" && interview.status !== "ready" && interview.status !== "in_progress") {
      return NextResponse.json(
        { success: false, error: "Interview cannot be started" },
        { status: 400 }
      );
    }

    // Only update status/startedAt if not already in progress
    if (interview.status !== "in_progress") {
      interview.status = "in_progress";
      interview.startedAt = new Date();
      await interview.save();
    }

    return NextResponse.json({
      success: true,
      data: {
        interviewId: interview._id,
        status: interview.status,
        firstQuestion: interview.questions[0],
        totalQuestions: interview.questions.length,
      },
    });
  } catch (error) {
    console.error("Start interview error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to start interview" },
      { status: 500 }
    );
  }
}
