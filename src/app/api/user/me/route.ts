import { error, json } from "@/lib/api";
import { getUserFromRequest } from "@/lib/auth";
import { getLicenseStatus } from "@/lib/license";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user) return error("Unauthorized", 401);

  const license = await getLicenseStatus(user.id);
  const hwid = await db.hwid.findUnique({ where: { userId: user.id } });
  const sessions = await db.session.findMany({
    where: { userId: user.id },
    orderBy: { lastActiveAt: "desc" },
    take: 10,
    select: { id: true, deviceInfo: true, ip: true, userAgent: true, lastActiveAt: true, createdAt: true },
  });
  const history = await db.loginHistory.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return json({
    user: {
      id: user.id,
      publicId: user.publicId,
      email: user.email,
      role: user.role,
      twoFactorEnabled: user.twoFactorEnabled,
    },
    license,
    hwid: hwid?.value ?? null,
    sessions,
    history,
  });
}
