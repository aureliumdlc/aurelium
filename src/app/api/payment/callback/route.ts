import { error, json } from "@/lib/api";
import { activateLicense } from "@/lib/license";
import { db } from "@/lib/db";
import type { Plan } from "@/lib/types";

export async function POST(req: Request) {
  const secret = req.headers.get("x-payment-secret");
  if (!secret || secret !== process.env.PAYMENT_WEBHOOK_SECRET) {
    return error("Unauthorized", 401);
  }

  const body = await req.json();
  const { externalId, status, cryptoTxHash } = body as {
    externalId?: string;
    status?: string;
    cryptoTxHash?: string;
  };

  if (!externalId) return error("externalId required", 400);

  const payment = await db.payment.findUnique({ where: { externalId } });
  if (!payment) return error("Payment not found", 404);
  if (payment.status === "COMPLETED") return json({ ok: true, already: true });

  if (status !== "completed" && status !== "COMPLETED") {
    return json({ ok: false, message: "Payment not completed" });
  }

  await db.payment.update({
    where: { id: payment.id },
    data: { status: "COMPLETED", cryptoTxHash, completedAt: new Date() },
  });

  if (payment.type === "SUBSCRIPTION" && payment.plan) {
    await activateLicense(payment.userId, payment.plan as Plan);
  }

  if (payment.type === "HWID_RESET") {
    await db.hwid.deleteMany({ where: { userId: payment.userId } });
  }

  if (payment.promoCodeId) {
    await db.promoCode.update({
      where: { id: payment.promoCodeId },
      data: { usedCount: { increment: 1 } },
    });
  }

  return json({ ok: true, userId: payment.userId });
}
