import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    paystack_configured: !!process.env.PAYSTACK_SECRET_KEY,
    datamart_configured: !!process.env.DATAMART_API_KEY,
    env_sample: {
      paystack_key_starts_with: process.env.PAYSTACK_SECRET_KEY?.substring(0, 10) || "missing",
      datamart_key_starts_with: process.env.DATAMART_API_KEY?.substring(0, 10) || "missing",
    },
  });
}
