import { NextRequest, NextResponse } from "next/server";
import { getAuthUserFromRequest } from "@/lib/auth/middleware";
import { evaluateAnswer } from "@/lib/gemini/answerEvaluator";
import { evaluateAnswerSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUserFromRequest(req);
    if (!authUser) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = evaluateAnswerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const evaluation = await evaluateAnswer(
      parsed.data.question,
      parsed.data.answer,
      parsed.data.expectedKeywords,
      parsed.data.jobContext
    );

    return NextResponse.json({ success: true, data: evaluation });
  } catch (error) {
    console.error("Evaluate answer error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to evaluate answer" },
      { status: 500 }
    );
  }
}
