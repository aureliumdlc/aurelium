import { error, json } from "@/lib/api";
import { getUserFromRequest, isAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const admin = await getUserFromRequest(req);
  if (!admin || !isAdmin(admin.role)) return error("Forbidden", 403);

  const [
    usersCount,
    bannedCount,
    activeLicenses,
    salesCompleted,
    salesPending,
    salesTotal,
    logins,
    recentPayments,
    salesByDay,
  ] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { banned: true } }),
    db.license.count({ where: { status: "ACTIVE" } }),
    db.payment.count({ where: { status: "COMPLETED" } }),
    db.payment.count({ where: { status: "PENDING" } }),
    db.payment.aggregate({
      where: { status: "COMPLETED" },
      _sum: { amount: true },
    }),
    db.loginHistory.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { user: { select: { email: true, publicId: true } } },
    }),
    db.payment.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { user: { select: { email: true } } },
    }),
    db.payment.findMany({
      where: {
        status: "COMPLETED",
        completedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
      select: { amount: true, completedAt: true },
    }),
  ]);

  const chart: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    chart[d.toISOString().slice(0, 10)] = 0;
  }
  for (const p of salesByDay) {
    if (p.completedAt) {
      const key = p.completedAt.toISOString().slice(0, 10);
      if (chart[key] !== undefined) chart[key] += p.amount;
    }
  }

  return json({
    usersCount,
    bannedCount,
    activeLicenses,
    salesCompleted,
    salesPending,
    revenueRub: salesTotal._sum.amount ?? 0,
    logins,
    recentPayments,
    salesChart: Object.entries(chart).map(([date, revenue]) => ({ date, revenue })),
  });
}
