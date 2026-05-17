import { db } from "./db";
import { PLAN_DAYS, PRICES } from "./constants";
import type { Plan } from "@/lib/types";

export async function getLicenseStatus(userId: string) {
  const license = await db.license.findUnique({ where: { userId } });
  if (!license) {
    return { active: false, status: "EXPIRED" as const, plan: null, expiresAt: null };
  }

  if (license.plan === "LIFETIME") {
    return {
      active: license.status === "ACTIVE",
      status: license.status,
      plan: license.plan,
      expiresAt: null,
    };
  }

  if (license.expiresAt && license.expiresAt < new Date()) {
    if (license.status === "ACTIVE") {
      await db.license.update({
        where: { userId },
        data: { status: "EXPIRED" },
      });
    }
    return {
      active: false,
      status: "EXPIRED" as const,
      plan: license.plan,
      expiresAt: license.expiresAt,
    };
  }

  return {
    active: license.status === "ACTIVE",
    status: license.status,
    plan: license.plan,
    expiresAt: license.expiresAt,
  };
}

export async function activateLicense(userId: string, plan: Plan) {
  const days = PLAN_DAYS[plan];
  const now = new Date();
  const existing = await db.license.findUnique({ where: { userId } });

  let expiresAt: Date | null = null;
  if (days !== null) {
    const base =
      existing?.expiresAt && existing.expiresAt > now && existing.status === "ACTIVE"
        ? existing.expiresAt
        : now;
    expiresAt = new Date(base.getTime() + days * 24 * 60 * 60 * 1000);
  }

  await db.license.upsert({
    where: { userId },
    create: {
      userId,
      plan,
      status: "ACTIVE",
      expiresAt,
    },
    update: {
      plan,
      status: "ACTIVE",
      expiresAt,
    },
  });
}

export function getPlanPrice(plan: Plan, discountPercent = 0) {
  const base = PRICES[plan];
  return Math.max(1, Math.round(base * (1 - discountPercent / 100)));
}
