import { NextRequest, NextResponse } from "next/server";
import { getAuthUserFromRequest } from "@/lib/auth/middleware";
import { generateInterviewQuestions } from "@/lib/gemini/questionGenerator";
import { generateQuestionsSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUserFromRequest(req);
    if (!authUser) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = generateQuestionsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const questions = await generateInterviewQuestions(
      parsed.data.jobDescription,
      parsed.data.count,
      parsed.data.interviewType
    );

    return NextResponse.json({ success: true, data: questions });
  } catch (error) {
    console.error("Generate questions error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate questions" },
      { status: 500 }
    );
  }
}
