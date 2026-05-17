"use client";

import { useLocale } from "@/components/Providers";

export default function PrivacyPage() {
  const { t, locale } = useLocale();
  const ru = locale === "ru";
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 glass-card prose prose-invert">
      <h1>{t.legal.privacyTitle}</h1>
      {ru ? (
        <>
          <p>Мы собираем email, данные сессий и HWID для работы подписки AureliumDLC.</p>
          <p>Данные не передаются третьим лицам, кроме платёжных провайдеров.</p>
          <p>По вопросам: aureliumdlc@gmail.com</p>
        </>
      ) : (
        <>
          <p>We collect email, session data and HWID to operate your AureliumDLC subscription.</p>
          <p>Data is not shared with third parties except payment processors.</p>
          <p>Contact: aureliumdlc@gmail.com</p>
        </>
      )}
    </article>
  );
}
