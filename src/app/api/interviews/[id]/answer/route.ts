import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Interview from "@/models/Interview";
import { getAuthUserFromRequest } from "@/lib/auth/middleware";
import { submitAnswerSchema } from "@/lib/validations";

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
    const parsed = submitAnswerSchema.safeParse(body);

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

    const question = interview.questions[parsed.data.questionIndex];
    if (!question) {
      return NextResponse.json(
        { success: false, error: "Invalid question index" },
        { status: 400 }
      );
    }

    // Save answer WITHOUT evaluation — evaluation happens in batch at completion
    interview.answers.push({
      questionIndex: parsed.data.questionIndex,
      answerText: parsed.data.answerText,
      audioUrl: parsed.data.audioUrl,
      duration: parsed.data.duration,
      score: 0,
      submittedAt: new Date(),
    });

    await interview.save();

    // Check if there are more questions
    const nextIndex = parsed.data.questionIndex + 1;
    const hasNext = nextIndex < interview.questions.length;

    return NextResponse.json({
      success: true,
      data: {
        saved: true,
        isComplete: !hasNext,
        progress: {
          answered: interview.answers.length,
          total: interview.questions.length,
        },
      },
    });
  } catch (error) {
    console.error("Submit answer error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit answer" },
      { status: 500 }
    );
  }
}
