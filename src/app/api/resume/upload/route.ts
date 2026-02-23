import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Candidate from "@/models/Candidate";
import { getAuthUserFromRequest } from "@/lib/auth/middleware";
import { extractTextFromBuffer, validateFileSize, validateFileType } from "@/lib/utils/fileParser";
import { parseResumeWithGemini } from "@/lib/gemini/resumeParser";

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUserFromRequest(req);
    if (!authUser) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("resume") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file uploaded" },
        { status: 400 }
      );
    }

    // Validate file
    if (!validateFileType(file.type)) {
      return NextResponse.json(
        { success: false, error: "Only PDF and DOCX files are accepted" },
        { status: 400 }
      );
    }

    if (!validateFileSize(file.size, 5)) {
      return NextResponse.json(
        { success: false, error: "File size must be under 5MB" },
        { status: 400 }
      );
    }

    // Extract text from file
    const buffer = Buffer.from(await file.arrayBuffer());
    const text = await extractTextFromBuffer(buffer, file.type);

    // Parse with Gemini AI
    const parsedData = await parseResumeWithGemini(text);

    // Save to database
    await connectDB();

    const candidate = await Candidate.findOneAndUpdate(
      { userId: authUser.userId },
      {
        userId: authUser.userId,
        parsedResume: parsedData,
        resumeQualityScore: parsedData.overallScore || 0,
        skills: parsedData.skills || [],
        linkedinUrl: parsedData.linkedinUrl,
        githubUrl: parsedData.githubUrl,
        portfolioUrl: parsedData.portfolioUrl,
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      data: {
        parsedData,
        candidateId: candidate._id,
      },
      message: "Resume uploaded and parsed successfully",
    });
  } catch (error) {
    console.error("Resume upload error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Failed to process resume" },
      { status: 500 }
    );
  }
}
