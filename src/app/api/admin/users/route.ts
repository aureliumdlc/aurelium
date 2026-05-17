import { z } from "zod";
import { error, json } from "@/lib/api";
import { getUserFromRequest, isAdmin } from "@/lib/auth";
import { activateLicense } from "@/lib/license";
import { db } from "@/lib/db";
import type { Plan, Role } from "@/lib/types";

export async function GET(req: Request) {
  const admin = await getUserFromRequest(req);
  if (!admin || !isAdmin(admin.role)) return error("Forbidden", 403);

  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.toLowerCase();

  const users = await db.user.findMany({
    include: {
      license: true,
      hwid: true,
      _count: { select: { payments: true, sessions: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  const filtered = q
    ? users.filter(
        (u) =>
          u.email.toLowerCase().includes(q) ||
          u.publicId.toLowerCase().includes(q)
      )
    : users;

  return json({ users: filtered });
}

const patchSchema = z.object({
  userId: z.string(),
  action: z.enum([
    "grant",
    "revoke",
    "setRole",
    "ban",
    "unban",
    "resetHwid",
    "killSessions",
    "extendDays",
  ]),
  plan: z.enum(["MONTH", "YEAR", "LIFETIME"]).optional(),
  role: z.enum(["USER", "ADMIN", "SUPERADMIN"]).optional(),
  days: z.number().min(1).max(3650).optional(),
});

export async function PATCH(req: Request) {
  const admin = await getUserFromRequest(req);
  if (!admin || !isAdmin(admin.role)) return error("Forbidden", 403);

  const body = patchSchema.parse(await req.json());

  if (body.action === "setRole") {
    if (admin.role !== "SUPERADMIN") return error("Only superadmin can set roles", 403);
    if (!body.role) return error("Role required", 400);
    await db.user.update({ where: { id: body.userId }, data: { role: body.role as Role } });
    return json({ ok: true });
  }

  if (body.action === "ban") {
    await db.user.update({ where: { id: body.userId }, data: { banned: true } });
    await db.session.deleteMany({ where: { userId: body.userId } });
    return json({ ok: true });
  }

  if (body.action === "unban") {
    await db.user.update({ where: { id: body.userId }, data: { banned: false } });
    return json({ ok: true });
  }

  if (body.action === "resetHwid") {
    await db.hwid.deleteMany({ where: { userId: body.userId } });
    return json({ ok: true });
  }

  if (body.action === "killSessions") {
    await db.session.deleteMany({ where: { userId: body.userId } });
    return json({ ok: true });
  }

  if (body.action === "extendDays") {
    const days = body.days ?? 30;
    const license = await db.license.findUnique({ where: { userId: body.userId } });
    const base =
      license?.expiresAt && license.expiresAt > new Date()
        ? license.expiresAt
        : new Date();
    const expiresAt = new Date(base.getTime() + days * 24 * 60 * 60 * 1000);
    await db.license.upsert({
      where: { userId: body.userId },
      create: {
        userId: body.userId,
        plan: "MONTH",
        status: "ACTIVE",
        expiresAt,
      },
      update: { status: "ACTIVE", expiresAt },
    });
    return json({ ok: true, expiresAt });
  }

  if (body.action === "grant") {
    if (!body.plan) return error("Plan required", 400);
    await activateLicense(body.userId, body.plan as Plan);
    return json({ ok: true });
  }

  if (body.action === "revoke") {
    await db.license.updateMany({
      where: { userId: body.userId },
      data: { status: "EXPIRED" },
    });
    return json({ ok: true });
  }

  return error("Unknown action", 400);
}
