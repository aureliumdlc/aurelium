"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/GlassCard";
import { useAuth } from "@/components/AuthProvider";

type Tab = "overview" | "users" | "payments" | "promos" | "logs" | "online";

export function AdminPanel() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<Tab>("overview");
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);
  const [users, setUsers] = useState<Array<Record<string, unknown>>>([]);
  const [payments, setPayments] = useState<Array<Record<string, unknown>>>([]);
  const [promos, setPromos] = useState<Array<Record<string, unknown>>>([]);
  const [heartbeats, setHeartbeats] = useState<Array<Record<string, unknown>>>([]);
  const [search, setSearch] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [promoType, setPromoType] = useState<"MEDIA" | "DEFAULT">("DEFAULT");
  const [promoDiscount, setPromoDiscount] = useState(10);
  const [payFilter, setPayFilter] = useState("ALL");

  const load = useCallback(async () => {
    const [s, u, p, pr, h] = await Promise.all([
      fetch("/api/admin/stats", { credentials: "include" }),
      fetch(`/api/admin/users?q=${encodeURIComponent(search)}`, { credentials: "include" }),
      fetch("/api/admin/payments", { credentials: "include" }),
      fetch("/api/admin/promos", { credentials: "include" }),
      fetch("/api/admin/heartbeats", { credentials: "include" }),
    ]);
    if (s.status === 403 || s.status === 401) {
      router.push("/dashboard");
      return;
    }
    setStats(await s.json());
    setUsers((await u.json()).users || []);
    setPayments((await p.json()).payments || []);
    setPromos((await pr.json()).promos || []);
    setHeartbeats((await h.json()).heartbeats || []);
  }, [router, search]);

  useEffect(() => {
    if (!authLoading && user && user.role !== "ADMIN" && user.role !== "SUPERADMIN") {
      router.push("/dashboard");
      return;
    }
    if (!authLoading && user) load();
  }, [authLoading, user, load, router]);

  async function userAction(userId: string, action: string, extra?: Record<string, unknown>) {
    await fetch("/api/admin/users", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, action, ...extra }),
    });
    load();
  }

  async function payAction(paymentId: string, action: "confirm" | "reject") {
    await fetch("/api/admin/payments", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentId, action }),
    });
    load();
  }

  async function promoAction(promoId: string, action: "toggle" | "delete") {
    await fetch("/api/admin/promos", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ promoId, action }),
    });
    load();
  }

  async function createPromo() {
    await fetch("/api/admin/promos", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: promoCode, type: promoType, discountPercent: promoDiscount }),
    });
    setPromoCode("");
    load();
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Обзор" },
    { id: "users", label: "Пользователи" },
    { id: "payments", label: "Платежи" },
    { id: "promos", label: "Промокоды" },
    { id: "online", label: "Онлайн" },
    { id: "logs", label: "Логи" },
  ];

  const filteredPayments =
    payFilter === "ALL"
      ? payments
      : payments.filter((p) => (p as { status: string }).status === payFilter);

  if (authLoading) return <p className="p-12 text-center">...</p>;

  return (
    <motion.div
      className="mx-auto max-w-7xl px-4 py-10 space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h1 className="section-title">Панель администратора</h1>

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`admin-tab ${tab === t.id ? "active" : "text-muted"}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
        <button type="button" className="glass-btn ml-auto text-sm" onClick={load}>
          ↻ Обновить
        </button>
      </div>

      <AnimatePresence mode="wait">
        {tab === "overview" && stats && (
          <motion.div key="overview" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            <motion.div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
              {[
                { n: stats.usersCount, l: "Юзеров" },
                { n: stats.activeLicenses, l: "Лицензий" },
                { n: stats.salesCompleted, l: "Продаж" },
                { n: stats.salesPending, l: "Ожидают" },
                { n: `${stats.revenueRub} ₽`, l: "Выручка" },
                { n: stats.bannedCount, l: "Банов" },
              ].map((s) => (
                <GlassCard key={s.l} hover={false} className="!p-0">
                  <div className="liquid-glass-inner py-5 text-center">
                    <p className="stat-number text-2xl">{String(s.n)}</p>
                    <p className="text-muted text-xs mt-1">{s.l}</p>
                  </div>
                </GlassCard>
              ))}
            </motion.div>

            {(stats.salesChart as Array<{ date: string; revenue: number }>)?.length > 0 && (
              <GlassCard>
                <motion.div className="liquid-glass-inner">
                  <h3 className="font-semibold mb-4">Выручка за 7 дней</h3>
                  <div className="flex items-end gap-2 h-32">
                    {(stats.salesChart as Array<{ date: string; revenue: number }>).map((d) => {
                      const max = Math.max(...(stats.salesChart as Array<{ revenue: number }>).map((x) => x.revenue), 1);
                      const h = (d.revenue / max) * 100;
                      return (
                        <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                          <motion.div
                            className="w-full rounded-t-lg bg-gradient-to-t from-violet-700 to-violet-400 min-h-[4px]"
                            initial={{ height: 0 }}
                            animate={{ height: `${h}%` }}
                            transition={{ duration: 0.6 }}
                          />
                          <span className="text-[10px] text-muted">{d.date.slice(5)}</span>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              </GlassCard>
            )}
          </motion.div>
        )}

        {tab === "users" && (
          <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <input
              className="input-field max-w-md"
              placeholder="Поиск email / ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && load()}
            />
            <GlassCard hover={false}>
              <div className="liquid-glass-inner overflow-x-auto p-0">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-muted border-b border-white/10">
                      <th className="p-2">Email</th>
                      <th className="p-2">ID</th>
                      <th className="p-2">Роль</th>
                      <th className="p-2">Лиц.</th>
                      <th className="p-2">HWID</th>
                      <th className="p-2">Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((raw) => {
                      const u = raw as {
                        id: string;
                        email: string;
                        publicId: string;
                        role: string;
                        banned: boolean;
                        license?: { status: string; plan: string; expiresAt?: string };
                        hwid?: { value: string };
                      };
                      return (
                        <tr key={u.id} className={`border-t border-white/5 ${u.banned ? "opacity-50" : ""}`}>
                          <td className="p-2">{u.email}</td>
                          <td className="p-2 font-mono">{u.publicId.slice(0, 8)}…</td>
                          <td className="p-2">{u.role}</td>
                          <td className="p-2">{u.license?.status ?? "—"}</td>
                          <td className="p-2 font-mono">{u.hwid?.value?.slice(0, 8) ?? "—"}</td>
                          <td className="p-2">
                            <motion.div className="flex flex-wrap gap-1">
                              <button type="button" className="glass-btn !px-2 !py-1" onClick={() => userAction(u.id, "grant", { plan: "MONTH" })}>M</button>
                              <button type="button" className="glass-btn !px-2 !py-1" onClick={() => userAction(u.id, "grant", { plan: "YEAR" })}>Y</button>
                              <button type="button" className="glass-btn !px-2 !py-1" onClick={() => userAction(u.id, "grant", { plan: "LIFETIME" })}>∞</button>
                              <button type="button" className="glass-btn !px-2 !py-1" onClick={() => userAction(u.id, "extendDays", { days: 30 })}>+30д</button>
                              <button type="button" className="glass-btn !px-2 !py-1" onClick={() => userAction(u.id, "revoke")}>X</button>
                              <button type="button" className="glass-btn !px-2 !py-1" onClick={() => userAction(u.id, "resetHwid")}>HW</button>
                              <button type="button" className="glass-btn !px-2 !py-1" onClick={() => userAction(u.id, "killSessions")}>S</button>
                              {u.banned ? (
                                <button type="button" className="glass-btn !px-2 !py-1" onClick={() => userAction(u.id, "unban")}>Unban</button>
                              ) : (
                                <button type="button" className="glass-btn !px-2 !py-1 text-red-300" onClick={() => userAction(u.id, "ban")}>Ban</button>
                              )}
                              {user?.role === "SUPERADMIN" && (
                                <>
                                  <button type="button" className="glass-btn !px-2 !py-1" onClick={() => userAction(u.id, "setRole", { role: "ADMIN" })}>A</button>
                                  <button type="button" className="glass-btn !px-2 !py-1" onClick={() => userAction(u.id, "setRole", { role: "USER" })}>U</button>
                                </>
                              )}
                            </motion.div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {tab === "payments" && (
          <motion.div key="payments" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex gap-2">
              {["ALL", "PENDING", "COMPLETED", "FAILED"].map((f) => (
                <button key={f} type="button" className={`admin-tab ${payFilter === f ? "active" : ""}`} onClick={() => setPayFilter(f)}>
                  {f}
                </button>
              ))}
            </div>
            <div className="grid gap-3">
              {filteredPayments.map((raw) => {
                const p = raw as {
                  id: string;
                  amount: number;
                  status: string;
                  type: string;
                  plan?: string;
                  externalId: string;
                  createdAt: string;
                  user?: { email: string };
                };
                return (
                  <GlassCard key={p.id} hover={false}>
                    <div className="liquid-glass-inner flex flex-wrap items-center justify-between gap-3 py-4">
                      <div>
                        <p className="font-medium">{p.user?.email}</p>
                        <p className="text-muted text-xs">{p.type} {p.plan} · {p.amount} ₽ · {p.status}</p>
                        <p className="font-mono text-xs text-muted">{p.externalId}</p>
                      </div>
                      {p.status === "PENDING" && (
                        <div className="flex gap-2">
                          <button type="button" className="btn-primary !py-2 !px-4 text-sm" onClick={() => payAction(p.id, "confirm")}>✓ Подтвердить</button>
                          <button type="button" className="glass-btn text-sm" onClick={() => payAction(p.id, "reject")}>✕</button>
                        </div>
                      )}
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          </motion.div>
        )}

        {tab === "promos" && (
          <motion.div key="promos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <GlassCard>
              <div className="liquid-glass-inner flex flex-wrap gap-2">
                <input className="input-field max-w-[140px]" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} placeholder="CODE" />
                <select className="input-field max-w-[120px]" value={promoType} onChange={(e) => setPromoType(e.target.value as "MEDIA" | "DEFAULT")}>
                  <option value="MEDIA">MEDIA</option>
                  <option value="DEFAULT">DEFAULT</option>
                </select>
                <input className="input-field max-w-[80px]" type="number" value={promoDiscount} onChange={(e) => setPromoDiscount(Number(e.target.value))} />
                <button type="button" className="btn-primary" onClick={createPromo}>Создать</button>
              </div>
            </GlassCard>
            <motion.div className="grid gap-3 sm:grid-cols-2">
              {promos.map((raw) => {
                const pr = raw as { id: string; code: string; type: string; discountPercent: number; active: boolean; usedCount: number; maxUses?: number };
                return (
                  <GlassCard key={pr.id}>
                    <div className="liquid-glass-inner flex justify-between items-center py-3">
                      <div>
                        <p className="font-bold">{pr.code}</p>
                        <p className="text-muted text-sm">{pr.type} · -{pr.discountPercent}% · {pr.usedCount}/{pr.maxUses ?? "∞"}</p>
                      </div>
                      <div className="flex gap-2">
                        <button type="button" className="glass-btn text-xs" onClick={() => promoAction(pr.id, "toggle")}>{pr.active ? "OFF" : "ON"}</button>
                        <button type="button" className="glass-btn text-xs text-red-300" onClick={() => promoAction(pr.id, "delete")}>DEL</button>
                      </div>
                    </div>
                  </GlassCard>
                );
              })}
            </motion.div>
          </motion.div>
        )}

        {tab === "online" && (
          <motion.div key="online" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-muted mb-4 text-sm">Heartbeat за последние 15 мин</p>
            <div className="grid gap-2">
              {heartbeats.slice(0, 30).map((raw) => {
                const h = raw as { id: string; createdAt: string; user?: { email: string; publicId: string } };
                return (
                  <GlassCard key={h.id} hover={false}>
                    <div className="liquid-glass-inner py-3 flex justify-between text-sm">
                      <span>{h.user?.email}</span>
                      <span className="text-muted">{new Date(h.createdAt).toLocaleTimeString()}</span>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          </motion.div>
        )}

        {tab === "logs" && stats && (
          <motion.div key="logs" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <GlassCard hover={false}>
              <motion.div className="liquid-glass-inner max-h-[500px] overflow-y-auto space-y-1 text-sm p-4">
                {(stats.logins as Array<{ success: boolean; ip: string; createdAt: string; user?: { email: string } }>).map((l, i) => (
                  <p key={i} className={l.success ? "text-green-400/90" : "text-red-400/90"}>
                    {l.success ? "✓" : "✗"} {l.user?.email} · {l.ip} · {new Date(l.createdAt).toLocaleString()}
                  </p>
                ))}
              </motion.div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
