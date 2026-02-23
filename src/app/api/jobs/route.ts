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

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUserFromRequest(req);
    if (!authUser || (authUser.role !== "recruiter" && authUser.role !== "admin")) {
      return NextResponse.json(
        { success: false, error: "Only recruiters can create jobs" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = createJobSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    await connectDB();

    const job = await JobPosting.create({
      ...parsed.data,
      createdBy: authUser.userId,
      status: "active",
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
