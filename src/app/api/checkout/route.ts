import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { product, email, phone } = body;

    console.log("Checkout request:", { product, email, phone });

    const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
    const DEV_MODE = process.env.NEXT_PUBLIC_DEV_MODE === "true";

    if (!PAYSTACK_SECRET) {
      console.error("PAYSTACK_SECRET_KEY not configured");
      return NextResponse.json(
        { error: "Paystack configuration missing" },
        { status: 500 }
      );
    }

    // Development mode - return mock response
    if (DEV_MODE) {
      console.log("DEV_MODE: Returning mock Paystack response");
      const mockReference = `ref_dev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      return NextResponse.json({
        success: true,
        authorization_url: `https://checkout.paystack.com/${mockReference}`,
        access_code: mockReference,
        reference: mockReference,
        _dev_mode: true,
        _note: "This is a mock response for development. In production, redirect to the authorization_url",
      });
    }

    // Production mode - call real Paystack API
    // Convert price to kobo (Paystack uses smallest currency unit)
    const amountInKobo = Math.round(product.price * 100);

    console.log("Initializing Paystack with amount (kobo):", amountInKobo);
    console.log("Bearer token format check: starts with 'sk_':", PAYSTACK_SECRET.startsWith("sk_"));

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: email || "customer@buydata.shop",
        amount: amountInKobo,
        metadata: {
          product_id: product.id,
          product_name: product.name,
          recipient_phone: phone.replace(/\D/g, ""),
          network: product.network || "N/A",
          capacity: product.capacity || "N/A",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    console.log("Paystack response status:", response.data.status);

    if (!response.data.status) {
      console.error("Paystack error:", response.data.message);
      return NextResponse.json(
        { error: response.data.message || "Failed to initialize payment" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      authorization_url: response.data.data.authorization_url,
      access_code: response.data.data.access_code,
      reference: response.data.data.reference,
    });
  } catch (error: any) {
    console.error("Paystack API error:", error.message);
    console.error("Error response:", error.response?.data);
    return NextResponse.json(
      {
        error:
          error.response?.data?.message ||
          "Failed to initialize payment. Please try again.",
      },
      { status: 500 }
    );
  }
}
