import { error, json } from "@/lib/api";
import { setAuthCookies, getRefreshFromRequest } from "@/lib/cookies";
import { tryRefreshSession, serializeUser } from "@/lib/session";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const token = body.refreshToken ?? getRefreshFromRequest(req);
  if (!token) return error("Refresh token required", 401);

  const refreshed = await tryRefreshSession(token);
  if (!refreshed) return error("Invalid session", 401);

  const res = json({
    user: serializeUser(refreshed.user),
    accessToken: refreshed.accessToken,
    refreshToken: refreshed.refreshToken,
  });
  setAuthCookies(res, refreshed.accessToken, refreshed.refreshToken);
  return res;
}
