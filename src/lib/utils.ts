import { hash, compare } from "bcryptjs";

// Generate a unique shortened slug for agent (e.g., "great-data-17687")
export function generateAgentSlug(businessName: string): string {
  const sanitized = businessName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 20);

  const timestamp = Date.now().toString().slice(-5);
  return `${sanitized}-${timestamp}`;
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12);
}

// Verify password
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return compare(password, hashedPassword);
}

// Format currency (GHS)
export function formatGHS(amount: number): string {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
  }).format(amount);
}

// Convert GHS to Kobo (for Paystack)
export function convertToKobo(ghs: number): number {
  return Math.round(ghs * 100);
}

// Generate unique reference for Paystack
export function generateReference(prefix: string = "ref"): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}_${random}`;
}

// Validate email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate phone (Ghana format)
export function isValidPhoneGH(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, "");
  return cleaned.length >= 10;
}

// Format date
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-GH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
