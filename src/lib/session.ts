import {
  createAccessToken,
  createRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "@/lib/auth";
import { db } from "@/lib/db";

export async function tryRefreshSession(refreshToken: string) {
  try {
    const payload = await verifyRefreshToken(refreshToken);
    const session = await db.session.findUnique({ where: { refreshToken } });
    if (!session || session.userId !== payload.sub) return null;

    const user = await db.user.findUnique({ where: { id: session.userId } });
    if (!user || user.banned) return null;

    const accessToken = await createAccessToken(user.id, user.email, user.role);
    const newRefresh = await createRefreshToken(user.id);

    await db.session.delete({ where: { id: session.id } });
    await db.session.create({
      data: { userId: user.id, refreshToken: newRefresh },
    });

    return {
      user,
      accessToken,
      refreshToken: newRefresh,
    };
  } catch {
    return null;
  }
}

export async function getUserFromAccessToken(token: string) {
  try {
    const payload = await verifyAccessToken(token);
    const user = await db.user.findUnique({ where: { id: payload.sub } });
    if (!user || user.banned) return null;
    return user;
  } catch {
    return null;
  }
}

export function serializeUser(user: {
  id: string;
  publicId: string;
  email: string;
  role: string;
  twoFactorEnabled: boolean;
  banned?: boolean;
}) {
  return {
    id: user.id,
    publicId: user.publicId,
    email: user.email,
    role: user.role,
    twoFactorEnabled: user.twoFactorEnabled,
  };
}
