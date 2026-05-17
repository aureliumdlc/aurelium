import QRCode from "qrcode";
import { error, json } from "@/lib/api";
import { getUserFromRequest } from "@/lib/auth";
import { db } from "@/lib/db";
import { createTotpSecret, createTotpUri } from "@/lib/totp";

export async function POST(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user) return error("Unauthorized", 401);

  const secret = createTotpSecret();
  const otpauth = createTotpUri(user.email, secret);
  const qrDataUrl = await QRCode.toDataURL(otpauth);

  await db.user.update({
    where: { id: user.id },
    data: { twoFactorSecret: secret, twoFactorEnabled: false },
  });

  return json({ secret, qrDataUrl });
}
