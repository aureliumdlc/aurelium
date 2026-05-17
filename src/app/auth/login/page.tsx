"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { GlassCard } from "@/components/GlassCard";
import { useLocale } from "@/components/Providers";

export default function LoginPage() {
  const { t } = useLocale();
  const { refresh } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totp, setTotp] = useState("");
  const [need2fa, setNeed2fa] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password, totp: totp || undefined }),
    });
    const data = await res.json();
    if (!res.ok) {
      if (data.error?.includes("2FA")) setNeed2fa(true);
      setErr(data.error || "Error");
      return;
    }
    await refresh();
    router.push("/dashboard");
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <GlassCard hover={false}>
      <form onSubmit={submit} className="liquid-glass-inner space-y-4">
        <h1 className="text-2xl font-bold text-center">{t.auth.login}</h1>
        {err && <p className="text-red-400 text-sm text-center">{err}</p>}
        <input className="input-field" type="email" placeholder={t.auth.email} value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="input-field" type="password" placeholder={t.auth.password} value={password} onChange={(e) => setPassword(e.target.value)} required />
        {need2fa && (
          <input className="input-field" placeholder="2FA code" value={totp} onChange={(e) => setTotp(e.target.value)} maxLength={6} />
        )}
        <button type="submit" className="btn-primary w-full">{t.auth.login}</button>
        <p className="text-center text-sm">
          <Link href="/auth/forgot" className="text-violet-300 hover:underline">{t.auth.forgot}</Link>
        </p>
        <p className="text-center text-sm text-violet-200/70">
          {t.auth.noAccount} <Link href="/auth/register" className="text-violet-300">{t.auth.register}</Link>
        </p>
      </form>
      </GlassCard>
    </div>
  );
}
