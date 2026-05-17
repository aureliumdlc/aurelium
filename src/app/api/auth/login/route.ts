import { verifyTotp } from "@/lib/totp";
import { z } from "zod";
import { error, json } from "@/lib/api";
import {
  createAccessToken,
  createRefreshToken,
  verifyPassword,
} from "@/lib/auth";
import { setAuthCookies } from "@/lib/cookies";
import { db } from "@/lib/db";

const schema = z.object({
  email: z.string().email(),
  password: z.string(),
  totp: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());
    const email = body.email.toLowerCase().trim();
    const user = await db.user.findUnique({ where: { email } });
    const ip = req.headers.get("x-forwarded-for") ?? undefined;
    const ua = req.headers.get("user-agent") ?? undefined;

    if (!user || user.banned || !(await verifyPassword(body.password, user.passwordHash))) {
      if (user) {
        await db.loginHistory.create({ data: { userId: user.id, ip, userAgent: ua, success: false } });
      }
      return error("Invalid credentials", 401);
    }

    if (user.twoFactorEnabled && user.twoFactorSecret) {
      if (!body.totp) return error("2FA code required", 403);
      const valid = await verifyTotp(body.totp, user.twoFactorSecret);
      if (!valid) {
        await db.loginHistory.create({ data: { userId: user.id, ip, userAgent: ua, success: false } });
        return error("Invalid 2FA code", 401);
      }
    }

    const accessToken = await createAccessToken(user.id, user.email, user.role);
    const refreshToken = await createRefreshToken(user.id);

    await db.session.create({
      data: { userId: user.id, refreshToken, ip, userAgent: ua },
    });
    await db.loginHistory.create({ data: { userId: user.id, ip, userAgent: ua, success: true } });

    const res = json({
      user: { id: user.id, publicId: user.publicId, email: user.email, role: user.role },
      accessToken,
      refreshToken,
    });
    setAuthCookies(res, accessToken, refreshToken);
    return res;
  } catch (e) {
    if (e instanceof z.ZodError) return error("Invalid input", 400);
    return error("Login failed", 500);
  }
}
