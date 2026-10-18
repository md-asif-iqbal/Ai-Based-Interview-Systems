import { NextRequest, NextResponse } from "next/server";
import { getAuthUserFromRequest } from "@/lib/auth/middleware";
import { generateJobDescription } from "@/lib/gemini/jobDescriptionGenerator";

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUserFromRequest(req);
    if (!authUser || (authUser.role !== "recruiter" && authUser.role !== "admin")) {
      return NextResponse.json(
        { success: false, error: "Only recruiters can generate job descriptions" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      title,
      department,
      experienceLevel,
      location,
      employmentType,
      skills,
      companyName,
      industry,
      referenceCV,
      candidateCV,
    } = body;

    if (!title || typeof title !== "string" || title.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "Job title is required to generate description" },
        { status: 400 }
      );
    }

    const generated = await generateJobDescription({
      title: title.trim(),
      department,
      experienceLevel,
      location,
      employmentType,
      skills: Array.isArray(skills) ? skills : [],
      companyName,
      industry,
      referenceCV,
      candidateCV,
    });

    return NextResponse.json({
      success: true,
      data: generated,
    });
  } catch (error) {
    console.error("Job description generation route error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate job description" },
      { status: 500 }
    );
  }
}
