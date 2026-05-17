import { jwtVerify } from "jose";
import { z } from "zod";
import { error, json } from "@/lib/api";
import { hashPassword } from "@/lib/auth";
import { db } from "@/lib/db";

const RESET_SECRET = new TextEncoder().encode(
  process.env.JWT_RESET_SECRET || "dev-reset-secret"
);

const schema = z.object({
  token: z.string(),
  password: z.string().min(8),
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());
    const { payload } = await jwtVerify(body.token, RESET_SECRET);
    const userId = payload.sub as string;
    await db.user.update({
      where: { id: userId },
      data: { passwordHash: await hashPassword(body.password) },
    });
    return json({ ok: true });
  } catch {
    return error("Invalid or expired token", 400);
  }
}
