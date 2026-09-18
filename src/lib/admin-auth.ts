import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "buydata_admin_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

function secret() {
  return process.env.ADMIN_SESSION_SECRET || "";
}

function signature(value: string) {
  return createHmac("sha256", secret()).update(value).digest("hex");
}

export function isAdminConfigured() {
  return Boolean(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD && secret());
}

export function credentialsMatch(email: string, password: string) {
  return email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD;
}

export function createAdminSession() {
  const issuedAt = String(Date.now());
  const value = `${issuedAt}.${signature(issuedAt)}`;
  return value;
}

export function isValidAdminSession(value?: string) {
  if (!value || !secret()) return false;
  const [issuedAt, providedSignature] = value.split(".");
  const timestamp = Number(issuedAt);
  if (!Number.isFinite(timestamp) || Date.now() - timestamp > SESSION_MAX_AGE * 1000) return false;
  const expectedSignature = signature(issuedAt);
  const provided = Buffer.from(providedSignature || "", "hex");
  const expected = Buffer.from(expectedSignature, "hex");
  return provided.length === expected.length && timingSafeEqual(provided, expected);
}

export async function isAdminRequest() {
  const cookieStore = await cookies();
  return isValidAdminSession(cookieStore.get(COOKIE_NAME)?.value);
}

export { COOKIE_NAME, SESSION_MAX_AGE };
