"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useLocale } from "@/components/Providers";

export default function RegisterPage() {
  const { t } = useLocale();
  const { refresh } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setErr(data.error || "Error");
      return;
    }
    await refresh();
    router.push("/dashboard");
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <form onSubmit={submit} className="glass-card space-y-4 p-8">
        <h1 className="text-2xl font-bold text-center">{t.auth.register}</h1>
        {err && <p className="text-red-400 text-sm text-center">{err}</p>}
        <input className="input-field" type="email" placeholder={t.auth.email} value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="input-field" type="password" placeholder={t.auth.password} value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required />
        <button type="submit" className="btn-primary w-full">{t.auth.register}</button>
        <p className="text-center text-sm text-violet-200/70">
          {t.auth.hasAccount} <Link href="/auth/login" className="text-violet-300">{t.auth.login}</Link>
        </p>
      </form>
    </div>
  );
}
