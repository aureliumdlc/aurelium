"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "./AuthProvider";
import { useLocale, useTheme } from "./Providers";

export function Navbar() {
  const { t, locale, setLocale } = useLocale();
  const { theme, setTheme } = useTheme();
  const { user, logout, loading } = useAuth();

  return (
    <motion.header
      className="sticky top-0 z-50 border-b border-white/5 bg-[var(--bg)]/80 backdrop-blur-xl"
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-3 group">
          <motion.div whileHover={{ rotate: [0, -5, 5, 0] }} transition={{ duration: 0.5 }}>
            <Image src="/logo.png" alt="AureliumDLC" width={42} height={42} className="rounded-xl" />
          </motion.div>
          <span className="text-lg font-bold tracking-tight group-hover:text-violet-300 transition-colors">
            {t.brand}
          </span>
        </Link>

        <nav className="hidden items-center gap-1 text-sm md:flex">
          {[
            { href: "/", label: t.nav.home },
            { href: "/#features", label: t.nav.features },
            { href: "/shop", label: t.nav.shop },
            { href: "/#faq", label: t.nav.faq },
            { href: "/dashboard", label: t.nav.dashboard },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-[var(--muted)] transition-colors hover:bg-violet-500/10 hover:text-[var(--fg)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setLocale(locale === "ru" ? "en" : "ru")}
            className="glass-btn px-2.5 py-1.5 text-xs font-semibold uppercase"
          >
            {locale}
          </button>
          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="glass-btn px-2.5 py-1.5 text-sm"
          >
            {theme === "dark" ? "☀" : "☾"}
          </button>
          {!loading && user ? (
            <>
              <Link href="/dashboard" className="glass-btn hidden sm:inline-flex text-sm max-w-[140px] truncate">
                {user.email.split("@")[0]}
              </Link>
              {(user.role === "ADMIN" || user.role === "SUPERADMIN") && (
                <Link href="/admin" className="glass-btn text-sm">Admin</Link>
              )}
              <button type="button" className="glass-btn text-sm" onClick={() => logout()}>
                Exit
              </button>
            </>
          ) : (
            <Link href="/auth/login" className="glass-btn hidden sm:inline-flex text-sm">
              {t.nav.login}
            </Link>
          )}
          <Link href="/shop" className="btn-primary text-sm">
            {t.hero.buy}
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
