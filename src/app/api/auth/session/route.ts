import { error, json } from "@/lib/api";
import { setAuthCookies, getAccessFromRequest, getRefreshFromRequest } from "@/lib/cookies";
import { getUserFromAccessToken, tryRefreshSession, serializeUser } from "@/lib/session";

export async function GET(req: Request) {
  const access = getAccessFromRequest(req);
  if (access) {
    const user = await getUserFromAccessToken(access);
    if (user) return json({ user: serializeUser(user), authenticated: true });
  }

  const refresh = getRefreshFromRequest(req);
  if (!refresh) return json({ authenticated: false }, 200);

  const refreshed = await tryRefreshSession(refresh);
  if (!refreshed) return json({ authenticated: false }, 200);

  const res = json({ user: serializeUser(refreshed.user), authenticated: true });
  setAuthCookies(res, refreshed.accessToken, refreshed.refreshToken);
  return res;
}
