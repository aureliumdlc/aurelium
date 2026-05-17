"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { useLocale } from "@/components/Providers";

function ResetForm() {
  const { t } = useLocale();
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/auth/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    if (res.ok) router.push("/auth/login");
  }

  return (
    <form onSubmit={submit} className="glass-card space-y-4 p-8 max-w-md mx-auto mt-16">
      <h1 className="text-2xl font-bold text-center">{t.auth.reset}</h1>
      <input className="input-field" type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required />
      <button type="submit" className="btn-primary w-full">OK</button>
    </form>
  );
}

export default function ResetPage() {
  return (
    <Suspense>
      <ResetForm />
    </Suspense>
  );
}
