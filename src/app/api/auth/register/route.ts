import { z } from "zod";
import { error, json } from "@/lib/api";
import {
  createAccessToken,
  createRefreshToken,
  hashPassword,
  resolveInitialRole,
} from "@/lib/auth";
import { setAuthCookies } from "@/lib/cookies";
import { db } from "@/lib/db";
import { generatePublicId } from "@/lib/utils";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());
    const email = body.email.toLowerCase().trim();
    const exists = await db.user.findUnique({ where: { email } });
    if (exists) return error("Email already registered", 409);

    const user = await db.user.create({
      data: {
        email,
        passwordHash: await hashPassword(body.password),
        publicId: generatePublicId(),
        role: resolveInitialRole(email),
      },
    });

    const accessToken = await createAccessToken(user.id, user.email, user.role);
    const refreshToken = await createRefreshToken(user.id);

    await db.session.create({
      data: {
        userId: user.id,
        refreshToken,
        ip: req.headers.get("x-forwarded-for") ?? undefined,
        userAgent: req.headers.get("user-agent") ?? undefined,
      },
    });

    await db.loginHistory.create({
      data: { userId: user.id, success: true, ip: req.headers.get("x-forwarded-for") ?? undefined },
    });

    const res = json({
      user: { id: user.id, publicId: user.publicId, email: user.email, role: user.role },
      accessToken,
      refreshToken,
    });
    setAuthCookies(res, accessToken, refreshToken);
    return res;
  } catch (e) {
    if (e instanceof z.ZodError) return error("Invalid input", 400);
    console.error(e);
    return error("Registration failed", 500);
  }
}
