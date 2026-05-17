import { z } from "zod";
import { error, json } from "@/lib/api";
import { getUserFromRequest } from "@/lib/auth";
import { getPlanPrice } from "@/lib/license";
import { db } from "@/lib/db";
import { rubToUsdt } from "@/lib/currency";
import { USDT_WALLET_DEFAULT } from "@/lib/constants";
import { generateExternalId } from "@/lib/utils";
import type { Plan } from "@/lib/types";

const schema = z.object({
  plan: z.enum(["MONTH", "YEAR", "LIFETIME"]),
  promoCode: z.string().optional(),
});

export async function POST(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user) return error("Unauthorized", 401);

  try {
    const body = schema.parse(await req.json());
    let discount = 0;
    let promoCodeId: string | undefined;

    if (body.promoCode) {
      const promo = await db.promoCode.findUnique({
        where: { code: body.promoCode.toUpperCase() },
      });
      if (!promo || !promo.active) return error("Invalid promo code", 400);
      if (promo.expiresAt && promo.expiresAt < new Date()) return error("Promo expired", 400);
      if (promo.maxUses && promo.usedCount >= promo.maxUses) return error("Promo limit reached", 400);
      discount = promo.discountPercent;
      promoCodeId = promo.id;
    }

    const amount = getPlanPrice(body.plan as Plan, discount);
    const payment = await db.payment.create({
      data: {
        userId: user.id,
        amount,
        plan: body.plan as Plan,
        type: "SUBSCRIPTION",
        externalId: generateExternalId(),
        promoCodeId,
      },
    });

    const amountUsdt = rubToUsdt(amount);
    const wallet = process.env.USDT_TRC20_WALLET || USDT_WALLET_DEFAULT;

    return json({
      paymentId: payment.id,
      externalId: payment.externalId,
      plan: body.plan,
      amountRub: amount,
      amountUsdt,
      rubPerUsdt: Number(process.env.USDT_RUB_RATE || "92"),
      wallet,
      network: "TRC20",
      note: `Include memo: ${payment.externalId}`,
    });
  } catch (e) {
    if (e instanceof z.ZodError) return error("Invalid input", 400);
    return error("Payment creation failed", 500);
  }
}
