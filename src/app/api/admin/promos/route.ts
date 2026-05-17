import { z } from "zod";
import { error, json } from "@/lib/api";
import { getUserFromRequest, isAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const admin = await getUserFromRequest(req);
  if (!admin || !isAdmin(admin.role)) return error("Forbidden", 403);
  const promos = await db.promoCode.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { uses: true } } },
  });
  return json({ promos });
}

const createSchema = z.object({
  code: z.string().min(3),
  type: z.enum(["MEDIA", "DEFAULT"]),
  discountPercent: z.number().min(1).max(100),
  maxUses: z.number().optional(),
  expiresAt: z.string().datetime().optional(),
});

export async function POST(req: Request) {
  const admin = await getUserFromRequest(req);
  if (!admin || !isAdmin(admin.role)) return error("Forbidden", 403);
  const body = createSchema.parse(await req.json());
  const promo = await db.promoCode.create({
    data: {
      code: body.code.toUpperCase(),
      type: body.type,
      discountPercent: body.discountPercent,
      maxUses: body.maxUses,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
      createdById: admin.id,
    },
  });
  return json({ promo });
}

const patchSchema = z.object({
  promoId: z.string(),
  action: z.enum(["toggle", "delete"]),
});

export async function PATCH(req: Request) {
  const admin = await getUserFromRequest(req);
  if (!admin || !isAdmin(admin.role)) return error("Forbidden", 403);
  const body = patchSchema.parse(await req.json());

  if (body.action === "delete") {
    await db.promoCode.delete({ where: { id: body.promoId } });
    return json({ ok: true });
  }

  const promo = await db.promoCode.findUnique({ where: { id: body.promoId } });
  if (!promo) return error("Not found", 404);
  await db.promoCode.update({
    where: { id: body.promoId },
    data: { active: !promo.active },
  });
  return json({ ok: true });
}
