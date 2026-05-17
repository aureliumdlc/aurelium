"use client";

import Link from "next/link";
import { SUPPORT } from "@/lib/constants";
import { useLocale } from "./Providers";

export function Footer() {
  const { t } = useLocale();
  return (
    <footer className="mt-auto border-t border-white/10 bg-black/20 py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 text-sm text-violet-200/70 md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} AureliumDLC</p>
        <div className="flex flex-wrap gap-4">
          <a href={`https://t.me/${SUPPORT.telegram.replace("@", "")}`} target="_blank" rel="noreferrer">
            Telegram {SUPPORT.telegram}
          </a>
          <a href={`mailto:${SUPPORT.email}`}>{SUPPORT.email}</a>
          <Link href="/legal/privacy">{t.footer.privacy}</Link>
          <Link href="/legal/terms">{t.footer.terms}</Link>
        </div>
      </div>
    </footer>
  );
}
