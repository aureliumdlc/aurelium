import { z } from "zod";
import { error, json } from "@/lib/api";
import { getUserFromRequest, isAdmin } from "@/lib/auth";
import { activateLicense } from "@/lib/license";
import { db } from "@/lib/db";
import type { Plan } from "@/lib/types";

export async function GET(req: Request) {
  const admin = await getUserFromRequest(req);
  if (!admin || !isAdmin(admin.role)) return error("Forbidden", 403);

  const url = new URL(req.url);
  const status = url.searchParams.get("status");

  const payments = await db.payment.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      user: { select: { email: true, publicId: true } },
      promoCode: { select: { code: true } },
    },
  });

  return json({ payments });
}

const patchSchema = z.object({
  paymentId: z.string(),
  action: z.enum(["confirm", "reject"]),
  cryptoTxHash: z.string().optional(),
});

export async function PATCH(req: Request) {
  const admin = await getUserFromRequest(req);
  if (!admin || !isAdmin(admin.role)) return error("Forbidden", 403);

  const body = patchSchema.parse(await req.json());
  const payment = await db.payment.findUnique({ where: { id: body.paymentId } });
  if (!payment) return error("Not found", 404);

  if (body.action === "reject") {
    await db.payment.update({
      where: { id: payment.id },
      data: { status: "FAILED" },
    });
    return json({ ok: true });
  }

  if (payment.status === "COMPLETED") return json({ ok: true, already: true });

  await db.payment.update({
    where: { id: payment.id },
    data: {
      status: "COMPLETED",
      cryptoTxHash: body.cryptoTxHash,
      completedAt: new Date(),
    },
  });

  if (payment.type === "SUBSCRIPTION" && payment.plan) {
    await activateLicense(payment.userId, payment.plan as Plan);
  }
  if (payment.type === "HWID_RESET") {
    await db.hwid.deleteMany({ where: { userId: payment.userId } });
  }

  return json({ ok: true });
}
