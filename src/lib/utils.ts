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

