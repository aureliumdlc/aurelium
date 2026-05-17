import { NextResponse } from "next/server";

const isProd = process.env.NODE_ENV === "production";

export function setAuthCookies(
  res: NextResponse,
  accessToken: string,
  refreshToken: string
) {
  const base = {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure: isProd,
  };
  res.cookies.set("access_token", accessToken, { ...base, maxAge: 60 * 60 * 24 });
  res.cookies.set("refresh_token", refreshToken, { ...base, maxAge: 60 * 60 * 24 * 30 });
}

export function clearAuthCookies(res: NextResponse) {
  res.cookies.set("access_token", "", { path: "/", maxAge: 0 });
  res.cookies.set("refresh_token", "", { path: "/", maxAge: 0 });
}

export function getRefreshFromRequest(req: Request): string | null {
  const cookie = req.headers.get("cookie") ?? "";
  return cookie.match(/refresh_token=([^;]+)/)?.[1] ?? null;
}

export function getAccessFromRequest(req: Request): string | null {
  const cookie = req.headers.get("cookie") ?? "";
  return cookie.match(/access_token=([^;]+)/)?.[1] ?? null;
}
