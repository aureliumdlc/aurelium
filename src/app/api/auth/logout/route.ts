import { json } from "@/lib/api";
import { clearAuthCookies, getRefreshFromRequest } from "@/lib/cookies";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const refresh = getRefreshFromRequest(req);
  if (refresh) {
    await db.session.deleteMany({ where: { refreshToken: refresh } }).catch(() => {});
  }
  const res = json({ ok: true });
  clearAuthCookies(res);
  return res;
}
