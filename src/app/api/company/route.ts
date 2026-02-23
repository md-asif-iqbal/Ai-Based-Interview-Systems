import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Company from "@/models/Company";
import { getAuthUserFromRequest } from "@/lib/auth/middleware";

// GET - Fetch the recruiter's company profile
export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUserFromRequest(req);
    if (!authUser) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const company = await Company.findOne({ ownerId: authUser.userId });

    return NextResponse.json({
      success: true,
      data: company,
    });
  } catch (error) {
    console.error("Company fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch company profile" },
      { status: 500 }
    );
  }
}

// POST - Create company profile
export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUserFromRequest(req);
    if (!authUser || authUser.role !== "recruiter") {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Only recruiters can create a company profile." },
        { status: 403 }
      );
    }

    await connectDB();

    // Check if company already exists for this user
    const existing = await Company.findOne({ ownerId: authUser.userId });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "Company profile already exists. Use PUT to update." },
        { status: 409 }
      );
    }

    const body = await req.json();
    const { name, logo, website, industry, size, description, location } = body;

    if (!name || !industry || !location) {
      return NextResponse.json(
        { success: false, error: "Company name, industry, and location are required" },
        { status: 400 }
      );
    }

    const company = await Company.create({
      name,
      logo: logo || undefined,
      website: website || undefined,
      industry,
      size: size || "1-10",
      description: description || undefined,
      location,
      ownerId: authUser.userId,
    });

    return NextResponse.json({
      success: true,
      data: company,
      message: "Company profile created successfully",
    }, { status: 201 });
  } catch (error) {
    console.error("Company create error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create company profile" },
      { status: 500 }
    );
  }
}

// PUT - Update company profile
export async function PUT(req: NextRequest) {
  try {
    const authUser = await getAuthUserFromRequest(req);
    if (!authUser || authUser.role !== "recruiter") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    await connectDB();

    const body = await req.json();
    const { name, logo, website, industry, size, description, location } = body;

    const company = await Company.findOneAndUpdate(
      { ownerId: authUser.userId },
      {
        ...(name && { name }),
        ...(logo !== undefined && { logo }),
        ...(website !== undefined && { website }),
        ...(industry && { industry }),
        ...(size && { size }),
        ...(description !== undefined && { description }),
        ...(location && { location }),
      },
      { new: true, runValidators: true }
    );

    if (!company) {
      return NextResponse.json(
        { success: false, error: "Company profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: company,
      message: "Company profile updated successfully",
    });
  } catch (error) {
    console.error("Company update error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update company profile" },
      { status: 500 }
    );
  }
}
