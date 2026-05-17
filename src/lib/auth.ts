import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { db } from "./db";
import { SUPERADMIN_EMAILS } from "./constants";

const ACCESS_SECRET = new TextEncoder().encode(
  process.env.JWT_ACCESS_SECRET || "dev-access-secret-change-me"
);
const REFRESH_SECRET = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET || "dev-refresh-secret-change-me"
);

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createAccessToken(userId: string, email: string, role: string) {
  return new SignJWT({ sub: userId, email, role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(ACCESS_SECRET);
}

export async function createRefreshToken(userId: string) {
  return new SignJWT({ sub: userId, type: "refresh" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(REFRESH_SECRET);
}

export async function verifyAccessToken(token: string) {
  const { payload } = await jwtVerify(token, ACCESS_SECRET);
  return payload as { sub: string; email: string; role: string };
}

export async function verifyRefreshToken(token: string) {
  const { payload } = await jwtVerify(token, REFRESH_SECRET);
  return payload as { sub: string; type?: string };
}

export async function getUserFromRequest(req: Request) {
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) {
    try {
      const payload = await verifyAccessToken(auth.slice(7));
      const user = await db.user.findUnique({ where: { id: payload.sub } });
      if (user?.banned) return null;
      return user;
    } catch {
      return null;
    }
  }

  const cookieHeader = req.headers.get("cookie") ?? "";
  const accessMatch = cookieHeader.match(/access_token=([^;]+)/)?.[1];
  if (accessMatch) {
    try {
      const payload = await verifyAccessToken(accessMatch);
      const user = await db.user.findUnique({ where: { id: payload.sub } });
      if (user?.banned) return null;
      return user;
    } catch {
      /* try refresh below */
    }
  }

  const refreshMatch = cookieHeader.match(/refresh_token=([^;]+)/)?.[1];
  if (refreshMatch) {
    const { tryRefreshSession } = await import("@/lib/session");
    const refreshed = await tryRefreshSession(refreshMatch);
    return refreshed?.user ?? null;
  }

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;
    if (token) {
      const payload = await verifyAccessToken(token);
      const user = await db.user.findUnique({ where: { id: payload.sub } });
      if (user?.banned) return null;
      return user;
    }
    const refresh = cookieStore.get("refresh_token")?.value;
    if (refresh) {
      const { tryRefreshSession } = await import("@/lib/session");
      const refreshed = await tryRefreshSession(refresh);
      return refreshed?.user ?? null;
    }
  } catch {
    return null;
  }

  return null;
}

export function resolveInitialRole(email: string) {
  const normalized = email.toLowerCase().trim();
  if (SUPERADMIN_EMAILS.some((e) => e.toLowerCase() === normalized)) {
    return "SUPERADMIN" as const;
  }
  return "USER" as const;
}

export function isAdmin(role: string) {
  return role === "ADMIN" || role === "SUPERADMIN";
}
