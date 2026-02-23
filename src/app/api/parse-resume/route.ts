import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

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
      console.log("📄 PDF text extracted:", pdfText.substring(0, 200) + "...");
    } catch (error) {
      console.error("PDF parsing error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to parse PDF" },
        { status: 500 }
      );
    }

    if (!pdfText || pdfText.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "PDF appears to be empty or unreadable" },
        { status: 400 }
      );
    }

    // Use Gemini AI to parse the resume
    const model = genAI.getGenerativeModel({ 
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash" 
    });

    const prompt = `
You are an expert resume parser. Extract ALL information from this resume text and return it as a complete JSON object. Extract EVERY detail you find.

Resume Text:
${pdfText}

IMPORTANT INSTRUCTIONS:
1. Extract EVERYTHING - don't skip any information
2. For experience, include ALL work experience entries with FULL descriptions
3. For education, include ALL education entries with complete details
4. For skills, list EVERY skill mentioned (technical, soft skills, tools, frameworks, etc.)
5. For certifications, list ALL certifications mentioned
6. Extract projects if mentioned
7. Extract achievements if mentioned
8. Use null only if the field is truly not mentioned in the resume

Please extract and return a JSON object with this COMPLETE structure:
{
  "fullName": "candidate's full name",
  "email": "email address",
  "phone": "phone number",
  "location": "city, country/address",
  "summary": "professional summary or objective - extract the complete text",
  "skills": ["skill1", "skill2", "skill3", "...list ALL skills found"],
  "experience": [
    {
      "position": "exact job title",
      "company": "company name",
      "duration": "start date - end date",
      "description": "complete job description with all responsibilities and achievements"
    }
  ],
  "education": [
    {
      "degree": "full degree name",
      "institution": "complete institution name",
      "year": "graduation year or duration",
      "details": "additional details like GPA, honors, etc."
    }
  ],
  "certifications": ["certification1", "certification2", "...all certifications"],
  "languages": ["language1", "language2", "...all languages"],
  "projects": ["project1 description", "project2 description", "...if any"],
  "achievements": ["achievement1", "achievement2", "...if any"]
}

Return ONLY the JSON object, no additional text or explanation. Make sure to extract EVERY piece of information from the resume.`;

    console.log("🤖 Sending to Gemini AI...");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    console.log("📨 Raw Gemini response:", text);

    // Clean the response - remove markdown code blocks if present
    text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    // Parse the JSON
    let parsedData: Record<string, unknown>;
    try {
      parsedData = JSON.parse(text) as Record<string, unknown>;
      console.log("✅ Successfully parsed JSON:", parsedData);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Failed text:", text);
      return NextResponse.json(
        { success: false, error: "AI response was not valid JSON" },
        { status: 500 }
      );
    }

    // Save the uploaded file (optional - for reference)
    try {
      const uploadDir = path.join(process.cwd(), "public", "uploads", "resumes");
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
      }
      
      const timestamp = Date.now();
      const filename = `${timestamp}-${file.name}`;
      const filepath = path.join(uploadDir, filename);
      
      await writeFile(filepath, buffer);
      console.log("💾 File saved:", filepath);
      
      parsedData.uploadedFile = `/uploads/resumes/${filename}`;
    } catch (saveError) {
      console.error("File save error:", saveError);
      // Continue even if file save fails
    }

    return NextResponse.json({
      success: true,
      data: parsedData,
      message: "Resume parsed successfully",
    });

  } catch (error) {
    console.error("Resume parsing error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Internal server error" 
      },
      { status: 500 }
    );
  }
}
