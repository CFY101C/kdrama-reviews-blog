import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "kdrama-next-dev-secret-change-in-production"
);

const PROTECTED_PATTERNS = [
  /^\/dramas\/\d+\/reviews\/new/,
  /^\/api\/dramas\/\d+\/reviews/,
  /^\/api\/reviews\/\d+\/comments/,
  /^\/api\/reviews\/\d+\/like/,
];

async function verifyTokenCookie(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get("token")?.value;
  if (!token) return false;

  try {
    await jwtVerify(token, SECRET);
    return true;
  } catch {
    return false;
  }
}

async function verifyAdminCookie(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get("admin_token")?.value;
  if (!token) return false;

  try {
    const { payload } = await jwtVerify(token, SECRET);
    return (payload as { isAdmin?: boolean }).isAdmin === true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin page protection
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const isAdmin = await verifyAdminCookie(request);
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  // Admin API protection (except login and me)
  if (
    pathname.startsWith("/api/admin") &&
    !pathname.startsWith("/api/admin/login") &&
    !pathname.startsWith("/api/admin/me")
  ) {
    const isAdmin = await verifyAdminCookie(request);
    if (!isAdmin) {
      return Response.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  const needsAuth = PROTECTED_PATTERNS.some((p) => p.test(pathname));
  if (!needsAuth) return NextResponse.next();

  // Allow GET requests for review listing APIs
  if (request.method === "GET" && pathname.startsWith("/api/dramas/")) {
    return NextResponse.next();
  }

  const authenticated = await verifyTokenCookie(request);
  if (!authenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/dramas/:tmdbId/reviews/:path*",
    "/api/dramas/:tmdbId/reviews/:path*",
    "/api/reviews/:reviewId/comments/:path*",
    "/api/reviews/:reviewId/like",
  ],
};
