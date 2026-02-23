import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { verifyToken } from "./jwt";
import { JWTPayload, UserRole } from "@/types";
import connectDB from "@/lib/db/mongodb";
import User from "@/models/User";

export async function getAuthUser(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  return verifyToken(token);
}

export async function getAuthUserFromRequest(req: NextRequest): Promise<JWTPayload | null> {
  const token = req.cookies.get("token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function requireAuth(requiredRole?: UserRole): Promise<JWTPayload> {
  const user = await getAuthUser();

  if (!user) {
    throw new Error("Authentication required");
  }

  if (requiredRole && user.role !== requiredRole && user.role !== "admin") {
    throw new Error("Insufficient permissions");
  }

  return user;
}

export async function getFullUser(userId: string) {
  await connectDB();
  return User.findById(userId).select("-password");
}

// Helper to create authenticated API response
export function authError(message: string = "Authentication required", status: number = 401) {
  return Response.json({ success: false, error: message }, { status });
}
