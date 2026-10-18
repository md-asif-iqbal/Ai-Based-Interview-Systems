import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { parseResumeWithGemini } from "@/lib/gemini/resumeParser";

export async function POST(req: Request) {
  try {
    // Lazy load pdf-parse to avoid module evaluation issues
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdf = require("pdf-parse/lib/pdf-parse.js") as (buffer: Buffer) => Promise<{ text: string; numpages: number; info: Record<string, string> }>;
    
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file uploaded" },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { success: false, error: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Extract text from PDF
    let pdfText = "";
    try {
      const pdfData = await pdf(buffer);
      pdfText = pdfData.text;
      console.log("[ResumeParser] PDF text extracted, character count:", pdfText.length);
    } catch (error) {
      console.error("PDF parsing error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to parse PDF text" },
        { status: 500 }
      );
    }

    if (!pdfText || pdfText.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "PDF appears to be empty or unreadable" },
        { status: 400 }
      );
    }

    // Parse resume using Gemini with multi-model fallback and heuristic backup
    const parsedData = await parseResumeWithGemini(pdfText);

    // Normalize output structure to satisfy both dashboard and public page
    const formattedResult: Record<string, unknown> = {
      ...parsedData,
      fullName: parsedData.name,
      experience: parsedData.experience.map((exp) => ({
        ...exp,
        position: exp.title,
        duration: exp.endDate ? `${exp.startDate} - ${exp.endDate}` : `${exp.startDate} - Present`,
      })),
      education: parsedData.education.map((edu) => ({
        ...edu,
        details: edu.field || edu.gpa || "",
      })),
    };

    // Save the uploaded file (optional - for reference)
    try {
      const uploadDir = path.join(process.cwd(), "public", "uploads", "resumes");
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
      }
      
      const timestamp = Date.now();
      const filename = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const filepath = path.join(uploadDir, filename);
      
      await writeFile(filepath, buffer);
      formattedResult.uploadedFile = `/uploads/resumes/${filename}`;
    } catch (saveError) {
      console.error("File save error (non-fatal):", saveError);
    }

    return NextResponse.json({
      success: true,
      data: formattedResult,
      message: "Resume parsed successfully",
    });

  } catch (error) {
    console.error("Resume parsing route error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Internal server error" 
      },
      { status: 500 }
    );
  }
}
