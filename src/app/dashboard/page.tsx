"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/components/Providers";
type Me = {
  user: { publicId: string; email: string; role: string; twoFactorEnabled: boolean };
  license: { active: boolean; plan: string | null; expiresAt: string | null };
  hwid: string | null;
  sessions: Array<{ id: string; ip: string | null; userAgent: string | null; lastActiveAt: string }>;
  history: Array<{ success: boolean; ip: string | null; createdAt: string }>;
};

export default function DashboardPage() {
  const { t } = useLocale();
  const router = useRouter();
  const [data, setData] = useState<Me | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [totp, setTotp] = useState("");

  async function load() {
    const res = await fetch("/api/user/me", { credentials: "include" });
    if (res.status === 401) {
      router.push("/auth/login");
      return;
    }
    setData(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  async function setup2fa() {
    const res = await fetch("/api/auth/2fa/setup", { method: "POST", credentials: "include" });
    const j = await res.json();
    if (j.qrDataUrl) setQr(j.qrDataUrl);
  }

  async function enable2fa() {
    await fetch("/api/auth/2fa/enable", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ totp }),
    });
    setQr(null);
    load();
  }

  async function resetHwid() {
    const res = await fetch("/api/hwid/reset", { method: "POST", credentials: "include" });
    const j = await res.json();
    alert(JSON.stringify(j, null, 2));
  }

  if (!data) return <p className="p-8 text-center">...</p>;

  const d = t.dashboard;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 space-y-6">
      <h1 className="text-3xl font-bold">{d.title}</h1>

      <section className="glass-card p-6 space-y-2">
        <p><span className="text-violet-300">{d.profileId}:</span> {data.user.publicId}</p>
        <p><span className="text-violet-300">{d.license}:</span> {data.license.active ? d.active : d.expired}</p>
        {data.license.expiresAt && <p><span className="text-violet-300">{d.expires}:</span> {new Date(data.license.expiresAt).toLocaleString()}</p>}
        <p><span className="text-violet-300">{d.hwid}:</span> {data.hwid || d.noHwid}</p>
        <button type="button" className="glass-btn mt-2" onClick={resetHwid}>
          {d.resetHwid} ({d.resetCost})
        </button>
      </section>

      <section className="glass-card p-6">
        <h2 className="font-semibold mb-3">{d.twofa}</h2>
        {data.user.twoFactorEnabled ? (
          <p className="text-green-400">OK</p>
        ) : (
          <div className="space-y-3">
            <button type="button" className="glass-btn" onClick={setup2fa}>{d.enable2fa}</button>
            {qr && <img src={qr} alt="QR" className="mx-auto w-48" />}
            <input className="input-field max-w-xs" value={totp} onChange={(e) => setTotp(e.target.value)} placeholder="123456" />
            <button type="button" className="btn-primary" onClick={enable2fa}>Confirm</button>
          </div>
        )}
      </section>

      <section className="glass-card p-6">
        <h2 className="font-semibold mb-3">{d.sessions}</h2>
        <ul className="text-sm space-y-1 text-violet-100/80">
          {data.sessions.map((s) => (
            <li key={s.id}>{s.ip} — {s.userAgent?.slice(0, 40)} — {new Date(s.lastActiveAt).toLocaleString()}</li>
          ))}
        </ul>
      </section>

      <section className="glass-card p-6">
        <h2 className="font-semibold mb-3">{d.history}</h2>
        <ul className="text-sm space-y-1">
          {data.history.map((h, i) => (
            <li key={i} className={h.success ? "text-green-400" : "text-red-400"}>
              {h.success ? "✓" : "✗"} {h.ip} — {new Date(h.createdAt).toLocaleString()}
            </li>
          ))}
        </ul>
      </section>

      {data.user.role !== "USER" && (
        <a href="/admin" className="btn-primary inline-block">{t.nav.admin}</a>
      )}
    </div>
  );
}
