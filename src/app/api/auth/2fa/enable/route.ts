import { z } from "zod";
import { error, json } from "@/lib/api";
import { getUserFromRequest } from "@/lib/auth";
import { db } from "@/lib/db";
import { verifyTotp } from "@/lib/totp";

const schema = z.object({ totp: z.string().length(6) });

export async function POST(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user?.twoFactorSecret) return error("Setup 2FA first", 400);

  const { totp } = schema.parse(await req.json());
  const valid = await verifyTotp(totp, user.twoFactorSecret);
  if (!valid) return error("Invalid code", 400);

  await db.user.update({
    where: { id: user.id },
    data: { twoFactorEnabled: true },
  });

  return json({ ok: true });
}
