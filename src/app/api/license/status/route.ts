import { error, json } from "@/lib/api";
import { getUserFromRequest } from "@/lib/auth";
import { getLicenseStatus } from "@/lib/license";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user) return error("Unauthorized", 401);

  const license = await getLicenseStatus(user.id);
  const hwid = await db.hwid.findUnique({ where: { userId: user.id } });

  if (!license.active) {
    return json({
      active: false,
      status: "EXPIRED",
      message: "Subscription period expired — please renew",
      messageRu: "Период истёк — докупите подписку",
      publicId: user.publicId,
      plan: license.plan,
      expiresAt: license.expiresAt,
      hwid: hwid?.value ?? null,
    });
  }

  return json({
    active: true,
    status: license.status,
    plan: license.plan,
    expiresAt: license.expiresAt,
    publicId: user.publicId,
    hwid: hwid?.value ?? null,
  });
}
