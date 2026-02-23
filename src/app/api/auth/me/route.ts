import { NextResponse } from "next/server";
import { getAuthUser, getFullUser } from "@/lib/auth/middleware";
import connectDB from "@/lib/db/mongodb";
import Candidate from "@/models/Candidate";

export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    await connectDB();
    const user = await getFullUser(authUser.userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Get candidate profile if user is a candidate
    let candidate = null;
    if (user.role === "candidate") {
      candidate = await Candidate.findOne({ userId: user._id });
    }

    return NextResponse.json({
      success: true,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
      },
      candidate: candidate,
    });
  } catch (error) {
    console.error("Get me error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
