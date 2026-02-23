import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Interview from "@/models/Interview";
import SecurityLog from "@/models/SecurityLog";
import { getAuthUserFromRequest } from "@/lib/auth/middleware";
import { logViolationSchema } from "@/lib/validations";
import { shouldTerminateInterview } from "@/lib/utils/securityScorer";
import { ISecurityLog } from "@/types";

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

    const body = await req.json();
    const parsed = logViolationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    await connectDB();

    const interview = await Interview.findById(id);
    if (!interview || interview.status !== "in_progress") {
      return NextResponse.json(
        { success: false, error: "Interview not found or not in progress" },
        { status: 404 }
      );
    }

    // Get existing violations
    const existingViolations = await SecurityLog.find({ interviewId: id });

    // Create new violation log
    const violation = await SecurityLog.create({
      interviewId: id,
      violationType: parsed.data.violationType,
      severity: parsed.data.severity,
      details: parsed.data.details,
      videoTimestamp: parsed.data.videoTimestamp,
      warningCount: existingViolations.length + 1,
    });

    // Update interview violation count
    interview.totalViolations = existingViolations.length + 1;
    interview.violationSummary = {
      ...((interview.violationSummary as Record<string, number>) || {}),
      [parsed.data.violationType]:
        ((interview.violationSummary as Record<string, number>)?.[parsed.data.violationType] || 0) + 1,
    };

    // Check if should terminate
    const allViolations = [...existingViolations, violation] as ISecurityLog[];
    const { shouldTerminate, reason } = shouldTerminateInterview(allViolations);

    if (shouldTerminate) {
      interview.status = "terminated";
      interview.terminatedReason = reason;
      interview.integrityVerified = false;
    }

    await interview.save();

    return NextResponse.json({
      success: true,
      data: {
        shouldTerminate,
        reason,
        violationCount: interview.totalViolations,
        maxViolations: 5,
      },
    });
  } catch (error) {
    console.error("Log violation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to log violation" },
      { status: 500 }
    );
  }
}

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

    const violations = await SecurityLog.find({ interviewId: id })
      .sort({ timestamp: 1 })
      .lean();

    return NextResponse.json({ success: true, data: violations });
  } catch (error) {
    console.error("Get violations error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch violations" },
      { status: 500 }
    );
  }
}
