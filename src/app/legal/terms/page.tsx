"use client";

import { useLocale } from "@/components/Providers";

export default function TermsPage() {
  const { t, locale } = useLocale();
  const ru = locale === "ru";
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 glass-card">
      <h1 className="text-2xl font-bold mb-4">{t.legal.termsTitle}</h1>
      {ru ? (
        <ul className="space-y-2 text-violet-100/80 list-disc pl-5">
          <li>Подписка предоставляет доступ к программному клиенту AureliumDLC.</li>
          <li>Возврат средств не предусмотрен после активации лицензии.</li>
          <li>Пользователь несёт ответственность за использование на серверах.</li>
          <li>Проект не аффилирован с Mojang/Microsoft.</li>
        </ul>
      ) : (
        <ul className="space-y-2 text-violet-100/80 list-disc pl-5">
          <li>Subscription grants access to the AureliumDLC software client.</li>
          <li>No refunds after license activation.</li>
          <li>You are responsible for usage on game servers.</li>
          <li>Not affiliated with Mojang/Microsoft.</li>
        </ul>
      )}
    </article>
  );
}
