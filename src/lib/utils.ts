import { randomBytes } from "crypto";

export function generatePublicId(): string {
  const hex = randomBytes(16).toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

export function generateHwid(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  const bytes = randomBytes(16);
  for (let i = 0; i < 16; i++) {
    result += chars[bytes[i]! % chars.length];
  }
  return result;
}

export function generateExternalId(): string {
  return `pay_${Date.now()}_${randomBytes(6).toString("hex")}`;
}

export function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
