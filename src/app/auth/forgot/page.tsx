"use client";

import { useState } from "react";
import { useLocale } from "@/components/Providers";

export default function ForgotPage() {
  const { t, locale } = useLocale();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/auth/forgot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, lang: locale }),
    });
    setSent(true);
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <form onSubmit={submit} className="glass-card space-y-4 p-8">
        <h1 className="text-2xl font-bold text-center">{t.auth.reset}</h1>
        {sent ? (
          <p className="text-center text-sm text-violet-200/80">OK</p>
        ) : (
          <>
            <input className="input-field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t.auth.email} required />
            <button type="submit" className="btn-primary w-full">{t.auth.sendReset}</button>
          </>
        )}
      </form>
    </div>
  );
}
