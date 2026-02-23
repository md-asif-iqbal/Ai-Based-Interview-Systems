import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const publicPaths = new Set([
  "/",
  "/login",
  "/signup",
  "/jobs",
  "/api/auth/login",
  "/api/auth/signup",
  "/api/auth/google",
  "/api/jobs",
]);

const publicPrefixes = [
  "/_next",
  "/favicon",
  "/jobs/",
  "/api/jobs/",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths (exact match)
  if (publicPaths.has(pathname)) {
    return NextResponse.next();
  }

  // Allow public prefixes
  if (publicPrefixes.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Allow static files
  if (pathname.includes(".") && !pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Check auth token
  const token = request.cookies.get("token")?.value;

  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Verify JWT using jose (edge-runtime compatible)
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);

    const userId = payload.userId as string;
    const role = payload.role as string;
    const email = payload.email as string;

    if (!userId) {
      throw new Error("Invalid token payload");
    }

    // Role-based access
    if (pathname.startsWith("/recruiter") && role === "candidate") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Add user info to headers
    const response = NextResponse.next();
    response.headers.set("x-user-id", userId);
    response.headers.set("x-user-role", role);
    response.headers.set("x-user-email", email);
    return response;
  } catch {
    // Invalid token
    if (pathname.startsWith("/api/")) {
      const response = NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
      response.cookies.delete("token");
      return response;
    }
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("token");
    return response;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
