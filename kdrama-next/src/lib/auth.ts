import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "kdrama-next-dev-secret-change-in-production"
);

const COOKIE_NAME = "token";
const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 days
};

interface JwtPayload {
  userId: string;
  email: string;
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

async function signToken(payload: JwtPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET);
}

async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
}

export async function setTokenCookie(userId: string, email: string): Promise<string> {
  const token = await signToken({ userId, email });
  (await cookies()).set(COOKIE_NAME, token, COOKIE_OPTIONS);
  return token;
}

export async function clearTokenCookie(): Promise<void> {
  (await cookies()).set(COOKIE_NAME, "", { ...COOKIE_OPTIONS, maxAge: 0 });
}

export async function getSession() {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true, name: true, image: true },
  });

  return user;
}

export function getTokenFromRequest(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;

  const match = cookieHeader.match(
    new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]*)`)
  );
  return match ? decodeURIComponent(match[1]) : null;
}

export async function getUserFromToken(token: string) {
  const payload = await verifyToken(token);
  if (!payload) return null;

  return prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true, name: true, image: true },
  });
}

export async function requireAuth(request: Request) {
  const token = getTokenFromRequest(request);
  if (!token) return null;

  return getUserFromToken(token);
}

// ── Admin auth ──────────────────────────────────────────────────────

const ADMIN_COOKIE_NAME = "admin_token";
const ADMIN_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 8, // 8 hours
};

export function getAdminPassword(): string {
  const password = process.env.ADMIN_PASSWORD;
  if (!password || password.length < 8) {
    throw new Error("ADMIN_PASSWORD not configured or too short (min 8 chars)");
  }
  return password;
}

async function signAdminToken(): Promise<string> {
  return new SignJWT({ isAdmin: true })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(SECRET);
}

export async function setAdminCookie(): Promise<string> {
  const token = await signAdminToken();
  (await cookies()).set(ADMIN_COOKIE_NAME, token, ADMIN_COOKIE_OPTIONS);
  return token;
}

export async function clearAdminCookie(): Promise<void> {
  (await cookies()).set(ADMIN_COOKIE_NAME, "", { ...ADMIN_COOKIE_OPTIONS, maxAge: 0 });
}

export async function getAdminSession(): Promise<boolean> {
  const token = (await cookies()).get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return false;

  try {
    const { payload } = await jwtVerify(token, SECRET);
    return (payload as { isAdmin?: boolean }).isAdmin === true;
  } catch {
    return false;
  }
}

export function getAdminTokenFromRequest(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;

  const match = cookieHeader.match(
    new RegExp(`(?:^|;\\s*)${ADMIN_COOKIE_NAME}=([^;]*)`)
  );
  return match ? decodeURIComponent(match[1]) : null;
}

export async function verifyAdminRequest(request: Request): Promise<boolean> {
  const token = getAdminTokenFromRequest(request);
  if (!token) return false;

  try {
    const { payload } = await jwtVerify(token, SECRET);
    return (payload as { isAdmin?: boolean }).isAdmin === true;
  } catch {
    return false;
  }
}
