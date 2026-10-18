import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import JobPosting from "@/models/JobPosting";
import "@/models/Company"; // Register Company model for populate
import { getAuthUserFromRequest } from "@/lib/auth/middleware";
import { createJobSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "";
    const location = searchParams.get("location") || "";
    const sort = searchParams.get("sort") || "newest";

    const filter: Record<string, unknown> = { status: "active" };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    if (type) {
      filter.employmentType = type;
    }
    if (location) {
      filter.location = { $regex: location, $options: "i" };
    }

    const sortOptions: Record<string, Record<string, 1 | -1>> = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      salary_high: { "salaryRange.max": -1 },
      salary_low: { "salaryRange.min": 1 },
    };

    const skip = (page - 1) * limit;
    const total = await JobPosting.countDocuments(filter);

    const jobs = await JobPosting.find(filter)
      .populate("companyId", "name logo location industry")
      .sort((sortOptions[sort] || { createdAt: -1 }) as Record<string, 1 | -1>)
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      data: jobs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get jobs error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}

import Company from "@/models/Company";

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUserFromRequest(req);
    if (!authUser || (authUser.role !== "recruiter" && authUser.role !== "admin")) {
      return NextResponse.json(
        { success: false, error: "Only recruiters can create jobs" },
        { status: 403 }
      );
    }

    await connectDB();
    const rawBody = await req.json();

    // 1. Resolve or auto-create companyId if not provided
    let companyId = rawBody.companyId;
    if (!companyId) {
      let company = await Company.findOne({ ownerId: authUser.userId });
      if (!company) {
        company = await Company.create({
          name: rawBody.companyName || "Tech Innovations Ltd.",
          industry: rawBody.industry || "Software & Technology",
          location: rawBody.location || "Remote",
          ownerId: authUser.userId,
        });
      }
      companyId = company._id.toString();
    }

    // 2. Normalize employmentType ("full-time" -> "full_time")
    let employmentType = rawBody.employmentType || rawBody.type || "full_time";
    employmentType = employmentType.replace("-", "_");
    if (!["full_time", "part_time", "contract", "internship"].includes(employmentType)) {
      employmentType = "full_time";
    }

    // 3. Normalize requirements
    let requirements = rawBody.requirements;
    if (!requirements || typeof requirements !== "object" || !Array.isArray(requirements.skills)) {
      const skillsArray = Array.isArray(rawBody.skills)
        ? rawBody.skills
        : typeof rawBody.skills === "string"
        ? rawBody.skills.split(",").map((s: string) => s.trim()).filter(Boolean)
        : ["General Software Engineering"];
      requirements = {
        skills: skillsArray.length > 0 ? skillsArray : ["General Engineering"],
        experienceYears: Number(rawBody.experienceYears || (rawBody.experienceLevel === "senior" ? 5 : rawBody.experienceLevel === "lead" ? 8 : 2)),
        education: rawBody.education || "Bachelor's degree or equivalent experience",
      };
    }

    // 4. Normalize salary range
    let salaryRange = rawBody.salaryRange || rawBody.salary;
    if (salaryRange && (salaryRange.min != null || salaryRange.max != null)) {
      salaryRange = {
        min: Number(salaryRange.min || 0),
        max: Number(salaryRange.max || salaryRange.min || 0),
        currency: salaryRange.currency || "BDT",
      };
    }

    const isRemote = Boolean(
      rawBody.remote ||
      (typeof rawBody.location === "string" && rawBody.location.toLowerCase().includes("remote"))
    );

    const normalizedBody = {
      title: rawBody.title,
      description: rawBody.description,
      companyId,
      department: rawBody.department || "Engineering",
      location: rawBody.location || "Remote",
      remote: isRemote,
      employmentType,
      requirements,
      salaryRange,
      benefits: Array.isArray(rawBody.benefits) ? rawBody.benefits : [],
    };

    const parsed = createJobSchema.safeParse(normalizedBody);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const job = await JobPosting.create({
      ...parsed.data,
      createdBy: authUser.userId,
      status: rawBody.status === "draft" ? "draft" : "active",
    });

    return NextResponse.json(
      { success: true, data: job, message: "Job posted successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create job error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create job" },
      { status: 500 }
    );
  }
}
