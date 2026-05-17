import { z } from "zod";
import { error, json } from "@/lib/api";
import { getUserFromRequest } from "@/lib/auth";
import { getLicenseStatus } from "@/lib/license";
import { db } from "@/lib/db";
import { generateHwid } from "@/lib/utils";

const schema = z.object({
  hwid: z.string().min(8).max(64).optional(),
});

export async function POST(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user) return error("Unauthorized", 401);

  const license = await getLicenseStatus(user.id);
  if (!license.active) {
    return error("Subscription expired — renew to bind HWID", 403);
  }

  const existing = await db.hwid.findUnique({ where: { userId: user.id } });
  if (existing) return error("HWID already bound", 409);

  const body = schema.safeParse(await req.json().catch(() => ({})));
  const value = body.success && body.data.hwid ? body.data.hwid : generateHwid();

  const hwid = await db.hwid.create({
    data: { userId: user.id, value },
  });

  return json({ hwid: hwid.value, boundAt: hwid.boundAt });
}
