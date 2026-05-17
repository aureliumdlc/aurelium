import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.EMAIL_FROM || "AureliumDLC <onboarding@resend.dev>";

export async function sendEmail(to: string, subject: string, html: string) {
  if (!resend) {
    console.log("[email stub]", { to, subject });
    return { ok: true, stub: true };
  }
  await resend.emails.send({ from: FROM, to, subject, html });
  return { ok: true };
}

export async function sendPasswordResetEmail(to: string, resetUrl: string, lang: "ru" | "en") {
  const subject = lang === "ru" ? "Сброс пароля — AureliumDLC" : "Password reset — AureliumDLC";
  const html =
    lang === "ru"
      ? `<p>Вы запросили сброс пароля. <a href="${resetUrl}">Нажмите здесь</a>, чтобы задать новый пароль. Ссылка действует 1 час.</p>`
      : `<p>You requested a password reset. <a href="${resetUrl}">Click here</a> to set a new password. Link expires in 1 hour.</p>`;
  return sendEmail(to, subject, html);
}
