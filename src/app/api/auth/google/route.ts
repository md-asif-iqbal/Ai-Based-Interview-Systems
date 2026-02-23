import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import User from "@/models/User";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, fullName, photoUrl, uid, role } = body;

    if (!email || !uid) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate role if provided
    const validRole = role === "recruiter" ? "recruiter" : "candidate";

    await connectDB();

    // Check if user already exists
    let user = await User.findOne({ email });

    if (user) {
      // Existing user — update profile picture if available
      if (photoUrl && !user.profilePicture) {
        user.profilePicture = photoUrl;
        await user.save();
      }
    } else {
      // New user — create account with selected role
      user = await User.create({
        email,
        fullName: fullName || email.split("@")[0],
        password: `google_${uid}_${Date.now()}`, // placeholder, won't be used for Google login
        phone: "",
        role: validRole,
        emailVerified: true,
        profilePicture: photoUrl || undefined,
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" } as jwt.SignOptions
    );

    const response = NextResponse.json({
      success: true,
      data: {
        user: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          profilePicture: user.profilePicture,
        },
      },
      message: "Google login successful",
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Google auth error:", error);
    return NextResponse.json(
      { success: false, error: "Google authentication failed" },
      { status: 500 }
    );
  }
}
