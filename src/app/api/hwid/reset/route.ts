import { error, json } from "@/lib/api";
import { getUserFromRequest, isAdmin } from "@/lib/auth";
import { PRICES, USDT_WALLET_DEFAULT } from "@/lib/constants";
import { rubToUsdt } from "@/lib/currency";
import { db } from "@/lib/db";
import { generateExternalId } from "@/lib/utils";

export async function POST(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user) return error("Unauthorized", 401);

  const body = await req.json().catch(() => ({}));
  if (body.adminForce && isAdmin(user.role)) {
    await db.hwid.deleteMany({ where: { userId: body.userId ?? user.id } });
    return json({ ok: true, message: "HWID reset by admin" });
  }

  const payment = await db.payment.create({
    data: {
      userId: user.id,
      amount: PRICES.HWID_RESET,
      type: "HWID_RESET",
      externalId: generateExternalId(),
    },
  });

  const wallet = process.env.USDT_TRC20_WALLET || USDT_WALLET_DEFAULT;
  return json({
    paymentId: payment.id,
    externalId: payment.externalId,
    amountRub: PRICES.HWID_RESET,
    amountUsdt: rubToUsdt(PRICES.HWID_RESET),
    wallet,
    network: "TRC20",
    message: "Pay USDT TRC20, then wait for confirmation",
  });
}
