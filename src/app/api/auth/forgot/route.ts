import { SignJWT } from "jose";
import { z } from "zod";
import { error, json } from "@/lib/api";
import { sendPasswordResetEmail } from "@/lib/email";
import { db } from "@/lib/db";

const schema = z.object({
  email: z.string().email(),
  lang: z.enum(["ru", "en"]).optional(),
});

const RESET_SECRET = new TextEncoder().encode(
  process.env.JWT_RESET_SECRET || "dev-reset-secret"
);

export async function POST(req: Request) {
  const body = schema.parse(await req.json());
  const email = body.email.toLowerCase().trim();
  const user = await db.user.findUnique({ where: { email } });
  if (!user) return json({ ok: true });

  const token = await new SignJWT({ sub: user.id })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1h")
    .sign(RESET_SECRET);

  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const resetUrl = `${base}/auth/reset?token=${token}`;
  await sendPasswordResetEmail(email, resetUrl, body.lang ?? "ru");

  return json({ ok: true });
}
