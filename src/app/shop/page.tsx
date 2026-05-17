"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale } from "@/components/Providers";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import { PLAN_PRICES, previewUsdt } from "@/lib/pricing";

type PaymentInfo = {
  wallet: string;
  amountRub: number;
  amountUsdt: number;
  externalId: string;
  rubPerUsdt?: number;
};

export default function ShopPage() {
  const { t } = useLocale();
  const router = useRouter();
  const [promo, setPromo] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const labels: Record<string, { name: string; desc: string }> = {
    MONTH: { name: t.shop.month, desc: t.shop.perMonth },
    YEAR: { name: t.shop.year, desc: t.shop.perYear },
    LIFETIME: { name: t.shop.lifetime, desc: t.shop.forever },
  };

  async function buy(plan: string) {
    setLoading(plan);
    setPaymentInfo(null);
    const res = await fetch("/api/payment/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ plan, promoCode: promo || undefined }),
    });
    setLoading(null);
    if (res.status === 401) {
      router.push("/auth/login");
      return;
    }
    const data = await res.json();
    if (res.ok) setPaymentInfo(data);
    else alert(data.error || "Error");
  }

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <Reveal className="mb-12 text-center">
        <h1 className="section-title">{t.shop.title}</h1>
        <p className="text-muted mt-3 max-w-lg mx-auto">{t.pricing.subtitle}</p>
      </Reveal>

      <Reveal className="mb-10 flex max-w-md mx-auto gap-2">
        <input
          className="input-field flex-1"
          placeholder={t.shop.promo}
          value={promo}
          onChange={(e) => setPromo(e.target.value.toUpperCase())}
        />
        <button type="button" className="glass-btn" onClick={() => setPromo("")}>
          ✕
        </button>
      </Reveal>

      <Stagger className="grid gap-8 md:grid-cols-3">
        {PLAN_PRICES.map((p) => (
          <StaggerItem key={p.id}>
            <motion.div
              className={`glass-card flex h-full flex-col p-8 ${p.popular ? "pricing-popular" : ""}`}
              data-badge={p.popular ? t.pricing.popular : undefined}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.35 }}
            >
              <h2 className="text-2xl font-bold">{labels[p.id]?.name}</h2>
              <p className="text-muted mt-2 text-sm">{labels[p.id]?.desc}</p>
              <div className="mt-8 flex-1">
                <p className="text-4xl font-extrabold tracking-tight">{p.rub} ₽</p>
                <p className="text-muted mt-2 text-sm">
                  ≈ {previewUsdt(p.rub)} USDT
                </p>
              </div>
              <button
                type="button"
                className="btn-primary mt-8 w-full"
                disabled={loading === p.id}
                onClick={() => buy(p.id)}
              >
                {loading === p.id ? "..." : t.shop.buy}
              </button>
            </motion.div>
          </StaggerItem>
        ))}
      </Stagger>

      <AnimatePresence>
        {paymentInfo && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPaymentInfo(null)}
          >
            <motion.div
              className="glass-card w-full max-w-md p-8"
              initial={{ scale: 0.9, opacity: 0, y: 24 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 22 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-6">{t.shop.payTitle}</h3>

              <div className="space-y-4 text-sm">
                <div className="rounded-xl bg-violet-950/30 p-4 border border-violet-500/20">
                  <p className="text-muted text-xs uppercase tracking-wider mb-1">{t.shop.payRub}</p>
                  <p className="text-2xl font-bold">{paymentInfo.amountRub} ₽</p>
                </div>

                <motion.div
                  className="rounded-xl bg-violet-600/20 p-4 border border-violet-400/30"
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <p className="text-muted text-xs uppercase tracking-wider mb-1">{t.shop.payUsdt}</p>
                  <p className="text-3xl font-extrabold text-violet-200">
                    {Number(paymentInfo.amountUsdt).toFixed(2)} USDT
                  </p>
                  <p className="text-muted mt-2 text-xs">
                    1 USDT ≈ {paymentInfo.rubPerUsdt ?? 92} ₽
                  </p>
                </motion.div>

                <div>
                  <p className="text-muted text-xs mb-1">{t.shop.payWallet}</p>
                  <div className="flex gap-2">
                    <code className="input-field flex-1 text-xs break-all">{paymentInfo.wallet}</code>
                    <button
                      type="button"
                      className="glass-btn shrink-0"
                      onClick={() => copy(paymentInfo.wallet, "wallet")}
                    >
                      {copied === "wallet" ? t.shop.copied : t.shop.copy}
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-muted text-xs mb-1">{t.shop.payMemo}</p>
                  <div className="flex gap-2">
                    <code className="input-field flex-1 text-xs">{paymentInfo.externalId}</code>
                    <button
                      type="button"
                      className="glass-btn shrink-0"
                      onClick={() => copy(paymentInfo.externalId, "memo")}
                    >
                      {copied === "memo" ? t.shop.copied : t.shop.copy}
                    </button>
                  </div>
                </div>

                <p className="text-muted text-xs leading-relaxed pt-2">{t.shop.payNote}</p>
              </div>

              <button type="button" className="glass-btn mt-6 w-full" onClick={() => setPaymentInfo(null)}>
                OK
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
