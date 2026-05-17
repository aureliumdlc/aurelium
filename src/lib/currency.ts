/** Сколько рублей за 1 USDT (курс). Настраивается в .env */
export function getRubPerUsdt(): number {
  const rate = Number(process.env.USDT_RUB_RATE || "92");
  return rate > 0 ? rate : 92;
}

/** Конвертация ₽ → USDT (округление вверх до 2 знаков для оплаты) */
export function rubToUsdt(amountRub: number): number {
  const usdt = amountRub / getRubPerUsdt();
  return Math.ceil(usdt * 100) / 100;
}

export function formatUsdt(amount: number): string {
  return amount.toFixed(2);
}

export function formatRub(amount: number): string {
  return `${amount} ₽`;
}
