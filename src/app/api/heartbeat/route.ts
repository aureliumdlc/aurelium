import { error, json, jsonError } from "@/lib/api";
import { getUserFromRequest } from "@/lib/auth";
import { getLicenseStatus } from "@/lib/license";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user) return error("Unauthorized", 401);

  const license = await getLicenseStatus(user.id);
  if (!license.active) {
    return jsonError(
      {
        ok: false,
        message: "Subscription period expired — please renew",
        messageRu: "Период истёк — докупите подписку",
      },
      403
    );
  }

  await db.heartbeat.create({
    data: {
      userId: user.id,
      ip: req.headers.get("x-forwarded-for") ?? undefined,
    },
  });

  return json({ ok: true, nextHeartbeatIn: 600 });
}
