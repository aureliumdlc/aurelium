import { generateSecret, generateURI, verify } from "otplib";

export function createTotpSecret() {
  return generateSecret();
}

export function createTotpUri(email: string, secret: string) {
  return generateURI({ issuer: "AureliumDLC", label: email, secret });
}

export async function verifyTotp(token: string, secret: string) {
  const result = await verify({ token, secret });
  return result.valid;
}
