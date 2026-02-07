import { NextResponse } from "next/server";

export async function GET() {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;

  if (!secretKey || !publicKey) {
    return NextResponse.json({
      error: "Paystack keys not configured",
      secretKeyPresent: !!secretKey,
      publicKeyPresent: !!publicKey,
    });
  }

  // Only show if it's test or live keys (don't expose full key)
  const isTestSecret = secretKey.startsWith("sk_test_");
  const isTestPublic = publicKey.startsWith("pk_test_");

  return NextResponse.json({
    success: true,
    paystackMode: isTestSecret && isTestPublic ? "TEST" : "LIVE",
    secretKeyMode: isTestSecret ? "TEST" : "LIVE",
    publicKeyMode: isTestPublic ? "TEST" : "LIVE",
    secretKeyPreview: `${secretKey.substring(0, 10)}...${secretKey.substring(secretKey.length - 4)}`,
    publicKeyPreview: `${publicKey.substring(0, 10)}...${publicKey.substring(publicKey.length - 4)}`,
  });
}
