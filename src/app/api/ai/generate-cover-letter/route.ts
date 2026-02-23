import { NextRequest, NextResponse } from "next/server";
import { getAuthUserFromRequest } from "@/lib/auth/middleware";
import { generateCoverLetter } from "@/lib/gemini/coverLetterGenerator";
import { generateCoverLetterSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUserFromRequest(req);
    if (!authUser) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = generateCoverLetterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const result = await generateCoverLetter(parsed.data);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Generate cover letter error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate cover letter" },
      { status: 500 }
    );
  }
}
