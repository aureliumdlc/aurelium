"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useLocale } from "@/components/Providers";
import { GlassCard } from "@/components/GlassCard";
import { ModuleMarquee } from "@/components/home/ModuleMarquee";
import { Float, Reveal, Stagger, StaggerItem } from "@/components/motion";
import { PLAN_PRICES, previewUsdt } from "@/lib/pricing";

const featureKeys = [
  { key: "combat", icon: "⚔" },
  { key: "movement", icon: "🌀" },
  { key: "render", icon: "👁" },
  { key: "player", icon: "🛠" },
  { key: "rotation", icon: "🎯" },
] as const;

export default function HomePage() {
  const { t } = useLocale();
  const f = t.features;

  return (
    <div className="relative overflow-hidden">
      {/* Hero */}
      <section className="relative mx-auto flex min-h-[90vh] max-w-6xl flex-col items-center justify-center px-4 py-20 text-center">
        <Float duration={5}>
          <Image
            src="/logo.png"
            alt="AureliumDLC"
            width={140}
            height={140}
            className="mx-auto mb-8 rounded-2xl"
            priority
          />
        </Float>

        <motion.h1
          className="hero-shimmer mb-6 max-w-4xl text-4xl font-extrabold tracking-tight md:text-6xl lg:text-7xl"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          {t.hero.title}
        </motion.h1>

        <motion.p
          className="text-muted mx-auto mb-4 max-w-2xl text-lg md:text-xl"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          {t.tagline}
        </motion.p>
        <motion.p
          className="text-muted/80 mx-auto mb-10 max-w-xl text-base"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.7 }}
        >
          {t.hero.subtitle}
        </motion.p>

        <motion.div
          className="flex flex-wrap justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.6 }}
        >
          <Link href="/shop" className="btn-primary text-lg px-8 py-4">
            {t.hero.buy}
          </Link>
          <button
            type="button"
            disabled
            className="glass-btn cursor-not-allowed px-8 py-4 text-lg opacity-50"
          >
            {t.hero.download} — {t.hero.soon}
          </button>
        </motion.div>

        <motion.span
          className="text-muted absolute bottom-8 left-1/2 -translate-x-1/2 text-xs tracking-widest uppercase"
          animate={{ y: [0, 8, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        >
          {t.hero.scroll} ↓
        </motion.span>
      </section>

      <ModuleMarquee />

      {/* Stats */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <Stagger className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { n: "40+", l: t.stats.modules },
            { n: "12+", l: t.stats.rotations },
            { n: "99.9%", l: t.stats.uptime },
            { n: "24/7", l: t.stats.support },
          ].map((s) => (
            <StaggerItem key={s.l}>
              <div className="glass-card p-6 text-center">
                <p className="stat-number">{s.n}</p>
                <p className="text-muted mt-2 text-sm">{s.l}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* Why */}
      <section id="why" className="mx-auto max-w-6xl px-4 py-20">
        <Reveal className="mb-12 text-center">
          <h2 className="section-title">{t.why.title}</h2>
        </Reveal>
        <Stagger className="grid gap-6 sm:grid-cols-2">
          {t.why.items.map((item) => (
            <StaggerItem key={item.title}>
              <div className="glass-card h-full p-8">
                <h3 className="mb-3 text-xl font-semibold">{item.title}</h3>
                <p className="text-muted leading-relaxed">{item.desc}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* How */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <Reveal className="mb-14 text-center">
          <h2 className="section-title">{t.how.title}</h2>
        </Reveal>
        <div className="relative grid gap-8 md:grid-cols-4">
          <div className="absolute left-0 right-0 top-8 hidden h-0.5 bg-gradient-to-r from-transparent via-violet-500/30 to-transparent md:block" />
          {t.how.steps.map((step, i) => (
            <Reveal key={step.title} delay={i * 0.1}>
              <div className="glass-card relative p-6 text-center">
                <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-violet-600/20 text-lg font-bold text-violet-300">
                  {i + 1}
                </span>
                <h3 className="mb-2 font-semibold">{step.title}</h3>
                <p className="text-muted text-sm">{step.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-20">
        <Reveal className="mb-4 text-center">
          <h2 className="section-title">{f.title}</h2>
          <p className="text-muted mt-3">{f.subtitle}</p>
        </Reveal>
        <Stagger className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featureKeys.map(({ key, icon }) => (
            <StaggerItem key={key}>
              <div className="glass-card group h-full p-6">
                <div className="feature-icon">{icon}</div>
                <h3 className="mb-2 text-lg font-semibold">
                  {f[`${key}` as "combat" | "movement" | "render" | "player" | "rotation"]}
                </h3>
                <p className="text-muted mb-3 text-sm leading-relaxed">
                  {f[`${key}Desc` as "combatDesc"]}
                </p>
                <p className="text-xs font-medium tracking-wide text-violet-400/90 uppercase">
                  {f[`${key}List` as "combatList"]}
                </p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* Compare */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <Reveal className="mb-10 text-center">
          <h2 className="section-title">{t.compare.title}</h2>
        </Reveal>
        <Reveal>
          <div className="glass-card overflow-x-auto p-4 md:p-6">
            <table className="w-full min-w-[480px] text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="p-3 text-left">{t.compare.feature}</th>
                  <th className="p-3 text-center">{t.compare.month}</th>
                  <th className="p-3 text-center">{t.compare.year}</th>
                  <th className="p-3 text-center">{t.compare.life}</th>
                </tr>
              </thead>
              <tbody>
                {t.compare.rows.map((row) => (
                  <tr key={row[0]} className="border-b border-white/5 transition-colors hover:bg-violet-500/5">
                    <td className="p-3 font-medium">{row[0]}</td>
                    <td className="p-3 text-center">{row[1]}</td>
                    <td className="p-3 text-center">{row[2]}</td>
                    <td className="p-3 text-center">{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </section>

      {/* Pricing preview */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <Reveal className="mb-4 text-center">
          <h2 className="section-title">{t.pricing.title}</h2>
          <p className="text-muted mt-3">{t.pricing.subtitle}</p>
        </Reveal>
        <Stagger className="mt-12 grid gap-6 md:grid-cols-3">
          {PLAN_PRICES.map((p) => {
            const names = { MONTH: t.shop.month, YEAR: t.shop.year, LIFETIME: t.shop.lifetime };
            const descs = { MONTH: t.shop.perMonth, YEAR: t.shop.perYear, LIFETIME: t.shop.forever };
            return (
              <StaggerItem key={p.id}>
                <div
                  className={`glass-card flex h-full flex-col p-8 ${p.popular ? "pricing-popular" : ""}`}
                  data-badge={p.popular ? t.pricing.popular : undefined}
                >
                  <h3 className="text-xl font-bold">{names[p.id]}</h3>
                  <p className="text-muted mt-1 text-sm">{descs[p.id]}</p>
                  <p className="mt-6 text-4xl font-extrabold">{p.rub} ₽</p>
                  <p className="text-muted mt-1 text-sm">≈ {previewUsdt(p.rub)} USDT</p>
                  <Link href="/shop" className="btn-primary mt-8 w-full text-center">
                    {t.shop.buy}
                  </Link>
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>
        <Reveal className="mt-10 text-center">
          <Link href="/shop" className="glass-btn px-8 py-3">
            {t.pricing.cta} →
          </Link>
        </Reveal>
      </section>

      {/* Requirements */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <Reveal>
          <div className="glass-card mx-auto max-w-2xl p-10 text-center">
            <h2 className="section-title mb-8">{t.requirements.title}</h2>
            <ul className="text-muted grid gap-3 text-left sm:grid-cols-2 sm:gap-4">
              <li className="flex items-center gap-3">💾 {t.requirements.ram}</li>
              <li className="flex items-center gap-3">⚡ {t.requirements.cpu}</li>
              <li className="flex items-center gap-3">🖥 {t.requirements.gpu}</li>
              <li className="flex items-center gap-3">🪟 {t.requirements.os}</li>
            </ul>
          </div>
        </Reveal>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl px-4 py-20">
        <Reveal className="mb-10 text-center">
          <h2 className="section-title">{t.faq.title}</h2>
        </Reveal>
        <Reveal>
          <div className="glass-card px-6 md:px-8">
            {t.faq.items.map((item) => (
              <details key={item.q} className="faq-item group">
                <summary className="flex items-center justify-between gap-4">
                  {item.q}
                  <span className="text-violet-400 transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="faq-answer">{item.a}</p>
              </details>
            ))}
          </div>
        </Reveal>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-24">
        <Reveal>
          <motion.div
            className="glass-card relative overflow-hidden px-8 py-16 text-center md:px-16"
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="section-title mb-4">{t.cta.title}</h2>
            <p className="text-muted mx-auto mb-8 max-w-lg">{t.cta.subtitle}</p>
            <Link href="/shop" className="btn-primary text-lg px-10 py-4">
              {t.cta.button}
            </Link>
          </motion.div>
        </Reveal>
      </section>
    </div>
  );
}
