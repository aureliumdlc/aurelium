import { error, json } from "@/lib/api";
import { getUserFromRequest, isAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const admin = await getUserFromRequest(req);
  if (!admin || !isAdmin(admin.role)) return error("Forbidden", 403);

  const since = new Date(Date.now() - 15 * 60 * 1000);

  const heartbeats = await db.heartbeat.findMany({
    where: { createdAt: { gte: since } },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: {
        select: { email: true, publicId: true, license: { select: { status: true, plan: true } } },
      },
    },
  });

  const onlineUserIds = [...new Set(heartbeats.map((h) => h.userId))];

  return json({ heartbeats, onlineCount: onlineUserIds.length });
}
